// ============================================================
// src/lib/server.js — SERVER API YORDAMCHILARI (o'yinlashtirish)
// ============================================================
// Frontend'ning yangi server endpoint'lari bilan muloqoti:
//   leaderboard, kunlik bonus, AI kun so'zi, haftalik turnir, statistika.
//
// Barcha funksiyalar "fail-safe": server javob bermasa / xato bo'lsa
// { ok:false, fallback:true } qaytaradi — UI eski (lokal) rejimga tushadi.

const API_BASE = '/api';

async function apiGet(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`, { headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) return { ok: false, fallback: true };
    return await res.json();
  } catch {
    return { ok: false, fallback: true };
  }
}

async function apiPost(path, body = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { ok: false, fallback: true };
    return await res.json();
  } catch {
    return { ok: false, fallback: true };
  }
}

// Foydalanuvchi / qurilma identifikatori — leaderboard, bonus va turnirlar uchun.
// Kirgan (Google) foydalanuvchida sub, aks holda qurilma ID si.
export function getServerUid() {
  try {
    const user = JSON.parse(localStorage.getItem('lingohub_user') || 'null');
    if (user?.sub) return String(user.sub);
  } catch { /* noop */ }
  try {
    let id = localStorage.getItem('lingohub_presence_session');
    if (!id) {
      id = `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem('lingohub_presence_session', id);
    }
    return id;
  } catch {
    return `dev-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function getDisplayName() {
  try {
    const user = JSON.parse(localStorage.getItem('lingohub_user') || 'null');
    return user?.name || user?.givenName || 'O\'quvchi';
  } catch {
    return 'O\'quvchi';
  }
}

// Ball formulasi — Leaderboard.jsx bilan bir xil
export function computeScore({ progress, coins, streak }) {
  const completed = Object.values(progress || {}).filter((p) => p && p.completed).length;
  return Math.round(completed * 10 + (coins || 0) / 10 + (streak || 0) * 5);
}

// ---------- LEADERBOARD ----------

// Global reytingni olish: { ok, mode, entries, myRank, myScore }
export async function fetchLeaderboard(uid) {
  const q = uid ? `?uid=${encodeURIComponent(uid)}` : '';
  return apiGet(`/leaderboard${q}`);
}

// O'z ballini serverga yozish (debounced chaqiriladi)
export async function reportScore(state, uid) {
  return apiPost('/leaderboard/report', {
    uid,
    name: getDisplayName(),
    score: computeScore(state),
    lessons: Object.values(state.progress || {}).filter((p) => p && p.completed).length,
    coins: state.coins || 0,
    streak: state.streak || 0,
    lang: state.selectedLanguage || '',
  });
}

// ---------- DAILY BONUS ----------

// Kunlik bonus holati: { ok, claimed, streak, nextAmount, lastClaimDate }
export async function fetchDailyBonus(uid) {
  const q = uid ? `?uid=${encodeURIComponent(uid)}` : '';
  return apiGet(`/daily/bonus${q}`);
}

// Kunlik bonusni olish: { ok, granted, newStreak, alreadyClaimed }
export async function claimDailyBonus(uid) {
  return apiPost('/daily/bonus/claim', { uid });
}

// ---------- AI KUN SO'ZI ----------

// Serverdan "kun so'zi" + viktorina olish (AI generatsiya qilgan bo'lishi mumkin)
export async function fetchDailyContent({ lang = 'english', level = 'beginner', uiLang = 'uz' } = {}) {
  const q = `?lang=${encodeURIComponent(lang)}&level=${encodeURIComponent(level)}&uiLang=${encodeURIComponent(uiLang)}`;
  return apiGet(`/daily/content${q}`);
}

// ---------- TOURNAMENT ----------

// Turnir holati: { ok, week, endsAt, entries, myRank, myScore, prize, prizeRank }
export async function fetchTournament(uid) {
  const q = uid ? `?uid=${encodeURIComponent(uid)}` : '';
  return apiGet(`/tournament${q}`);
}

// Turnirga ball yozish
export async function reportTournamentScore(state, uid) {
  return apiPost('/tournament/score', {
    uid,
    name: getDisplayName(),
    score: computeScore(state),
    lessons: Object.values(state.progress || {}).filter((p) => p && p.completed).length,
    coins: state.coins || 0,
    streak: state.streak || 0,
    lang: state.selectedLanguage || '',
  });
}

// O'tgan hafta TOP-3 mukofotini olish
export async function claimTournamentPrize(uid) {
  return apiPost('/tournament/claim', { uid, action: 'claim' });
}

// ---------- STATISTIKA EVENTLARI ----------

// Serverga hodisa yuborish (lesson/visit/lang) — apiPost ichida xatolar yutiladi
export function sendStatEvent(type, { lang, uid } = {}) {
  apiPost('/stats/event', { type, lang, uid });
}

// Server statistika dashboard (admin) — token kerak
export async function fetchServerStats(token) {
  try {
    const res = await fetch(`${API_BASE}/stats/dashboard`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { ok: false };
    return await res.json();
  } catch {
    return { ok: false };
  }
}
