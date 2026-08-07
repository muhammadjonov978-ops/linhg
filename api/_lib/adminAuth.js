// ==== ADMIN AUTH (server-side) ====
// Admin paroli endi faqat SERVER'da (env o'zgaruvchilarida) saqlanadi —
// brauzer kodiga hech qachon chiqmaydi.
//
// Vercel sozlamalarida (Environment Variables):
//   ADMIN_USERNAME        (ixtiyoriy, default: shox)
//   ADMIN_PASSWORD        (majburiy — egasi paroli)
//   ADMIN_NAME            (ixtiyoriy, default: Shox)
//   ADMIN_TOKEN_SECRET    (ixtiyoriy — token imzosi. Bo'sh bo'lsa ADMIN_PASSWORD ishlatiladi)
//   ADMIN_EXTRA_ACCOUNTS  (ixtiyoriy: login:parol:Ism,login2:parol2:Ism2)
import { createHmac, timingSafeEqual } from 'node:crypto';

const OWNER_USERNAME = (process.env.ADMIN_USERNAME || 'shox').trim().toLowerCase();
const OWNER_PASSWORD = process.env.ADMIN_PASSWORD || '';
const OWNER_NAME = (process.env.ADMIN_NAME || 'Shox').trim();
// Token imzosi uchun maxfiy kalit — alohida ADMIN_TOKEN_SECRET yo'q bo'lsa,
// ADMIN_PASSWORD (maxfiy) ishlatiladi.
const TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || OWNER_PASSWORD;

const SESSION_TTL = 12 * 60 * 60 * 1000; // 12 soat

// Serverda admin auth sozlanganmi?
export function isAuthConfigured() {
  return Boolean(OWNER_PASSWORD);
}

// Qo'shimcha adminlar: "login:parol:Ism,login2:parol2:Ism2"
export function parseExtraAccounts() {
  return (process.env.ADMIN_EXTRA_ACCOUNTS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const [username, password, name] = entry.split(':');
      if (!username || !password) return null;
      return {
        username: username.trim().toLowerCase(),
        password,
        name: (name || username).trim(),
      };
    })
    .filter(Boolean);
}

// Login/parolni tekshiradi — muvaffaqiyat bo'lsa foydalanuvchi obyektini qaytaradi
export function authenticate(username, password) {
  if (!isAuthConfigured()) return null;
  const u = String(username || '').trim().toLowerCase();
  const p = String(password || '');

  if (u === OWNER_USERNAME && p === OWNER_PASSWORD) {
    return { username: OWNER_USERNAME, name: OWNER_NAME, role: 'owner' };
  }
  const extra = parseExtraAccounts().find((a) => a.username === u && a.password === p);
  if (extra) return { username: extra.username, name: extra.name, role: 'admin' };
  return null;
}

// ---------- HMAC-imzolangan token ----------
function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(str) {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}
function hmacSign(data) {
  return createHmac('sha256', TOKEN_SECRET).update(data).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function signToken(user) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({
    u: user.username,
    n: user.name || user.username,
    r: user.role === 'owner' ? 'owner' : 'admin',
    exp: Date.now() + SESSION_TTL,
  }));
  return `${header}.${payload}.${hmacSign(`${header}.${payload}`)}`;
}

// ---------- Oddiy brute-force himoyasi (in-memory) ----------
// Serverless muhitda instansiya bo'yicha ishlaydi — to'liq himoya emas,
// lekin oson urinishlarni sekinlashtiradi. Kuchli parol bilan birga tavsiya etiladi.
const attemptMap = new Map(); // ip -> { count, until }

// IP uchun urinish cheklovi faolmi?
export function checkRateLimit(ip) {
  const rec = attemptMap.get(ip);
  return !(rec && rec.until > Date.now());
}

// Xato urinishni qayd qiladi — 5 tadan keyin 5 daqiqaga blok
export function registerFailure(ip) {
  const now = Date.now();
  const rec = attemptMap.get(ip) || { count: 0, until: 0 };
  rec.count += 1;
  if (rec.count >= 5) rec.until = now + 5 * 60 * 1000; // 5 daqiqa blok
  attemptMap.set(ip, rec);
  // Xotira o'sib ketmasligi uchun cheklaymiz
  if (attemptMap.size > 1000) attemptMap.clear();
}

// Muvaffaqiyatli login — hisoblagichni tozalaymiz
export function resetFailures(ip) {
  attemptMap.delete(ip);
}

// Token'ni tekshiradi — yaroqsiz/eskirgan bo'lsa null
export function verifyToken(token) {
  if (!TOKEN_SECRET || !token) return null;
  const parts = String(token).split('.');
  if (parts.length !== 3) return null;
  const [header, payload, sig] = parts;

  const expected = hmacSign(`${header}.${payload}`);
  if (sig.length !== expected.length) return null;
  let valid = false;
  try {
    valid = timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return null;
  }
  if (!valid) return null;

  try {
    const data = JSON.parse(b64urlDecode(payload).toString('utf8'));
    if (!data.u || typeof data.u !== 'string') return null;
    if (!data.exp || Date.now() > data.exp) return null;
    return {
      username: data.u,
      name: data.n || data.u,
      role: data.r === 'owner' ? 'owner' : 'admin',
    };
  } catch {
    return null;
  }
}
