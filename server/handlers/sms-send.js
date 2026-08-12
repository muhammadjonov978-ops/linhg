// POST /api/sms/send — telefon raqamga SMS yuborish (Eskiz.uz orqali).
// Body: { phone, message }
//   phone    — "+998 90 123 45 67" yoki "998901234567" ko'rinishida
//   message  — SMS matni (majburiy, 160 belgigacha tavsiya)
//
// Bu endpoint brauzerdan (SMSReminder) chaqiriladi, shuning uchun admin
// sessiyasi TALAB QILINMAYDI. Spam himoyasi: har raqam/IP uchun kunlik limit.
//
// Javob: { ok, id?, error?, code? }
import { sendSms, smsConfigured, normalizePhone, isValidUzPhone } from '../lib/sms.js';
import { redis } from '../lib/redis.js';

const DAILY_PHONE_LIMIT = 3;   // kuniga har raqamga ko'pi bilan 3 ta SMS
const DAILY_IP_LIMIT = 10;     // kuniga har IP'dan ko'pi bilan 10 ta so'rov

// In-memory fallback (Vercel cold start oralig'ida ishlaydi; Redis bo'lsa aniqroq)
const memCounts = new Map();
function dayKey(ts = Date.now()) {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
function memCount(key) {
  const k = `${dayKey()}:${key}`;
  const v = memCounts.get(k) || 0;
  return v;
}
function memInc(key) {
  const k = `${dayKey()}:${key}`;
  memCounts.set(k, (memCounts.get(k) || 0) + 1);
  // Eski kunlarni tozalaymiz (xotira to'lib ketmasligi uchun)
  if (memCounts.size > 500) {
    const today = dayKey();
    for (const [mk] of memCounts) {
      if (!mk.startsWith(`${today}:`)) memCounts.delete(mk);
    }
  }
}

async function incrCount(key, ttl) {
  if (redis) {
    try {
      const fullKey = `sms:${dayKey()}:${key}`;
      const n = await redis.incr(fullKey);
      if (n === 1) await redis.expire(fullKey, ttl);
      return n;
    } catch { /* fall through */ }
  }
  memInc(key);
  return memCount(key);
}

async function getCount(key) {
  if (redis) {
    try {
      return Number(await redis.get(`sms:${dayKey()}:${key}`)) || 0;
    } catch { /* fall through */ }
  }
  return memCount(key);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (!smsConfigured()) {
    return res.status(200).json({
      ok: false,
      code: 'not_configured',
      error: "SMS sozlanmagan — Vercel'da ESKIZ_EMAIL va ESKIZ_PASSWORD ni qo'shing (README'ga qarang)",
    });
  }

  let body;
  try {
    body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
  } catch {
    return res.status(400).json({ ok: false, error: 'Invalid JSON body' });
  }

  const phone = normalizePhone(body.phone);
  const message = String(body.message || '').trim();

  if (!isValidUzPhone(phone)) {
    return res.status(200).json({ ok: false, code: 'invalid_phone', error: "Telefon raqam noto'g'ri — +998 XX XXX XX XX ko'rinishida kiriting" });
  }
  if (!message) {
    return res.status(200).json({ ok: false, code: 'empty_message', error: 'Xabar matni bo\'sh' });
  }
  if (message.length > 500) {
    return res.status(200).json({ ok: false, code: 'message_too_long', error: "Xabar juda uzun (500 belgidan oshdi)" });
  }

  // Spam himoyasi
  const ip = String(req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const phoneCount = await getCount(`phone:${phone}`);
  const ipCount = await getCount(`ip:${ip}`);
  if (phoneCount >= DAILY_PHONE_LIMIT || ipCount >= DAILY_IP_LIMIT) {
    return res.status(200).json({
      ok: false,
      code: 'rate_limited',
      error: `Kunlik limit tugadi — ${phoneCount >= DAILY_PHONE_LIMIT ? 'bu raqamga' : 'bu qurilmadan'} ko'p SMS yuborish mumkin emas. Ertaga qayta urinib ko'ring.`,
    });
  }

  const result = await sendSms({ phone, message });

  if (result.ok) {
    await incrCount(`phone:${phone}`, 86400);
    await incrCount(`ip:${ip}`, 86400);
    return res.status(200).json({ ok: true, id: result.id || null });
  }

  return res.status(200).json(result);
}
