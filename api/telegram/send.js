// POST /api/telegram/send — bot orqali xabar yuborish (admin panel "test" tugmasi).
// Body: { text }
// Xavfsizlik: Admin sessiya tokeni talab qilinadi (api/admin/login'da olingan).
//   Authorization: Bearer <token>
// Javob: { ok, results } — xabar yuborilgan chatlar ro'yxati.
import { notifyTelegram, telegramConfigured } from '../_lib/telegram.js';
import { verifyToken } from '../_lib/adminAuth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // Admin sessiyasi kerak — faqat adminlar xabar yubora oladi
  const auth = String(req.headers?.authorization || '');
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!verifyToken(token)) {
    return res.status(401).json({ ok: false, code: 'unauthorized', error: 'Ruxsat yo\'q — admin sessiyasi talab qilinadi' });
  }

  if (!telegramConfigured()) {
    return res.status(200).json({ ok: false, code: 'not_configured', error: "Bot sozlanmagan (TELEGRAM_BOT_TOKEN yo'q)" });
  }

  const text = String(req.body?.text || '').trim();
  if (!text) {
    return res.status(200).json({ ok: false, error: 'Xabar matni bo\'sh' });
  }

  const result = await notifyTelegram(text);
  return res.status(200).json(result);
}
