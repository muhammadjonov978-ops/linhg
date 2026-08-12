// ============================================================
// POST /api/leaderboard/report — o'quvchining reyting ballini serverga yozish
// GET  /api/leaderboard       — global reyting jadvali (serverdan)
// ============================================================
// Ball = tugallangan darslar * 10 + tanga / 10 + streak * 5
// (frontend'da hisoblanadi — Leaderboard.jsx bilan bir xil formula)
//
// Body (report): { uid, name, score, lessons, coins, streak, lang }
// Javob (report): { ok, mode }  — mode: 'redis' | 'memory'
// Javob (get):    { ok, mode, entries, myRank, myScore }
//
// Redis sozlanmagan bo'lsa ham in-memory rejim ishlaydi (demo).
import { updateLeaderboardScore, getLeaderboard } from '../lib/gamification.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const uid = String(req.query?.uid || '');
    const limit = Math.min(Number(req.query?.limit) || 50, 100);
    const data = await getLeaderboard({ limit, uid });
    if (!data.ok) {
      return res.status(200).json({ ok: false, fallback: true, error: 'Reyting o\'qib bo\'lmadi' });
    }
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    let body;
    try {
      body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
    } catch {
      return res.status(400).json({ ok: false, error: 'Invalid JSON body' });
    }
    const uid = String(body.uid || '').trim();
    if (!uid || uid.length > 64) {
      return res.status(200).json({ ok: false, error: 'uid kerak' });
    }
    await updateLeaderboardScore({
      uid,
      score: Number(body.score) || 0,
      name: String(body.name || 'O\'quvchi'),
      lessons: Number(body.lessons) || 0,
      coins: Number(body.coins) || 0,
      streak: Number(body.streak) || 0,
      lang: String(body.lang || ''),
    });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
