// To'lov buyurtmalari (orders) bilan ishlaydigan umumiy funksiyalar.
// Har bir order Redis'da "order:{orderId}" kalitida JSON sifatida saqlanadi.
import { redis } from './redis.js';

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
  return paid;
}

// Payme/Cliсk transaksiya kalitlari uchun kichik yordamchi
export function txnKey(prefix, id) {
  return `${prefix}:txn:${id}`;
}
