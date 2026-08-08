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

const DEFAULT_TOKEN = '8596653767:AAFj-YSQtYdPToIN4ocW9UhKeVTa4TMGQ08';
const API_BASE = 'https://api.telegram.org/bot';

export function botToken() {
  return process.env.TELEGRAM_BOT_TOKEN || DEFAULT_TOKEN;
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
