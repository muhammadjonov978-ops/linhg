// GET /api/telegram/info — bot holati (admin panel "Telegram" bo'limi uchun).
// Bot sozlanganmi, username nima, webhook o'rnatilganmi?
import { telegramApi, telegramConfigured, ownerChatId } from '../lib/telegram.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (!telegramConfigured()) {
    return res.status(200).json({ ok: false, configured: false, error: "Bot sozlanmagan (TELEGRAM_BOT_TOKEN yo'q)" });
  }

  let username = null;
  let webhookUrl = null;
  let pendingCount = null;

  try {
    const me = await telegramApi('getMe');
    if (me?.ok) {
      username = me.result?.username || null;
    }
    const wh = await telegramApi('getWebhookInfo');
    if (wh?.ok) {
      webhookUrl = wh.result?.url || null;
      pendingCount = wh.result?.pending_update_count ?? null;
    }
  } catch { /* noop */ }

  return res.status(200).json({
    ok: true,
    configured: true,
    username,
    hasOwnerChat: Boolean(ownerChatId()),
    webhookUrl,
    pendingCount,
  });
}
