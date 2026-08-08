// ==== ADMIN ACCOUNTS (server-side store) ====
// Admin panel'da yaratilgan hisoblar endi HAMIQIY ishlaydi:
//  1) REDIS (Upstash) — hisoblar barcha qurilmalarda doimiy saqlanadi.
//  2) IN-MEMORY fallback — Redis ishlamasa, shu serverless instansiya
//     xotirasida saqlanadi (instansiya sovuganda yo'qoladi).
//
// 🔒 Xavfsizlik: parol HECH QACHON ochiq holda saqlanmaydi — scrypt bilan
// xeshlanadi (salt bilan). Parol faqat serverda, faqat xeshlangan holida turadi.
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { redis } from './redis.js';

const ACCOUNTS_KEY = 'admin_accounts';
const SCRYPT_LEN = 32;

// Redis ishlayotganmi? — yozuv muvaffaqiyatsiz bo'lsa memory'ga tushamiz
let redisOk = redis ? true : false;

// In-memory fallback: Map<username, account>
const memoryStore = new Map();

function normalizeUsername(u) {
  return String(u || '').trim().toLowerCase();
}

// ---------- Parol xeshlash (scrypt + salt) ----------
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(String(password), salt, SCRYPT_LEN).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string') return false;
  if (stored.startsWith('scrypt:')) {
    const [, salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    try {
      const candidate = scryptSync(String(password), salt, SCRYPT_LEN);
      const expected = Buffer.from(hash, 'hex');
      return candidate.length === expected.length && timingSafeEqual(candidate, expected);
    } catch {
      return false;
    }
  }
  // Eski (xeshlanmagan) yozuvlar uchun — faqat orqaga moslik, yangi yozuvlar
  // hech qachon ochiq parol saqlamaydi.
  return stored === String(password);
}

// Saqlash rejimi: 'redis' | 'memory'
export function getStoreMode() {
  return redis && redisOk ? 'redis' : 'memory';
}

async function saveStoredAccounts(list) {
  // Doim memory'ga ham yozamiz (write-through cache) — Redis xatosi bo'lsa
  // o'qish ham memory'dan davom etadi.
  memoryStore.clear();
  list.forEach((a) => memoryStore.set(a.username, a));
  if (redis) {
    try {
      await redis.set(ACCOUNTS_KEY, JSON.stringify(list));
      redisOk = true;
    } catch {
      redisOk = false; // keyingi yozuv muvaffaqiyatli bo'lguncha memory rejim
    }
  }
}

export async function listStoredAccounts() {
  if (redis && redisOk) {
    try {
      const raw = await redis.get(ACCOUNTS_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return arr;
      }
      return [];
    } catch {
      redisOk = false; // o'qish ham ishlamadi — memory'ga tushamiz
    }
  }
  return [...memoryStore.values()];
}

// Parolsiz (ko'rsatish uchun) ro'yxat
export async function publicStoredAccounts() {
  const list = await listStoredAccounts();
  return list.map((a) => ({
    username: a.username,
    name: a.name || a.username,
    role: a.role || 'admin',
    createdAt: a.createdAt,
  }));
}

export async function addStoredAccount({ username, password, name }) {
  const u = normalizeUsername(username);
  if (u.length < 2) {
    return { ok: false, code: 'invalid', error: "Login kamida 2 ta belgidan iborat bo'lishi kerak" };
  }
  if (!password || String(password).length < 4) {
    return { ok: false, code: 'invalid', error: "Parol kamida 4 ta belgidan iborat bo'lishi kerak" };
  }
  const list = await listStoredAccounts();
  if (list.some((a) => a.username === u)) {
    return { ok: false, code: 'exists', error: 'Bu login allaqachon mavjud' };
  }
  const account = {
    username: u,
    passwordHash: hashPassword(password),
    name: String(name || '').trim() || u,
    role: 'admin',
    createdAt: Date.now(),
  };
  list.push(account);
  await saveStoredAccounts(list);
  return {
    ok: true,
    account: {
      username: account.username,
      name: account.name,
      role: account.role,
      createdAt: account.createdAt,
    },
  };
}

export async function removeStoredAccount(username) {
  const u = normalizeUsername(username);
  const list = await listStoredAccounts();
  const next = list.filter((a) => a.username !== u);
  if (next.length === list.length) {
    return { ok: false, code: 'not_found', error: 'Hisob topilmadi' };
  }
  await saveStoredAccounts(next);
  return { ok: true };
}

// Login uchun tekshiruv — topilsa foydalanuvchi obyekti, aks holda null
export async function authStoredAccount(username, password) {
  const u = normalizeUsername(username);
  const list = await listStoredAccounts();
  const acc = list.find((a) => a.username === u && verifyPassword(password, a.passwordHash));
  if (!acc) return null;
  return { username: acc.username, name: acc.name || acc.username, role: 'admin' };
}
