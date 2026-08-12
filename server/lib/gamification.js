// ============================================================
// server/lib/gamification.js — O'YINLASHTIRISH YADROSI (Redis)
// ============================================================
// Saytning yangi raqobat tizimlari — hammasi SERVERDA boshqariladi:
//
//   1) LEADERBOARD (global reyting)
//      - Redis ZSET: `lh:leaderboard` (member = uid, score = ball)
//      - Meta: `lh:meta:{uid}` (name, lessons, coins, streak, lang)
//
//   2) DAILY BONUS (kunlik bepul tanga — cheat qilib bo'lmaydi)
//      - `lh:bonus:{uid}` → { date: "2026-08-12", streak: N }
//      - Server vaqtiga qarab bir kunda FAQAT bir marta beriladi.
//        Bonus = 10 + streak * 2 (maks. 60) — har kuni kelsangiz oshadi!
//
//   3) TOURNAMENT (haftalik turnir)
//      - `lh:tournament:{YYYY-WW}` ZSET (shu hafta reytingi)
//      - `lh:prize:{YYYY-WW}:{uid}` → 1 — mukofot olinganini bildiradi
//      - Hafta oxirida TOP-3: 1-o'rin 200🪙, 2-o'rin 100🪙, 3-o'rin 50🪙
//
//   4) STATS (server-side statistika — sayt egasi uchun)
//      - `lh:stat:lesson:{YYYY-MM-DD}`      — kunlik tugallangan darslar
//      - `lh:stat:lang:{YYYY-MM-DD}:{lang}` — qaysi til ommabop
//      - `lh:stat:hour:{YYYY-MM-DD}:{HH}`   — eng faol soatlar
//      - `lh:stat:users` SET                — unikal foydalanuvchilar
//
// Redis sozlanmagan bo'lsa (UPSTASH_REDIS_* yo'q) — in-memory demo rejim:
// bitta serverless instansiyada ishlaydi (sayt hech qachon buzilmaydi).

import { redis } from './redis.js';

// In-memory fallback store (Redis bo'lmaganda)
const mem = new Map();
const DAY_MS = 86400000;

function dayKey(ts = Date.now()) {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// Hafta kaliti: "2026-33" (ISO hafta raqami)
export function weekKey(ts = Date.now()) {
  const d = new Date(ts);
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date - yearStart) / DAY_MS + 1) / 7);
  return `${date.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`;
}

// Hafta oxiri (dushanba 00:00) — countdown uchun
export function weekEndsAt(ts = Date.now()) {
  const d = new Date(ts);
  const day = d.getDay() === 0 ? 7 : d.getDay(); // 1=Dushanba ... 7=Yakshanba
  const daysToNextMonday = 8 - day;
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + daysToNextMonday, 0, 0, 0, 0);
  return end.getTime();
}

// Oldingi hafta kaliti (mukofot tekshiruvi uchun)
export function prevWeekKey(ts = Date.now()) {
  return weekKey(ts - 7 * DAY_MS);
}

function memGet(key) {
  try {
    const v = mem.get(key);
    if (v === undefined || v === null) return null;
    return typeof v === 'string' ? v : JSON.stringify(v);
  } catch {
    return null;
  }
}
function memSet(key, value) {
  mem.set(key, typeof value === 'string' ? value : JSON.stringify(value));
  // Xotirani cheklash — eng eski 2000 dan ortiq bo'lsa tozalaymiz
  if (mem.size > 2000) {
    const keys = [...mem.keys()].slice(0, mem.size - 1500);
    keys.forEach((k) => mem.delete(k));
  }
}

// ---------- 1) LEADERBOARD ----------

const LB_KEY = 'lh:leaderboard';

