// GET /api/prices — server'dagi QAT'IY narxlar (source of truth).
// Admin panel "Til narxlari" bo'limida ko'rsatiladi: agar panel'dagi narx
// server narxidan farq qilsa, to'lov "Til narxi noto'g'ri" deb rad etiladi.
import { LANGUAGE_PRICES, PREMIUM_MONTHLY_PRICE, PREMIUM_YEARLY_PRICE } from './_lib/prices.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  return res.status(200).json({
    ok: true,
    prices: LANGUAGE_PRICES,
    premium: { monthly: PREMIUM_MONTHLY_PRICE, yearly: PREMIUM_YEARLY_PRICE },
  });
}
