// ============================================================
// POST /api/stats/event              — hodisa qayd qilish (lesson/visit/lang)
// GET  /api/stats/dashboard          — sayt egasi uchun server statistika
// ============================================================
// Event body: { type: 'lesson'|'visit'|'lang', lang?, uid? }
//   - lesson — tugallangan dars (lang majburiy)
//   - visit  — saytga yangi tashrif
//   - lang   — til tanlash (lang majburiy)
//
// Dashboard faqat ADMIN sessiya tokeni bilan ochiladi (xavfsizlik).
import { verifyToken } from '../lib/adminAuth.js';
import { trackStat, trackUserActivity, getServerStats } from '../lib/gamification.js';

export default async function handler(req, res) {
  // ---------- DASHBOARD (admin) ----------
  if (req.method === 'GET' && String(req.url || '').includes('/dashboard')) {
    const auth = String(req.headers?.authorization || '');
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : (req.query?.token || '');
    if (!verifyToken(token)) {
      return res.status(401).json({ ok: false, code: 'unauthorized', error: 'Ruxsat yo\'q — admin sessiyasi talab qilinadi' });
    }
    const stats = await getServerStats();
    return res.status(200).json(stats);
  }

  // ---------- EVENT (o'quvchilar) ----------
  if (req.method === 'POST') {
    let body;
    try {
      body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
    } catch {
      return res.status(400).json({ ok: false, error: 'Invalid JSON body' });
    }
    const type = String(body.type || '').trim();
    if (!['lesson', 'visit', 'lang'].includes(type)) {
      return res.status(200).json({ ok: false, error: 'type noto\'g\'ri' });
    }
    const lang = String(body.lang || '').slice(0, 20);
    const uid = String(body.uid || '').slice(0, 64);

    await trackStat({ type, lang: type === 'visit' ? '' : lang });
    if (uid) await trackUserActivity(uid);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
