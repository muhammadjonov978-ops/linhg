#!/usr/bin/env node
// Telegram bot webhook'ni o'rnatish skripti.
// Ishlatish:
//   node scripts/set-telegram-webhook.mjs [https://lingohub.uz]
// Agar manzil berilmasa — .env'dagi VITE_SITE_URL yoki https://lingohub.uz ishlatiladi.
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function readEnvFile() {
  try {
    const p = resolve('.env');
    if (!existsSync(p)) return {};
    const map = {};
    readFileSync(p, 'utf8').split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m) map[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    });
    return map;
  } catch { return {}; }
}

const envFile = readEnvFile();
const token = process.env.TELEGRAM_BOT_TOKEN || envFile.TELEGRAM_BOT_TOKEN || '';
const siteUrl = process.argv[2] || process.env.VITE_SITE_URL || envFile.VITE_SITE_URL || 'https://lingohub.uz';

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN topilmadi. .env faylga yozing yoki env o\'rnating.');
  process.exit(1);
}

const webhookUrl = `${siteUrl.replace(/\/$/, '')}/api/telegram/webhook`;

console.log(`🔗 Webhook o'rnatilmoqda: ${webhookUrl}\n`);

const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: webhookUrl, allowed_updates: ['message', 'callback_query'] }),
});
const data = await res.json();

if (data?.ok) {
  console.log('✅ Webhook muvaffaqiyatli o\'rnatildi!');
  console.log('   Bot ishlashi uchun botga /start yuboring.');
} else {
  console.error('❌ Xato:', data?.description || 'Noma\'lum xato');
  console.error('   Token noto\'g\'ri yoki webhook o\'rnatib bo\'lmadi.');
  process.exit(1);
}
