// GET /api/health — backend tizim holati (admin panelda ko'rsatiladi)
// Redis ishlayaptimi? Payme/Click sozlanganmi? Admin login yoniqmi? Telegram bot?
import { redis } from './_lib/redis.js';
import { isAuthConfigured } from './_lib/adminAuth.js';
import { telegramConfigured, ownerChatId } from './_lib/telegram.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let redisOk = !!redis;
  if (redis) {
    try {
      const pong = await redis.ping();
      redisOk = pong === 'PONG';
    } catch {
      redisOk = false;
    }
  }

  return res.status(200).json({
    ok: true,
    services: {
      redis: redisOk,
      payme: Boolean(process.env.PAYME_MERCHANT_ID && process.env.PAYME_KEY),
      click: Boolean(process.env.CLICK_MERCHANT_ID && process.env.CLICK_SERVICE_ID && process.env.CLICK_SECRET_KEY),
      adminAuth: isAuthConfigured(),
      telegram: telegramConfigured(),
      telegramChat: Boolean(ownerChatId()),
    },
  });
}
