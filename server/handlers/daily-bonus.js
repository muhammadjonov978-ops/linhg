// ============================================================
// GET  /api/daily/bonus         — kunlik bonus holati (olish mumkinmi?)
// POST /api/daily/bonus/claim   — kunlik bonus tangani olish
// ============================================================
// Barcha tekshiruvlar SERVER vaqtiga asoslangan (Redislarda):
// bir kunda bir martagina beriladi — soatni orqaga burib ham,
// localStorage'ni o'chirib ham cheat qilib bo'lmaydi.
//
// Body (claim): { uid }
// Javob (claim): { ok, granted, newStreak, alreadyClaimed }
// Javob (status): { ok, claimed, streak, nextAmount, lastClaimDate }
import { getDailyBonusStatus, claimDailyBonus } from '../lib/gamification.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const uid = String(req.query?.uid || '');
    const data = await getDailyBonusStatus(uid);
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
    const data = await claimDailyBonus(uid);
    return res.status(200).json(data);
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
