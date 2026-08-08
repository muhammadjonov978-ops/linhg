// GET /api/admin/activity?token=... — admin panel faoliyatini jonli ko'rsatish:
//   entries — so'nggi kirish urinishlari (kim kirdi, muvaffaqiyatlimi, vaqti, IP)
//   total   — jami kirishlar (barcha vaqt)
//   today   — bugungi kirishlar
//   mode    — 'redis' (barcha qurilmalarda doimiy) | 'memory' (demo rejim)
// Faqat admin sessiya tokeni bilan ishlaydi.
import { verifyToken } from '../_lib/adminAuth.js';
import { getAdminActivity } from '../_lib/activityLog.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  const auth = req.headers?.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : (req.query?.token || '');
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ ok: false, code: 'unauthorized', error: "Ruxsat yo'q" });
  }
  const activity = await getAdminActivity();
  return res.status(200).json({ ok: true, ...activity, viewer: user.username });
}
