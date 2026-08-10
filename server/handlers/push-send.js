// POST /api/push/send — barcha obuna bo'lgan brauzerlarga push yuboradi.
// Body: { title, body, url }
// VAPID kalitlari server'da (MAXFIY): VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT.
// web-push kutubxonasi ishlatiladi (npm install web-push).
import webpush from 'web-push';
import { redis } from '../lib/redis.js';

const LIST_KEY = 'push_subscriptions';
let configured = false;

function ensureWebpush() {
  if (configured) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY || '';
  const privateKey = process.env.VAPID_PRIVATE_KEY || '';
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@lingohub.uz',
    publicKey,
    privateKey,
  );
  configured = true;
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  if (!redis) {
    return res.status(200).json({ ok: false, reason: 'redis-not-configured' });
  }

  if (!ensureWebpush()) {
    return res.status(200).json({ ok: false, reason: 'vapid-not-configured' });
  }

  let body;
  try {
    body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
  } catch {
    return res.status(400).json({ ok: false, error: 'Invalid JSON body' });
  }

  const title = String(body.title || 'Lingohub');
  const msgBody = String(body.body || 'Yangi xabar!');
  const url = String(body.url || '/');

  try {
    const subs = await redis.lrange(LIST_KEY, 0, -1);
    const payload = JSON.stringify({ title, body: msgBody, url, icon: '/favicon-192x192.png' });

    let sent = 0;
    let failed = 0;
    const dead = [];      for (const raw of subs) {
      try {
        const subscription = JSON.parse(raw);
        await webpush.sendNotification(subscription, payload);
        sent++;
      } catch (e) {
        failed++;
        // 404/410 — obuna yaroqsiz (brauzer o'chirilgan) — o'chirib tashlaymiz
        if (e?.statusCode === 404 || e?.statusCode === 410) dead.push(raw);
      }
    }

    // Yaroqsiz obunalarni tozalash
    if (dead.length > 0) {
      const alive = subs.filter((s) => !dead.includes(s));
      await redis.del(LIST_KEY);
      if (alive.length > 0) await redis.rpush(LIST_KEY, ...alive);
    }

    return res.status(200).json({ ok: true, sent, failed });
  } catch (e) {
    console.error('push send error:', e?.message);
    return res.status(500).json({ ok: false, error: e?.message });
  }
}
