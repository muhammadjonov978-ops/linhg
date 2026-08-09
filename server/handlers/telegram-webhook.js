// POST /api/telegram/webhook — Telegram bot webhook.
// BotFather'da webhook URL:
//   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://lingohub.uz/api/telegram/webhook
// (yoki `node scripts/set-telegram-webhook.mjs` ishga tushiring)
//
// Buyruqlar:
//   /start — salomlashish + tugmalar
//   /help  — barcha buyruqlar ro'yxati
//   /stats — sayt statistikasi
//   /site  — sayt manzili
import { telegramApi, rememberChat, escapeHtml, telegramConfigured, storeVerifyCode } from '../lib/telegram.js';
import { redis } from '../lib/redis.js';

const SITE_URL = process.env.VITE_SITE_URL || 'https://lingohub.uz';

const KEYBOARD = {
  inline_keyboard: [
    [
      { text: '🌐 Saytga o\'tish', url: SITE_URL },
      { text: '👑 Admin panel', url: `${SITE_URL}/#/admin` },
    ],
    [
      { text: '📊 Statistika', callback_data: 'stats' },
      { text: '❓ Yordam', callback_data: 'help' },
    ],
  ],
};

function welcomeMessage(firstName) {
  const name = escapeHtml(firstName || 'do\'stim');
  return (
    `Assalomu alaykum, <b>${name}</b>! 👋\n\n` +
    `Bu <b>Lingohub</b> rasmiy boti — ${escapeHtml(SITE_URL.replace('https://', ''))} saytining yordamchisi.\n\n` +
    `🌍 <b>130+ til</b> bepul o'rganing:\n` +
    `🔤 Alifbo · 📖 Reading · 🎧 Listening · ✍️ Writing · 🎤 Speaking\n\n` +
    `Quyidagi tugmalar yoki buyruqlar orqali davom eting:\n` +
    `/start — salomlashish\n` +
    `/stats — sayt statistikasi\n` +
    `/site — sayt manzili\n` +
    `/help — yordam`
  );
}

function helpMessage() {
  return (
    `<b>🤖 Lingohub bot — yordam</b>\n\n` +
    `<b>Buyruqlar:</b>\n` +
    `/start — salomlashish va tugmalar\n` +
    `/stats — sayt statistikasi (tillar, tashriflar, to'lovlar)\n` +
    `/site — saytga havola\n` +
    `/help — ushbu yordam\n\n` +
    `<b>Nima qila oladi?</b>\n` +
    `• Saytdagi yangi to'lovlar haqida xabar beradi 💰\n` +
    `• Sayt statistikasini ko'rsatadi 📊\n` +
    `• Egasi uchun maxsus bildirishnomalar yuboradi 🔔\n\n` +
    `Savollar bo'lsa: ${escapeHtml(SITE_URL.replace('https://', ''))} 🌐`
  );
}

async function statsMessage() {
  const lines = ['<b>📊 Lingohub statistikasi</b>\n'];
  lines.push(`🌍 Tillar soni: <b>135+</b>`);
  lines.push(`👥 O'quvchilar: <b>550K+</b>`);
  lines.push(`📚 Darslar: <b>100 ta / til</b>`);

  if (redis) {
    try {
      const paid = await redis.get('tg:orders_paid');
      const chats = await redis.scard('tg:chats');
      lines.push(`💰 To'langan buyurtmalar: <b>${Number(paid || 0).toLocaleString('uz-UZ')}</b>`);
      lines.push(`👤 Bot foydalanuvchilari: <b>${Number(chats || 0)}</b>`);
    } catch { /* noop */ }
  } else {
    lines.push(`\n<i>To'liq statistika uchun Redis (UPSTASH) sozlanishi kerak.</i>`);
  }

  lines.push(`\n🔗 <a href="${escapeHtml(SITE_URL)}">Saytga o'tish</a>`);
  return lines.join('\n');
}

async function handleCommand(chatId, msg, text) {
  const cmd = String(text || '').split(' ')[0].toLowerCase();

  if (cmd === '/start') {
    const arg = String(text || '').split(/\s+/)[1] || '';
    // Sayt shlyuzi: foydalanuvchi /start verify_<kod> yuborgan — obunani tasdiqlaymiz
    if (arg.startsWith('verify_')) {
      const code = arg.slice('verify_'.length);
      const from = (msg && msg.from) || {};
      await storeVerifyCode(code, from.id, from.username, from.first_name);
      return telegramApi('sendMessage', {
        chat_id: chatId,
        text: `✅ <b>Tasdiqlandi!</b> 👋\n\nEndi saytga qayting va "Tasdiqlash" tugmasini qayta bosing — obunangiz tekshiriladi.`,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: [[{ text: '🌐 Saytga qaytish', url: SITE_URL }]] },
      });
    }
    return telegramApi('sendMessage', { chat_id: chatId, text: welcomeMessage(), reply_markup: KEYBOARD });
  }

  switch (cmd) {
    case '/help':
      return telegramApi('sendMessage', { chat_id: chatId, text: helpMessage() });
    case '/stats':
      return telegramApi('sendMessage', { chat_id: chatId, text: await statsMessage(), parse_mode: 'HTML', disable_web_page_preview: true });
    case '/site':
      return telegramApi('sendMessage', {
        chat_id: chatId,
        text: `🌐 <b>Lingohub</b> — ${escapeHtml(SITE_URL)}\n\n130+ tilda bepul til o'rganing!`,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: [[{ text: '🌐 Saytga o\'tish', url: SITE_URL }]] },
      });
    default:
      return telegramApi('sendMessage', {
        chat_id: chatId,
        text: `Tushunmadim 🤔\n\nBuyruqlar: /start, /help, /stats, /site\n\nYoki tugmalardan birini bosing 👇`,
        reply_markup: KEYBOARD,
      });
  }
}

async function handleCallback(chatId, callbackData) {
  // Callback query — tugma bosilganda
  let text = '';
  switch (callbackData) {
    case 'stats':
      text = await statsMessage();
      break;
    case 'help':
      text = helpMessage();
      break;
    default:
      text = 'Yordam kerakmi? /help ni yuboring 🙂';
  }
  return telegramApi('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (!telegramConfigured()) {
    return res.status(200).json({ ok: false, error: "Bot sozlanmagan (TELEGRAM_BOT_TOKEN yo'q)" });
  }

  const update = req.body || {};

  try {
    const msg = update.message;
    const cb = update.callback_query;

    if (cb?.message) {
      const chatId = cb.message.chat?.id;
      if (chatId) {
        await rememberChat(chatId);
        // Tugma bosilganda loading spinner'ni to'xtatamiz
        await telegramApi('answerCallbackQuery', { callback_query_id: cb.id }).catch(() => {});
        await handleCallback(chatId, cb.data);
      }
      return res.status(200).json({ ok: true });
    }

    if (msg?.chat?.id) {
      const chatId = msg.chat.id;
      await rememberChat(chatId);
      const text = msg.text || '';

      // Hozircha barcha matnli xabarlar buyruq sifatida qabul qilinadi
      await handleCommand(chatId, msg, text);
      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(200).json({ ok: false, error: e?.message || 'Internal error' });
  }
}
