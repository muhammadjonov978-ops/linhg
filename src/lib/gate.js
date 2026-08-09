// ==== OBUNA SHLYUZI — yordamchi funksiyalar ====
// DIQQAT: shlyuzdan o'tish SESSIYAda saqlanadi (sessionStorage) — ya'ni sayt
// har yangi oynada ochilganda yana obuna so'raladi. Bu egasining talabi:
// kanallarga obuna bo'lmasa saytga kirish taqiqlansin (har kirishda tekshiriladi).
import { GATE_STORAGE_KEY } from '../data/gateChannels';
import { ADMIN_SESSION_KEY } from '../data/adminUsers';

// Admin panelga kirganmi? (sessiya tokeni bor) — adminlar ham shlyuzni ko'radi,
// lekin "Admin sifatida kirish" tugmasi bilan 1 bosishda o'tadi.
export function isAdminLoggedIn() {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw);
    return Boolean(s && s.token);
  } catch {
    return false;
  }
}

// Shlyuzdan o'tilganmi? — faqat shu sessiya ichida eslab qolinadi
export function loadGatePass() {
  try {
    const raw = sessionStorage.getItem(GATE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function hasGatePassed() {
  return Boolean(loadGatePass()?.passedAt);
}

export function markGatePassed(channels = {}) {
  try {
    sessionStorage.setItem(
      GATE_STORAGE_KEY,
      JSON.stringify({ passedAt: Date.now(), channels }),
    );
  } catch (e) {
    console.warn('Failed to save gate pass:', e);
  }
}

// ---- Shlyuz oynasi ichida tasdiqlangan kanallar ----
export function loadSessionVerified() {
  try {
    const raw = sessionStorage.getItem('lingohub_gate_session');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSessionVerified(verified) {
  try {
    sessionStorage.setItem('lingohub_gate_session', JSON.stringify(verified));
  } catch {
    /* noop */
  }
}

// (Ilgari Telegram orqali haqiqiy tekshiruv shu yerda edi — hozircha
// faqat Instagram obunasi so'raladi, shuning uchun bu funksiyalar olib tashlandi.)
