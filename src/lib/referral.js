// ==== REFERRAL TIZIMI (Do'st taklif qilish) ====
// Har bir foydalanuvchida shaxsiy taklif kodi bor. Link orqali kelgan
// yangi foydalanuvchi +50 tanga bonus oladi (birinchi marta).
// Kirgan (Firebase) foydalanuvchilarda takliflar bulutda ham saqlanadi:
//   referrals/{inviterCode}/{inviteeUid} = { name, ts }

import { SITE_URL } from '../config';

const CODE_KEY = 'lingohub_ref_code';
const BONUS_KEY = 'lingohub_ref_bonus_claimed';
const INVITES_KEY = 'lingohub_ref_invites';

// Shaxsiy kodni olish (localStorage'da saqlanadi, user bo'lsa unga bog'lanadi)
export function getReferralCode() {
  try {
    const existing = localStorage.getItem(CODE_KEY);
    if (existing) return existing;
    let seed = Math.random().toString(36).slice(2, 8).toUpperCase();
    // Kirgan foydalanuvchida — user id dan barqaror kod
    const user = JSON.parse(localStorage.getItem('lingohub_user') || 'null');
    if (user?.sub) {
      seed = user.sub.replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase() || seed;
    }
    localStorage.setItem(CODE_KEY, seed);
    return seed;
  } catch {
    return 'LINGO';
  }
}

export function getReferralLink(code) {
  const codeStr = code || getReferralCode();
  // Query HASH dan OLDIN turadi — shunda window.location.search to'g'ri ishlaydi
  return `${SITE_URL}/?ref=${codeStr}#/`;
}

// URL'dagi ?ref= parametrini o'qiydi (ham search, ham hash ichidan — ehtiyotlik)
export function readRefFromUrl() {
  try {
    const search = new URLSearchParams(window.location.search).get('ref');
    if (search) return search;
    // Eski format: /#/?ref=CODE — hash ichidagi query'ni ham tekshiramiz
    const hash = window.location.hash;
    const qIdx = hash.indexOf('?');
    if (qIdx !== -1) {
      const hashQuery = new URLSearchParams(hash.slice(qIdx + 1)).get('ref');
      if (hashQuery) return hashQuery;
    }
    return null;
  } catch {
    return null;
  }
}

// Yangi foydalanuvchi bonusini qo'llash (har qurilmada bir marta)
// qaytaradi: { granted: boolean, inviterCode }
export function claimInviteBonus() {
  try {
    const ref = readRefFromUrl();
    if (!ref) return { granted: false };
    // O'z havolangizni ochsangiz — bonus berilmaydi (cheat emas)
    if (ref === getReferralCode()) return { granted: false, inviterCode: ref, self: true };
    if (localStorage.getItem(BONUS_KEY)) return { granted: false, inviterCode: ref };
    localStorage.setItem(BONUS_KEY, '1');
    localStorage.setItem('lingohub_ref_inviter', ref);
    // Taklif qilinganlar sonini hisoblagich (shu qurilmada)
    const invites = parseInt(localStorage.getItem(INVITES_KEY) || '0', 10);
    localStorage.setItem(INVITES_KEY, String(invites + 1));
    return { granted: true, inviterCode: ref };
  } catch {
    return { granted: false };
  }
}

// Inviter uchun mukofot: bulutdagi takliflar soni oshgan bo'lsa, yangi har
// bir taklif uchun +30 tanga (birinchi marta ko'rganingizda eski hisobga olinmaydi).
export function claimInviterReward(dispatch) {
  const code = getReferralCode();
  const KEY = 'lingohub_ref_reward_seen';
  return new Promise((resolve) => {
    fetchInviteCount(code).then((cloudCount) => {
      try {
        const lastSeen = parseInt(localStorage.getItem(KEY) || '0', 10);
        const count = cloudCount || 0;
        const newInvites = count - lastSeen;
        if (newInvites > 0) {
          dispatch({ type: 'ADD_COINS', payload: newInvites * 30 });
          localStorage.setItem(KEY, String(count));
          resolve({ reward: newInvites * 30, count });
          return;
        }
        // Yangi taklif yo'q — lekin qurilma ko'rsatilgan sonni yangilaymiz
        localStorage.setItem(KEY, String(count));
        resolve({ reward: 0, count });
      } catch {
        resolve({ reward: 0, count: cloudCount || 0 });
      }
    }).catch(() => resolve({ reward: 0, count: 0 }));
  });
}

// Kirgan foydalanuvchi uchun bulutga taklif yozish (Firebase)
// Firebase sozlanmagan bo'lsa — shunchaki o'tkazib yuboriladi.
export async function syncInviteToCloud(inviterCode) {
  try {
    const [{ db }, { ref, set }] = await Promise.all([
      import('../firebase'),
      import('firebase/database'),
    ]);
    if (!db) return false;
    const user = JSON.parse(localStorage.getItem('lingohub_user') || 'null');
    if (!user?.sub || !inviterCode) return false;
    await set(ref(db, `referrals/${inviterCode}/${user.sub}`), {
      name: user.name || 'Anonim',
      ts: Date.now(),
    });
    return true;
  } catch {
    return false;
  }
}

// Inviter uchun bulutdan takliflar sonini o'qish (kirgan bo'lsa)
export async function fetchInviteCount(code) {
  try {
    const [{ db }, { ref, get }] = await Promise.all([
      import('../firebase'),
      import('firebase/database'),
    ]);
    if (!db) return null;
    const snap = await get(ref(db, `referrals/${code}`));
    const val = snap.val();
    return val ? Object.keys(val).length : 0;
  } catch {
    return null;
  }
}

// Shu qurilmada taklif havolasi ochilganlar soni (mahalliy)
export function getLocalInviteVisits(code) {
  try {
    return parseInt(localStorage.getItem(`lingohub_ref_visits_${code}`) || '0', 10);
  } catch {
    return 0;
  }
}

export function markInviteMade() {
  try {
    const invites = parseInt(localStorage.getItem(INVITES_KEY) || '0', 10) + 1;
    localStorage.setItem(INVITES_KEY, String(invites));
  } catch { /* ignore */ }
}

export function getInvitesMade() {
  try {
    return parseInt(localStorage.getItem(INVITES_KEY) || '0', 10);
  } catch {
    return 0;
  }
}

// Invitee birinchi darsni tugatganda bulutga belgi qo'yadi (inviter uchun).
// Kirgan foydalanuvchi uchun: referrals/{inviterCode}/{uid} da completed: true
export async function markInviteeCompleted(inviterCode) {
  try {
    const [{ db }, { ref, update }] = await Promise.all([
      import('../firebase'),
      import('firebase/database'),
    ]);
    if (!db) return false;
    const user = JSON.parse(localStorage.getItem('lingohub_user') || 'null');
    const inviter = inviterCode || localStorage.getItem('lingohub_ref_inviter');
    if (!user?.sub || !inviter) return false;
    await update(ref(db, `referrals/${inviter}/${user.sub}`), { completed: true, ts: Date.now() });
    return true;
  } catch {
    return false;
  }
}
