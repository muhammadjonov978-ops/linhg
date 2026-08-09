// Telegram obuna tekshiruvi — sayt shlyuzi uchun.
//   POST /api/telegram/verify        { channel } → { ok, code, botUsername, configured }
//   GET  /api/telegram/verify/status ?code=...&channel=@khoja_akbar → { ok, pending, member?, error? }
//
// Jarayon:
//   1. Sayt POST /api/telegram/verify orqali tasodifiy kod oladi.
//   2. Foydalanuvchiga https://t.me/<bot>?start=verify_<kod> havolasi ochiladi.
//   3. Bot webhook kodni va foydalanuvchining Telegram ID sini eslab qoladi.
//   4. Sayt GET status orqali kod bo'yicha so'raydi → getChatMember bilan
//      kanal a'zoligi tekshiriladi (bot kanalga admin qo'shilgan bo'lishi shart).
import { telegramApi, telegramConfigured, getChatMember, resolveVerifyCode } from '../lib/telegram.js';

// Kanal nomi → Telegram chat username (tekshirish uchun)
const CHANNEL_MAP = {
  'khoja_akbar': '@khoja_akbar',
};

function makeCode() {
  return (
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36).slice(-4) +
    Math.random().toString(36).slice(2, 6)
  );
}

async function botUsername() {
  const me = await telegramApi('getMe');
  return me?.ok ? me.result?.username || null : null;
}

export default async function handler(req, res) {
  // ---- POST /api/telegram/verify — yangi kod yaratish ----
  if (req.method === 'POST') {
    if (!telegramConfigured()) {
      return res.status(200).json({ ok: true, configured: false, code: null, botUsername: null, error: "Bot sozlanmagan (TELEGRAM_BOT_TOKEN yo'q)" });
    }
    const username = await botUsername();
    const code = makeCode();
    return res.status(200).json({ ok: true, configured: true, code, botUsername: username });
  }

  // ---- GET /api/telegram/verify/status — kod bo'yicha holat ----
  if (req.method === 'GET') {
    const code = String((req.query && req.query.code) || '').trim();
    if (!code) {
      return res.status(400).json({ ok: false, error: 'code kerak' });
    }
    const channel = String((req.query && req.query.channel) || 'khoja_akbar');
    const chatId = CHANNEL_MAP[channel] || `@${channel.replace(/^@/, '')}`;

    const mapping = await resolveVerifyCode(code);
    if (!mapping) {
      // Hali foydalanuvchi botga yubormagan — kutamiz
      return res.status(200).json({ ok: true, pending: true });
    }

    const check = await getChatMember(chatId, mapping.userId);
    if (!check.ok) {
      return res.status(200).json({
        ok: true,
        pending: false,
        member: false,
        error: check.error || 'telegram_error',
      });
    }
    return res.status(200).json({
      ok: true,
      pending: false,
      member: check.member,
      status: check.status,
      user: { id: mapping.userId, username: mapping.username, firstName: mapping.firstName },
    });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
