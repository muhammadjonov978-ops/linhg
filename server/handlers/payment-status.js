// GET /api/payment/status?orderId=... — buyurtma to'langanini tekshiradi
import { getOrder } from '../lib/orders.js';

export default async function handler(req, res) {
  const { orderId } = req.query || {};
  if (!orderId) {
    return res.status(400).json({ ok: false, error: 'orderId kerak' });
  }

  try {
    const order = await getOrder(orderId);
    if (!order) {
      return res.status(404).json({ ok: false, error: 'Order topilmadi' });
    }
    return res.status(200).json({
      ok: true,
      status: order.status, // 'pending' | 'paid'
      plan: order.plan,
      langId: order.langId,
      amount: order.amount,
      provider: order.provider,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || 'Server xatosi' });
  }
}
