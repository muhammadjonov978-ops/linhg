// ==== ESKIZ.UZ SMS (server-side) ====
// O'zbekiston telefonlariga SMS yuborish uchun Eskiz.uz xizmati ishlatiladi.
// Vercel env (MAXFIY, server-side):
//   ESKIZ_EMAIL     — Eskiz.uz hisobi emaili (notify.eskiz.uz)
//   ESKIZ_PASSWORD  — Eskiz.uz paroli
//   ESKIZ_SENDER    — (ixtiyoriy) jo'natuvchi nomi, default "4546" (Eskiz "from" nomi)
//
// Bosqichlar:
//   1) POST /api/auth/login  { email, password }  → { data: { token } }
//   2) POST /api/message/sms/send  Authorization: Bearer <token>
//      { mobile_phone, message, from }
// Token ~24 soat xotirada/Redis'da saqlanadi (Vercel serverless — qayta login
// har cold start'da sodir bo'ladi, lekin Redis bo'lsa token qayta ishlatiladi).
import { redis } from './redis.js';

const API_BASE = 'https://notify.eskiz.uz/api';
const TOKEN_TTL = 23 * 60 * 60; // 23 soat (Eskiz tokeni ~1 oy amal qiladi, biz erta yangilaymiz)

const TOKEN_KEY = 'eskiz:token';

export function smsConfigured() {
  return Boolean(process.env.ESKIZ_EMAIL && process.env.ESKIZ_PASSWORD);
}

export function smsSender() {
  return String(process.env.ESKIZ_SENDER || '4546').trim();
}

// ---------- Token olish (cache bilan) ----------
let memoryToken = null;
let memoryTokenAt = 0;

async function eskizLogin() {
  const email = String(process.env.ESKIZ_EMAIL || '').trim();
  const password = String(process.env.ESKIZ_PASSWORD || '').trim();
  if (!email || !password) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => null);
    return data?.data?.token || null;
  } catch {
    return null;
  }
}

export async function getEskizToken() {
  const now = Date.now();

  // Redis cache (agar mavjud bo'lsa)
  if (redis) {
    try {
      const cached = await redis.get(TOKEN_KEY);
      if (cached) return cached;
    } catch { /* noop */ }
  }

  // Xotira cache (Vercel cold start oralig'ida)
  if (memoryToken && now - memoryTokenAt < TOKEN_TTL * 1000) {
    return memoryToken;
  }

  const token = await eskizLogin();
  if (!token) return null;

  memoryToken = token;
  memoryTokenAt = now;
  if (redis) {
    try {
      await redis.set(TOKEN_KEY, token, { ex: TOKEN_TTL });
    } catch { /* noop */ }
  }
  return token;
}

// ---------- SMS yuborish ----------
// phone: "998901234567" ko'rinishida (mamlakat kodi bilan, +/bo'sh joysiz)
// message: SMS matni (160 belgidan oshmasligi tavsiya etiladi)
export async function sendSms({ phone, message }) {
  if (!smsConfigured()) {
    return { ok: false, code: 'not_configured', error: "Eskiz sozlanmagan (ESKIZ_EMAIL / ESKIZ_PASSWORD yo'q)" };
  }

  const token = await getEskizToken();
  if (!token) {
    return { ok: false, code: 'auth_failed', error: "Eskiz login muvaffaqiyatsiz — email/parolni tekshiring" };
  }

  try {
    const res = await fetch(`${API_BASE}/message/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        mobile_phone: String(phone || '').replace(/[^\d]/g, ''),
        message: String(message || ''),
        from: smsSender(),
      }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.status === 'waiting') {
      return { ok: true, id: data?.id || null };
    }
    // Ba'zan data.status 'success'/'accepted' ham kelishi mumkin
    if (res.ok && data?.id) {
      return { ok: true, id: data.id };
    }
    return {
      ok: false,
      code: 'send_failed',
      error: data?.message || data?.error || `Eskiz xatosi (${res.status})`,
    };
  } catch (e) {
    return { ok: false, code: 'network', error: e?.message || 'Tarmoq xatosi' };
  }
}

// Telefon raqamni tozalaydi: "+998 90 123 45 67" → "998901234567"
export function normalizePhone(raw) {
  let digits = String(raw || '').replace(/[^\d]/g, '');
  // Eski milliy uslub: 8 90 123 45 67 (10 raqam) → 998 90 123 45 67
  if (digits.length === 10 && digits.startsWith('8')) digits = `998${digits.slice(1)}`;
  // 8 998 90 123 45 67 (13 raqam, 8 prefiksli xalqaro) → 998 90 123 45 67
  if (digits.length === 13 && digits.startsWith('8998')) digits = digits.slice(1);
  // Qisqa: 90 123 45 67 (9 raqam) → 998901234567
  if (digits.length === 9) digits = `998${digits}`;
  return digits;
}

export function isValidUzPhone(digits) {
  return /^998\d{9}$/.test(digits);
}
