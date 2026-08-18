// ==== TELEGRAM BOT (server-side) ====
// Bot token: @BotFather'dan olinadi. Vercel env: TELEGRAM_BOT_TOKEN.
// Agar env o'rnatilmagan bo'lsa — .env'dagi default token ishlatiladi
// (bu token foydalanuvchi tomonidan berilgan).
//
// Imkoniyatlar:
//   - Botga yozilgan har bir xabardan chat ID eslab qolinadi (Redis + xotira)
//   - notifyTelegram() — egasiga xabar yuboradi (to'lovlar, hodisalar)
//   - webhook orqali buyruqlar: /start /help /stats /site
import { redis } from './redis.js';

// ⚠️ XAVFSIZLIK: Bot tokeni faqat env'da saqlanadi (TELEGRAM_BOT_TOKEN).
// Ilgari bu yerda kodga yozilgan (default) token bor edi — u olib tashlandi
// va almashtirilishi kerak (@BotFather → Revoke token). Token kodda tursa,
// repoga kirgan har kim botni egallashi mumkin.
const API_BASE = 'https://api.telegram.org/bot';

export function botToken() {
  return process.env.TELEGRAM_BOT_TOKEN || '';
}

export function telegramConfigured() {
  return Boolean(botToken());
}

// Egasining chat ID (ixtiyoriy, Vercel env: TELEGRAM_CHAT_ID)
export function ownerChatId() {
  return String(process.env.TELEGRAM_CHAT_ID || '').trim();
}

// Telegram Bot API ga so'rov
export async function telegramApi(method, payload = {}) {
  const token = botToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json().catch(() => null);
  } catch {
    return null;
  }
}

// Matnni HTML parse_mode uchun xavfsiz qiladi
export function escapeHtml(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ---------- Chat registry ----------
// Botga kim yozgan bo'lsa — o'sha chatga xabar yuboramiz (Redis + fallback).
let memoryChats = new Set();

export async function rememberChat(chatId) {
  if (!chatId) return;
  memoryChats.add(String(chatId));
  if (redis) {
    try {
      await redis.sadd('tg:chats', String(chatId));
    } catch { /* noop */ }
  }
}

export async function getChats() {
  const chats = new Set(memoryChats);
  if (redis) {
    try {
      const stored = await redis.smembers('tg:chats');
      (stored || []).forEach((c) => chats.add(String(c)));
    } catch { /* noop */ }
  }
  return chats;
}

// ---------- Obuna tekshiruvi (sayt shlyuzi) ----------
// Saytga kirishdan oldin foydalanuvchi botga /start verify_<kod> yuboradi.
// Webhook o'sha koddan Telegram user ID ni eslab qoladi, so'ng sayt
// getChatMember orqali kanal a'zoligini HAQIQIY tekshiradi.
const VERIFY_TTL_MS = 10 * 60 * 1000; // 10 daqiqa
let memoryVerify = new Map();

function verifyKey(code) {
  return `tg:verify:${code}`;
}

export async function storeVerifyCode(code, userId, username, firstName) {
  const payload = {
    userId: String(userId),
    username: String(username || ''),
    firstName: String(firstName || ''),
    at: Date.now(),
  };
  memoryVerify.set(code, payload);
  // Eski (muddati o'tgan) kodlarni tozalaymiz
  const now = Date.now();
  for (const [k, v] of memoryVerify) {
    if (now - (v.at || 0) > VERIFY_TTL_MS) memoryVerify.delete(k);
  }
  if (redis) {
    try {
      await redis.set(verifyKey(code), JSON.stringify(payload), { ex: 600 });
    } catch { /* noop */ }
  }
}

export async function resolveVerifyCode(code) {
  const mem = memoryVerify.get(code);
  if (mem && Date.now() - (mem.at || 0) <= VERIFY_TTL_MS) return mem;
  if (redis) {
    try {
      const raw = await redis.get(verifyKey(code));
      if (raw) {
        const parsed = JSON.parse(raw);
        memoryVerify.set(code, parsed);
        return parsed;
      }
    } catch { /* noop */ }
  }
  return null;
}

// Foydalanuvchi (Telegram ID) kanal a'zomi? Bot kanalga ADMIN bo'lishi kerak.
// Natija: { ok, member, status } | { ok:false, error }
export async function getChatMember(chatId, userId) {
  const data = await telegramApi('getChatMember', {
    chat_id: chatId,
    user_id: String(userId),
  });
  if (!data) return { ok: false, error: 'network' };
  if (data.ok) {
    const status = data.result?.status;
    const member = ['creator', 'administrator', 'member', 'restricted'].includes(status);
    return { ok: true, member, status: status || 'unknown' };
  }
  // 400/403 — bot kanalga admin qo'shilmagan yoki kanal topilmadi
  return { ok: false, member: false, error: data.description || 'telegram_error' };
}

// ---------- Xabar yuborish ----------
// Barcha ma'lum chatlarga xabar yuboradi. Egasi ham (TELEGRAM_CHAT_ID) kiradi.
export async function notifyTelegram(text, extra = {}) {
  if (!telegramConfigured()) return { ok: false, error: "Bot sozlanmagan (TELEGRAM_BOT_TOKEN yo'q)" };
  const targetChats = new Set();
  if (ownerChatId()) targetChats.add(ownerChatId());
  (await getChats()).forEach((c) => targetChats.add(String(c)));
  if (targetChats.size === 0) {
    return { ok: false, error: "Hali hech kim botga yozmagan — birinchi bo'lib botga /start yuboring" };
  }
  // Barcha chatlarga PARALLEL yuboramiz — serial kutish o'rniga
  const settled = await Promise.allSettled(
    [...targetChats].map(async (chatId) => {
      const data = await telegramApi('sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...extra,
      });
      return { chatId, ok: data?.ok === true };
    })
  );
  const results = settled.map((r) => (r.status === 'fulfilled' ? r.value : { ok: false }));
  return { ok: results.some((r) => r.ok), results };
}