export async function updateLeaderboardScore(entry) {
  const { uid, score, name, lessons, coins, streak, lang } = entry;
  if (!uid) return false;
  const metaKey = `lh:meta:${uid}`;
  if (redis) {
    try {
      await redis.zadd(LB_KEY, { score: Math.round(score || 0), member: uid });
      await redis.hset(metaKey, {
        name: String(name || 'O\'quvchi').slice(0, 30),
        lessons: String(lessons || 0),
        coins: String(coins || 0),
        streak: String(streak || 0),
        lang: String(lang || ''),
        updatedAt: String(Date.now()),
      });
      await redis.expire(metaKey, 60 * 60 * 24 * 30);
      return true;
    } catch {
      return false;
    }
  }
  memSet(LB_KEY, { ...JSON.parse(memGet(LB_KEY) || '{}'), [uid]: score });
  memSet(metaKey, { name: String(name || 'O\'quvchi'), lessons, coins, streak, lang, updatedAt: Date.now() });
  return true;
}

export async function getLeaderboard({ limit = 50, uid } = {}) {
  if (redis) {
    try {
      const raw = await redis.zrevrange(LB_KEY, 0, limit - 1, { withScores: true });
      const uids = [];
      for (let i = 0; i < raw.length; i += 2) uids.push(raw[i]);

      // Pipeline: hgetall'larni YAGONA HTTP so'rovda birlashtiramiz (N+1 emas)
      let metas = [];
      if (uids.length > 0) {
        try {
          const pipe = redis.pipeline();
          uids.forEach((u) => pipe.hgetall(`lh:meta:${u}`));
          metas = await pipe.exec();
        } catch {
          metas = await Promise.all(uids.map((u) => redis.hgetall(`lh:meta:${u}`).catch(() => ({}))));
        }
      }

      const entries = uids.map((u, i) => {
        const meta = metas[i] || {};
        return {
          uid: u,
          name: meta?.name || 'O\'quvchi',
          score: Number(raw[i * 2 + 1]) || 0,
          lessons: Number(meta?.lessons) || 0,
          coins: Number(meta?.coins) || 0,
          streak: Number(meta?.streak) || 0,
          lang: meta?.lang || '',
        };
      });

      let myRank = -1;
      let myScore = 0;
      if (uid) {
        const rank = await redis.zrevrank(LB_KEY, uid);
        myRank = rank === null || rank === undefined ? -1 : rank + 1;
        const s = await redis.zscore(LB_KEY, uid);
        myScore = Number(s) || 0;
      }
      return { ok: true, mode: 'redis', entries, myRank, myScore };
    } catch {
      return { ok: false, fallback: true };
    }
  }
  // In-memory
  try {
    const map = JSON.parse(memGet(LB_KEY) || '{}');
    const entries = Object.entries(map)
      .map(([u, score]) => {
        const meta = JSON.parse(memGet(`lh:meta:${u}`) || '{}');
        return { uid: u, name: meta.name || 'O\'quvchi', score: Number(score) || 0, lessons: meta.lessons || 0, coins: meta.coins || 0, streak: meta.streak || 0, lang: meta.lang || '' };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    const myRank = uid ? entries.findIndex((e) => e.uid === uid) : -1;
    return { ok: true, mode: 'memory', entries, myRank: myRank >= 0 ? myRank + 1 : -1, myScore: myRank >= 0 ? entries[myRank].score : 0 };
  } catch {
    return { ok: false, fallback: true };
  }
}

// ---------- 2) DAILY BONUS ----------

const BONUS_BASE = 10;
const BONUS_PER_STREAK = 2;
const BONUS_MAX = 60;

// Bonus formulasi: keyingi olinadigan bonus = BASE + streak * PER_STREAK
// (streak = hozirgi uzluksiz kunlar soni; 0-kun → 10, 1-kun → 12, ... 25-kun → 60)
function nextBonusAmount(streak) {
  return Math.min(BONUS_BASE + Number(streak || 0) * BONUS_PER_STREAK, BONUS_MAX);
}

// Bonus holati: { claimed: bool, streak, nextAmount, lastClaimDate }
export async function getDailyBonusStatus(uid) {
  const today = dayKey();
  if (!uid) return { ok: true, claimed: false, streak: 0, nextAmount: BONUS_BASE, lastClaimDate: null };

  const readData = async () => {
    if (redis) {
      const raw = await redis.get(`lh:bonus:${uid}`).catch(() => null);
      return raw ? JSON.parse(raw) : null;
    }
    try {
      return JSON.parse(memGet(`lh:bonus:${uid}`) || 'null');
    } catch {
      return null;
    }
  };

  const data = await readData();
  if (!data) return { ok: true, claimed: false, streak: 0, nextAmount: BONUS_BASE, lastClaimDate: null };

  const claimed = data.date === today;
  // Streak: kecha olingan bo'lsa davom etadi, aks holda 0 dan boshlanadi
  const yesterday = dayKey(Date.now() - DAY_MS);
  const streak = data.date === yesterday || data.date === today ? Number(data.streak) || 0 : 0;
  // nextAmount — KEYINGI olinadigan bonus (bugun olingan bo'lsa ertangi kun)
  const nextAmount = nextBonusAmount(streak);
  return { ok: true, claimed, streak, nextAmount, lastClaimDate: data.date };
}

// Kunlik bonusni olish — SERVER vaqtiga asoslanadi (cheat qilib bo'lmaydi).
// Atomic: Redis `SETNX` flag — ikki parallel so'rov bir-biriga qo'shib
// berolmaydi (race condition yo'q).
// Qaytaradi: { ok, granted, newStreak, alreadyClaimed }
export async function claimDailyBonus(uid) {
  if (!uid) return { ok: false, error: 'uid yo\'q' };
  const today = dayKey();
  const yesterday = dayKey(Date.now() - DAY_MS);

  // Avvalgi yozuvni o'qish (Redis yoki xotira) — streak va takrorlashni tekshirish uchun
  const readPrev = async () => {
    if (redis) {
      const raw = await redis.get(`lh:bonus:${uid}`).catch(() => null);
      return raw ? JSON.parse(raw) : null;
    }
    try {
      return JSON.parse(memGet(`lh:bonus:${uid}`) || 'null');
    } catch {
      return null;
    }
  };

  const prev = await readPrev();
  if (prev && prev.date === today) {
    return { ok: true, granted: 0, newStreak: Number(prev.streak) || 0, alreadyClaimed: true };
  }

  // Streak: kecha olingan bo'lsa davom etadi, aks holda 1 dan boshlanadi
  const prevStreak = prev && prev.date === yesterday ? Number(prev.streak) || 0 : 0;
  const newStreak = prevStreak + 1;
  const granted = nextBonusAmount(prevStreak); // OLINGAN bonus = avvalgi streak asosida

  // 1) Atomic flag: kuniga bir marta. SETNX muvaffaqiyatli bo'lsa — birinchi so'rov.
  if (redis) {
    try {
      const flagKey = `lh:bonusflag:${today}:${uid}`;
      const first = await redis.set(flagKey, '1', { nx: true, ex: 60 * 60 * 26 });
      if (!first) {
        // Ikkinchi parallel so'rov — flag allaqachon o'rnatilgan, takror berilmaydi
        return { ok: true, granted: 0, newStreak: Number(prev?.streak) || 0, alreadyClaimed: true };
      }
      // Birinchi so'rov: bonus yozuvini Redis'ga saqlaymiz (streak davom etadi)
      await redis.set(`lh:bonus:${uid}`, JSON.stringify({ date: today, streak: newStreak }), { ex: 60 * 60 * 24 * 3 }).catch(() => {});
      await trackUserActivity(uid);
      return { ok: true, granted, newStreak, alreadyClaimed: false };
    } catch {
      // Redis xatosi — in-memory'ga tushamiz (keyingi blok)
    }
  }

  // 2) In-memory (bitta instansiya — JS single-thread, xavfsiz)
  memSet(`lh:bonus:${uid}`, { date: today, streak: newStreak });
  await trackUserActivity(uid);
  return { ok: true, granted, newStreak, alreadyClaimed: false };
}

// ---------- 3) TOURNAMENT ----------

const TOURNAMENT_PRIZES = [200, 100, 50];

export async function updateTournamentScore(entry) {
  const { uid, week, score, name, lessons, coins, streak, lang } = entry;
  if (!uid || !week) return false;
  const zKey = `lh:tournament:${week}`;
  const metaKey = `lh:tmeta:${week}:${uid}`;
  if (redis) {
    try {
      await redis.zadd(zKey, { score: Math.round(score || 0), member: uid });
      await redis.hset(metaKey, {
        name: String(name || 'O\'quvchi').slice(0, 30),
        lessons: String(lessons || 0),
        coins: String(coins || 0),
        streak: String(streak || 0),
        lang: String(lang || ''),
      });
      await redis.expire(zKey, 60 * 60 * 24 * 21); // 3 hafta
      return true;
    } catch {
      return false;
    }
  }
  memSet(zKey, { ...JSON.parse(memGet(zKey) || '{}'), [uid]: score });
  memSet(metaKey, { name: String(name || 'O\'quvchi'), lessons, coins, streak, lang });
  return true;
}

export async function getTournament({ week, limit = 20, uid } = {}) {
  const w = week || weekKey();
  const zKey = `lh:tournament:${w}`;
  if (redis) {
    try {
      const raw = await redis.zrevrange(zKey, 0, limit - 1, { withScores: true });
      const uids = [];
      for (let i = 0; i < raw.length; i += 2) uids.push(raw[i]);

      // Pipeline: barcha meta'larni bitta so'rovda olamiz
      let metas = [];
      if (uids.length > 0) {
        try {
          const pipe = redis.pipeline();
          uids.forEach((u) => pipe.hgetall(`lh:tmeta:${w}:${u}`));
          metas = await pipe.exec();
        } catch {
          metas = await Promise.all(uids.map((u) => redis.hgetall(`lh:tmeta:${w}:${u}`).catch(() => ({}))));
        }
      }

      const entries = uids.map((u, i) => {
        const meta = metas[i] || {};
        return {
          uid: u,
          name: meta?.name || 'O\'quvchi',
          score: Number(raw[i * 2 + 1]) || 0,
          lessons: Number(meta?.lessons) || 0,
          coins: Number(meta?.coins) || 0,
          streak: Number(meta?.streak) || 0,
          lang: meta?.lang || '',
        };
      });
      let myRank = -1;
      let myScore = 0;
      if (uid) {
        const rank = await redis.zrevrank(zKey, uid);
        myRank = rank === null || rank === undefined ? -1 : rank + 1;
        const s = await redis.zscore(zKey, uid);
        myScore = Number(s) || 0;
      }
      return { ok: true, mode: 'redis', week: w, entries, myRank, myScore };
    } catch {
      return { ok: false, fallback: true };
    }
  }
  try {
    const map = JSON.parse(memGet(zKey) || '{}');
    const entries = Object.entries(map)
      .map(([u, score]) => {
        const meta = JSON.parse(memGet(`lh:tmeta:${w}:${u}`) || '{}');
        return { uid: u, name: meta.name || 'O\'quvchi', score: Number(score) || 0, lessons: meta.lessons || 0, coins: meta.coins || 0, streak: meta.streak || 0, lang: meta.lang || '' };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    const myRank = uid ? entries.findIndex((e) => e.uid === uid) : -1;
    return { ok: true, mode: 'memory', week: w, entries, myRank: myRank >= 0 ? myRank + 1 : -1, myScore: myRank >= 0 ? entries[myRank].score : 0 };
  } catch {
    return { ok: false, fallback: true };
  }
}

// O'tgan hafta TOP-3 bo'lgan foydalanuvchi mukofotini tekshiradi.
// Qaytaradi: { ok, prize, rank } — olingan bo'lsa prize > 0
export async function getTournamentPrize(uid) {
  if (!uid) return { ok: true, prize: 0, rank: -1 };
  const prev = prevWeekKey();
  const t = await getTournament({ week: prev, limit: 3, uid });
  if (!t.ok || t.myRank < 1 || t.myRank > 3) return { ok: true, prize: 0, rank: -1 };
  const prize = TOURNAMENT_PRIZES[t.myRank - 1];

  // Allaqachon olinganmi?
  if (redis) {
    try {
      const claimed = await redis.get(`lh:prize:${prev}:${uid}`);
      if (claimed) return { ok: true, prize: 0, rank: t.myRank };
    } catch { /* noop */ }
  } else {
    const claimed = memGet(`lh:prize:${prev}:${uid}`);
    if (claimed) return { ok: true, prize: 0, rank: t.myRank };
  }
  return { ok: true, prize, rank: t.myRank };
}

export async function claimTournamentPrize(uid) {
  const info = await getTournamentPrize(uid);
  if (!info.ok || info.prize <= 0) {
    return { ok: true, granted: 0, alreadyClaimed: true };
  }
  const prev = prevWeekKey();
  if (redis) {
    await redis.set(`lh:prize:${prev}:${uid}`, '1', { ex: 60 * 60 * 24 * 30 }).catch(() => {});
  } else {
    memSet(`lh:prize:${prev}:${uid}`, '1');
  }
  return { ok: true, granted: info.prize, rank: info.rank, alreadyClaimed: false };
}

// ---------- 4) SERVER-SIDE STATISTIKA ----------

// Foydalanuvchi faolligini qayd qiladi (unikal userlar uchun)
export async function trackUserActivity(uid) {
  if (!uid) return;
  if (redis) {
    try {
      await redis.sadd('lh:stat:users', uid);
    } catch { /* noop */ }
  } else {
    try {
      const set = new Set(JSON.parse(memGet('lh:stat:users') || '[]'));
      set.add(uid);
      memSet('lh:stat:users', [...set]);
    } catch { /* noop */ }
  }
}

// Hodisani qayd qiladi: { type: 'lesson'|'visit'|'lang', lang?, hour? }
// lesson — tugallangan dars; visit — saytga tashrif; lang — til tanlash
export async function trackStat({ type, lang, hour }) {
  const date = dayKey();
  const h = String(hour !== undefined ? hour : new Date().getHours()).padStart(2, '0');

  const incr = async (key, ex) => {
    if (redis) {
      try {
        const n = await redis.incr(key);
        if (n === 1 && ex) await redis.expire(key, ex);
      } catch { /* noop */ }
    } else {
      try {
        const cur = Number(memGet(key)) || 0;
        memSet(key, cur + 1);
      } catch { /* noop */ }
    }
  };

  await incr(`lh:stat:${type}:${date}`, 60 * 60 * 24 * 5);
  if (lang) await incr(`lh:stat:lang:${date}:${String(lang).slice(0, 20)}`, 60 * 60 * 24 * 5);
  await incr(`lh:stat:hour:${date}:${h}`, 60 * 60 * 24 * 5);
}

// Sayt egasi uchun umumiy statistika (admin tab)
export async function getServerStats() {
  const today = dayKey();
  const yesterday = dayKey(Date.now() - DAY_MS);
  const read = async (key) => {
    if (redis) {
      try {
        return Number(await redis.get(key)) || 0;
      } catch {
        return 0;
      }
    }
    return Number(memGet(key)) || 0;
  };

  const readCounters = async (prefix) => {
    if (redis) {
      try {
        const keys = await redis.keys(`${prefix}:${today}:*`);
        const out = {};
        for (const k of keys) {
          const label = k.split(':').pop();
          out[label] = Number(await redis.get(k)) || 0;
        }
        return out;
      } catch {
        return {};
      }
    }
    // In-memory: prefix:date:label kalitlarini skanerlaymiz
    const out = {};
    for (const [k, v] of mem.entries()) {
      if (k.startsWith(`${prefix}:${today}:`)) {
        out[k.split(':').pop()] = Number(v) || 0;
      }
    }
    return out;
  };

  const userCount = async () => {
    if (redis) {
      try {
        return await redis.scard('lh:stat:users');
      } catch {
        return 0;
      }
    }
    try {
      return JSON.parse(memGet('lh:stat:users') || '[]').length;
    } catch {
      return 0;
    }
  };

  const [lessonsToday, lessonsYesterday, visitsToday, langMap, hourMap, users] = await Promise.all([
    read(`lh:stat:lesson:${today}`),
    read(`lh:stat:lesson:${yesterday}`),
    read(`lh:stat:visit:${today}`),
    readCounters('lh:stat:lang'),
    readCounters('lh:stat:hour'),
    userCount(),
  ]);

  const topLangs = Object.entries(langMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([lang, count]) => ({ lang, count }));
  const topHours = Object.entries(hourMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([hour, count]) => ({ hour, count }));

  return {
    ok: true,
    mode: redis ? 'redis' : 'memory',
    today,
    lessonsToday,
    lessonsYesterday,
    visitsToday,
    users,
    topLangs,
    topHours,
  };
}
