// POST /api/payment/create — yangi to'lov buyurtmasi yaratadi
// Body: { orderId, langId, amount (so'm), provider: 'payme'|'click', plan?: 'language'|'premium' }
import { createOrder } from '../lib/orders.js';
import { LANGUAGE_PRICES, PREMIUM_MONTHLY_PRICE, PREMIUM_YEARLY_PRICE } from '../lib/prices.js';

// Premium plan uchun ruxsat etilgan narxlar ro'yxati
const PREMIUM_PRICES = new Set([PREMIUM_MONTHLY_PRICE, PREMIUM_YEARLY_PRICE]);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { orderId, langId, amount, provider, plan } = req.body || {};

  if (!orderId || typeof orderId !== 'string' || orderId.length < 8 || orderId.length > 80) {
    return res.status(400).json({ ok: false, error: 'orderId noto\'g\'ri' });
  }
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) {
    return res.status(400).json({ ok: false, error: 'amount noto\'g\'ri' });
  }
  // Minimal to'lov — juda kichik/noto'g'ri summalarni oldindan rad etish.
  // Aniq narx tekshiruvi quyida (server/lib/prices.js bo'yicha) amalga oshiriladi.
  if (amt < 1000) {
    return res.status(400).json({ ok: false, error: 'Minimal to\'lov summasi 1000 so\'m' });
  }
  if (provider !== 'payme' && provider !== 'click') {
    return res.status(400).json({ ok: false, error: 'provider noto\'g\'ri' });
  }

  // Narxni server'da QAT'IY tekshiramiz — kimdir arzon summa yuborib
  // til/premium ochib olishining oldini olish uchun.
  // DIQQAT: frontend premium buyurtmalarda langId='premium' va plan='monthly'/'yearly'
  // yuboradi — shuning uchun ikkalasini ham tekshiramiz.
  const isPremium = plan === 'premium' || langId === 'premium';
  if (isPremium) {
    if (!PREMIUM_PRICES.has(amt)) {
      return res.status(400).json({ ok: false, error: 'Premium narxi noto\'g\'ri' });
    }
  } else {
    // Til (language) buyurtmasi: langId pullik tillar ro'yxatida bo'lishi va
    // summa aynan shu til narxiga teng bo'lishi shart (server/lib/prices.js).
    const expectedPrice = LANGUAGE_PRICES[langId];
    if (!expectedPrice) {
      return res.status(400).json({ ok: false, error: 'Bunday til aniqlanmadi' });
    }
    if (amt !== expectedPrice) {
      return res.status(400).json({ ok: false, error: 'Til narxi noto\'g\'ri' });
    }
  }

  try {
    const order = await createOrder({ orderId, langId, amount: amt, provider, plan });
    return res.status(200).json({ ok: true, order });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || 'Server xatosi' });
  }
}
