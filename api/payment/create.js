// POST /api/payment/create — yangi to'lov buyurtmasi yaratadi
// Body: { orderId, langId, amount (so'm), provider: 'payme'|'click', plan?: 'language'|'premium' }
import { createOrder } from '../_lib/orders.js';

// Premium narxlari — server-side tasdiqlash uchun.
// Default qiymatlar src/config.js dagi narxlar bilan bir xil; Vercel'da
// PREMIUM_MONTHLY_PRICE / PREMIUM_YEARLY_PRICE orqali o'zgartirish mumkin.
const PREMIUM_MONTHLY_PRICE = Number(process.env.PREMIUM_MONTHLY_PRICE) || 49000;
const PREMIUM_YEARLY_PRICE = Number(process.env.PREMIUM_YEARLY_PRICE) || 490000;

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
  // Minimal to'lov — 1 so'm yoki juda kichik summalarni oldini olish.
  // Haqiqiy narxlar server'da tekshirilmaydi (admin narxlari client'da),
  // lekin eng kamida realistik summa talab qilinadi.
  if (amt < 1000) {
    return res.status(400).json({ ok: false, error: 'Minimal to\'lov summasi 1000 so\'m' });
  }
  if (provider !== 'payme' && provider !== 'click') {
    return res.status(400).json({ ok: false, error: 'provider noto\'g\'ri' });
  }

  // Premium (obuna) narxini server'da qat'iy tekshiramiz — kimdir arzon
  // summa yuborib premium ochib olishining oldini olish uchun.
  // DIQQAT: frontend premium buyurtmalarda langId='premium' va plan='monthly'/'yearly'
  // yuboradi — shuning uchun ikkalasini ham tekshiramiz.
  if ((plan === 'premium' || langId === 'premium') && !PREMIUM_PRICES.has(amt)) {
    return res.status(400).json({ ok: false, error: 'Premium narxi noto\'g\'ri' });
  }

  try {
    const order = await createOrder({ orderId, langId, amount: amt, provider, plan });
    return res.status(200).json({ ok: true, order });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || 'Server xatosi' });
  }
}
