// GET /api/health — backend tizim holati (admin panelda ko'rsatiladi)
// Redis ishlayaptimi? Payme/Click sozlanganmi? Admin login yoniqmi? Telegram bot?
import { redis } from '../lib/redis.js';
import { isAuthConfigured } from '../lib/adminAuth.js';
import { telegramConfigured, ownerChatId } from '../lib/telegram.js';
import { smsConfigured } from '../lib/sms.js';
import { weekKey, getTournament } from '../lib/gamification.js';

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
      sms: smsConfigured(),
      gamification: Boolean(redis),
      tournamentWeek: weekKey(),
      tournament: await getTournament({ limit: 1 }).then((t) => t.ok ? { ok: true, mode: t.mode } : { ok: false }).catch(() => ({ ok: false })),
    },
  });
}
