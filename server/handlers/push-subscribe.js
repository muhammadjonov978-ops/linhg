// POST /api/push/subscribe — foydalanuvchi brauzerining push obunasini saqlaydi.
// Redis'da ro'yxat shaklida saqlanadi (cheklangan miqdor — oxirgi 500).
import { redis } from '../lib/redis.js';

const LIST_KEY = 'push_subscriptions';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  if (!redis) {
    return res.status(200).json({ ok: false, reason: 'redis-not-configured' });
  }

  let body;
  try {
    body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
  } catch {
    return res.status(400).json({ ok: false, error: 'Invalid JSON body' });
  }

  const subscription = body.subscription;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ ok: false, error: 'subscription kerak' });
  }

  try {
    const existing = await redis.lrange(LIST_KEY, 0, -1);
    const serialized = JSON.stringify(subscription);
    // Dublikatni oldini olish: endpoint allaqachon bor bo'lsa — qo'shmaymiz
    if (!existing.includes(serialized)) {
      await redis.rpush(LIST_KEY, serialized);
      const len = await redis.llen(LIST_KEY);
      // Ro'yxat juda o'sib ketsa — eski obunalarni olib tashlaymiz
      if (len > 500) {
        await redis.ltrim(LIST_KEY, len - 500, -1);
      }
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('push subscribe error:', e?.message);
    return res.status(500).json({ ok: false, error: e?.message });
  }
}
