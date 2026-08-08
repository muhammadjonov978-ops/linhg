// To'lov buyurtmalari (orders) bilan ishlaydigan umumiy funksiyalar.
// Har bir order Redis'da "order:{orderId}" kalitida JSON sifatida saqlanadi.
import { redis } from './redis.js';
import { notifyTelegram, escapeHtml } from './telegram.js';

export const ORDER_TTL = 60 * 60 * 24; // 24 soat — to'lanmagan order muddati

export async function createOrder({ orderId, langId, amount, provider, plan }) {
  if (!redis) throw new Error('KV sozlanmagan: UPSTASH_REDIS_REST_URL/TOKEN kerak');
  const order = {
    orderId,
    langId: langId || null,
    amount: Number(amount),
    provider,
    plan: plan || 'language',
    status: 'pending',
    createdAt: Date.now(),
  };
  await redis.set(`order:${orderId}`, JSON.stringify(order), { ex: ORDER_TTL });
  return order;
}

export async function getOrder(orderId) {
  if (!redis || !orderId) return null;
  const raw = await redis.get(`order:${orderId}`);
  return raw ? JSON.parse(raw) : null;
}

export async function markOrderPaid(orderId, providerTxn) {
  if (!redis) return null;
  const order = await getOrder(orderId);
  if (!order) return null;
  const paid = { ...order, status: 'paid', providerTxn, paidAt: Date.now() };
  await redis.set(`order:${orderId}`, JSON.stringify(paid), { ex: ORDER_TTL });

  // Egasiga Telegram'da xabar yuboramiz — to'lov muvaffaqiyatli bo'ldi.
  // TO'LOV JARAYONINI SEKINLATMASLIK UCHUN bloklamasdan yuboramiz
  // (fire-and-forget): xato yoki sekin javob to'lovga ta'sir qilmaydi.
  try {
    if (redis) {
      await redis.incr('tg:orders_paid');
    }
    const amount = Number(order.amount || 0).toLocaleString('uz-UZ');
    const provider = String(order.provider || '?').toUpperCase();
    const message =
      `💰 <b>Yangi to'lov qabul qilindi!</b>\n\n` +
      `🧾 Buyurtma: <code>${escapeHtml(orderId)}</code>\n` +
      `💵 Summa: <b>${amount} so'm</b>\n` +
      `🏦 To'lov tizimi: <b>${escapeHtml(provider)}</b>\n` +
      `🕐 ${new Date(paid.paidAt).toLocaleString('uz-UZ')}\n\n` +
      `📊 <a href="${process.env.VITE_SITE_URL || 'https://lingohub.uz'}/#/admin">Admin panelni ochish</a>`;
    notifyTelegram(message).catch(() => {}); // await qilmaymiz
  } catch { /* telegram xatosi to'lovga ta'sir qilmaydi */ }

  return paid;
}

// Payme/Cliсk transaksiya kalitlari uchun kichik yordamchi
export function txnKey(prefix, id) {
  return `${prefix}:txn:${id}`;
}
