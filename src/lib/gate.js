// ==== OBUNA SHLYUZI — yordamchi funksiyalar ====
import { GATE_STORAGE_KEY, GATE_PASS_TTL } from '../data/gateChannels';
import { ADMIN_SESSION_KEY } from '../data/adminUsers';

// Admin panelga kirganmi? (sessiya tokeni bor) — adminlar obunasiz kiradi
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

export function loadGatePass() {
  try {
    const raw = localStorage.getItem(GATE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Shlyuzdan o'tilganmi? (TTL ichida qayta so'ralmaydi)
export function hasGatePassed() {
  const pass = loadGatePass();
  if (!pass || !pass.passedAt) return false;
  if (Date.now() - Number(pass.passedAt) > GATE_PASS_TTL) return false;
  return true;
}

export function markGatePassed(channels = {}) {
  try {
    localStorage.setItem(
      GATE_STORAGE_KEY,
      JSON.stringify({ passedAt: Date.now(), channels }),
    );
  } catch (e) {
    console.warn('Failed to save gate pass:', e);
  }
}

// ---- Sessiya ichida tasdiqlangan kanallar ----
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

// ---- Telegram haqiqiy tekshiruv ----
// 1) Bot holati + kod olish (POST /api/telegram/verify)
export async function telegramVerifyStart(channel) {
  try {
    const res = await fetch('/api/telegram/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: channel || 'khoja_akbar' }),
    });
    return await res.json().catch(() => null);
  } catch {
    return { ok: false, error: 'network' };
  }
}

// 2) Kod holatini so'rash (GET /api/telegram/verify/status?code=...)
export async function telegramVerifyStatus(code, channel) {
  try {
    const res = await fetch(
      `/api/telegram/verify/status?code=${encodeURIComponent(code)}&channel=${encodeURIComponent(channel || 'khoja_akbar')}`,
    );
    return await res.json().catch(() => null);
  } catch {
    return { ok: false, error: 'network' };
  }
}
