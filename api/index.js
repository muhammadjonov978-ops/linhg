// ============================================================
// api/index.js — YAGONA Vercel serverless funksiya (ROUTER)
// ============================================================
// Ilgari api/ papkasida 13 ta alohida funksiya bor edi:
//   /api/admin/login, /api/admin/verify, /api/admin/accounts,
//   /api/admin/activity, /api/click/webhook, /api/payme/webhook,
//   /api/telegram/{info,send,webhook}, /api/payment/{create,status},
//   /api/prices, /api/health
//
// Vercel Hobby plan'da deployment uchun KO'PI BILAN 12 ta serverless
// funksiya qo'shish mumkin — shuning uchun hammasi bitta funksiyaga
// birlashtirildi. Handler kodlari server/handlers/ da (funksiya EMAS),
// umumiy logika server/lib/ da. So'rovlar yo'naltirish (routing) shu
// faylda sodir bo'ladi.
//
// vercel.json'dagi rewrite:
//   { "source": "/api/(.*)", "destination": "/api/index" }
// — barcha /api/* so'rovlar aynan shu faylga keladi va req.url'da ASL
// yo'l saqlanadi (masalan "/api/admin/login?x=1").

import adminLogin from '../server/handlers/admin-login.js';
import adminVerify from '../server/handlers/admin-verify.js';
import adminAccounts from '../server/handlers/admin-accounts.js';
import adminActivity from '../server/handlers/admin-activity.js';
import clickWebhook from '../server/handlers/click-webhook.js';
import paymeWebhook from '../server/handlers/payme-webhook.js';
import telegramInfo from '../server/handlers/telegram-info.js';
import telegramSend from '../server/handlers/telegram-send.js';
import telegramWebhook from '../server/handlers/telegram-webhook.js';
import telegramVerify from '../server/handlers/telegram-verify.js';
import paymentCreate from '../server/handlers/payment-create.js';
import paymentStatus from '../server/handlers/payment-status.js';
import prices from '../server/handlers/prices.js';
import health from '../server/handlers/health.js';

// Route jadvali: yo'l → handler.
// `method` ko'rsatilgan bo'lsa router tekshiradi; ko'rsatilmagan bo'lsa
// (masalan accounts, click webhook) handler'ning o'zi metodni boshqaradi.
const routes = [
  { path: '/admin/login', method: 'POST', handler: adminLogin },
  { path: '/admin/verify', method: 'GET', handler: adminVerify },
  { path: '/admin/accounts', handler: adminAccounts }, // GET | POST | DELETE
  { path: '/admin/activity', method: 'GET', handler: adminActivity },
  { path: '/click/webhook', handler: clickWebhook },   // POST | GET
  { path: '/payme/webhook', method: 'POST', handler: paymeWebhook },
  { path: '/telegram/info', method: 'GET', handler: telegramInfo },
  { path: '/telegram/send', method: 'POST', handler: telegramSend },
  { path: '/telegram/webhook', method: 'POST', handler: telegramWebhook },
  { path: '/telegram/verify', method: 'POST', handler: telegramVerify },
  { path: '/telegram/verify/status', method: 'GET', handler: telegramVerify },
  { path: '/payment/create', method: 'POST', handler: paymentCreate },
  { path: '/payment/status', method: 'GET', handler: paymentStatus },
  { path: '/prices', method: 'GET', handler: prices },
  { path: '/health', method: 'GET', handler: health },
];

export default async function handler(req, res) {
  // req.url: "/api/admin/login?token=..." — query'ni tashlab, yo'lni olamiz.
  const raw = String(req.url || '/').split('?')[0];

  // "/api" prefiksini tozalaymiz → "/admin/login"
  let pathname = raw.startsWith('/api') ? raw.slice(4) : raw;
  if (!pathname.startsWith('/')) pathname = `/${pathname}`;
  // Oxiridagi "/" ni tozalaymiz ("/health/" → "/health")
  if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);

  const route = routes.find((r) => r.path === pathname);
  if (!route) {
    return res.status(404).json({ ok: false, error: `Route topilmadi: ${pathname}` });
  }
  if (route.method && route.method !== req.method) {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  return route.handler(req, res);
}
