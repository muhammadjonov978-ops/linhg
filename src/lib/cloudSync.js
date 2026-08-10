// ==== BULUTLI SINXRONLASH (Firebase Realtime Database) ====
// Foydalanuvchi Google/email orqali kirganda, taraqqiyoti (darslar, tangalar,
// streak, yutuqlar, magazin inventari) Firebase'ga yoziladi va boshqa
// qurilmada davom etganda qayta yuklanadi.
//
// Ushbu fayl 'lingohub_user' (localStorage) orqali foydalanuvchini biladi.
// Firebase sozlanmagan bo'lsa — hech narsa buzilmaydi (silent no-op).
//
// Saqlash sxemasi:
//   users/{uid}/data/{progress,coins,streak,achievements,inventory,equipped,...}
//   users/{uid}/lastSync — oxirgi sinxronlash vaqti

import { ref, set, get, serverTimestamp } from 'firebase/database';
import { db, HAS_FIREBASE } from '../firebase';

export const CLOUD_EVENT = 'lingohub-cloud-sync';

function notify(kind, info = {}) {
  try {
    window.dispatchEvent(new CustomEvent(CLOUD_EVENT, { detail: { kind, ...info } }));
  } catch { /* noop */ }
}

function loadSavedUser() {
  try {
    const raw = localStorage.getItem('lingohub_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Saqlashga yaroqli (JSON-safe) holatni yig'adi
export function serializeState(state) {
  return {
    progress: state.progress || {},
    coins: state.coins || 0,
    streak: state.streak || 0,
    lastActive: state.lastActive || null,
    isPremium: state.isPremium || false,
    unlockedLanguages: state.unlockedLanguages || {},
    achievements: (state.achievements || []).map((a) => ({
      id: a.id,
      unlocked: !!a.unlocked,
      claimed: !!a.claimed,
      coinReward: a.coinReward || 0,
      unlockedAt: a.unlockedAt || null,
    })),
    dailyChallenges: state.dailyChallenges || null,
    theme: state.theme || null,
    mistakesReviewed: state.mistakesReviewed || 0,
    perfectWeeks: state.perfectWeeks || 0,
    courseRewards: state.courseRewards || {},
    inventory: state.inventory || [],
    equipped: state.equipped || {},
    energy: typeof state.energy === 'number' ? state.energy : null,
    level: state.level || null,
    flashcardSrs: state.flashcardSrs || null,
  };
}

// Bulutga yozish (faqat kirgan foydalanuvchi uchun)
export async function pushToCloud(state) {
  const user = loadSavedUser();
  if (!user?.sub || !HAS_FIREBASE) return { ok: false, reason: 'no-user-or-firebase' };
  try {
    const dataRef = ref(db, `users/${user.sub}/data`);
    await set(dataRef, serializeState(state));
    await set(ref(db, `users/${user.sub}/lastSync`), serverTimestamp());
    notify('pushed');
    return { ok: true };
  } catch (e) {
    console.warn('Cloud push failed:', e?.message);
    return { ok: false, reason: e?.message };
  }
}

// Bulutdan o'qish (kirgan foydalanuvchi uchun)
export async function pullFromCloud() {
  const user = loadSavedUser();
  if (!user?.sub || !HAS_FIREBASE) return { ok: false, data: null };
  try {
    const snap = await get(ref(db, `users/${user.sub}/data`));
    const data = snap.val();
    if (!data) return { ok: true, data: null };
    notify('pulled');
    return { ok: true, data };
  } catch (e) {
    console.warn('Cloud pull failed:', e?.message);
    return { ok: false, data: null };
  }
}

// Ikki holatni birlashtirish — mahalliy va bulut. Har bir dars uchun eng
// yaxshi ball, yutuqlar esa birlashtiriladi (takrorlanmaydi).
export function mergeState(local, cloud) {
  if (!cloud) return local;

  const merged = { ...local };

  // Progress: ball va completed holatini eng yaxshisi bilan birlashtiramiz
  const progress = { ...(local.progress || {}), ...(cloud.progress || {}) };
  Object.keys(progress).forEach((key) => {
    const a = local.progress?.[key];
    const b = cloud.progress?.[key];
    if (a && b) {
      const bestScore = Math.max(a.score || 0, b.score || 0);
      progress[key] = {
        score: bestScore,
        completed: !!(a.completed || b.completed),
        timestamp: Math.max(a.timestamp || 0, b.timestamp || 0),
      };
    }
  });
  merged.progress = progress;

  // Tangalar va boshqa sonlar — maksimum (cheat emas, xavfsiz yo'l)
  merged.coins = Math.max(local.coins || 0, cloud.coins || 0);
  merged.streak = Math.max(local.streak || 0, cloud.streak || 0);
  merged.mistakesReviewed = Math.max(local.mistakesReviewed || 0, cloud.mistakesReviewed || 0);
  merged.perfectWeeks = Math.max(local.perfectWeeks || 0, cloud.perfectWeeks || 0);
  merged.energy = Math.max(local.energy ?? 0, cloud.energy ?? 0) || local.energy;
  merged.level = local.level || cloud.level || null;

  // Yutuqlar — id bo'yicha birlashtirish
  const achMap = new Map();
  [...(local.achievements || []), ...(cloud.achievements || [])].forEach((a) => {
    if (!a || !a.id) return;
    const existing = achMap.get(a.id);
    if (!existing) {
      achMap.set(a.id, a);
    } else {
      achMap.set(a.id, {
        ...existing,
        unlocked: !!(existing.unlocked || a.unlocked),
        claimed: !!(existing.claimed || a.claimed),
        coinReward: Math.max(existing.coinReward || 0, a.coinReward || 0),
      });
    }
  });
  merged.achievements = Array.from(achMap.values());

  // Inventar — birlashma
  merged.inventory = Array.from(new Set([...(local.inventory || []), ...(cloud.inventory || [])]));
  merged.equipped = { ...(cloud.equipped || {}), ...(local.equipped || {}) };
  merged.theme = local.theme || cloud.theme || null;
  merged.isPremium = !!(local.isPremium || cloud.isPremium);
  merged.unlockedLanguages = {
    ...(cloud.unlockedLanguages || {}),
    ...(local.unlockedLanguages || {}),
  };

  return merged;
}

// Qo'lda sinxronlash (navbar tugmasi uchun) — push + pull
export async function manualSync(localState, applyCloud) {
  const push = await pushToCloud(localState);
  const pull = await pullFromCloud();
  if (pull.ok && pull.data) {
    applyCloud(pull.data);
    return { pushed: push.ok, pulled: true };
  }
  return { pushed: push.ok, pulled: false };
}

export { HAS_FIREBASE };
