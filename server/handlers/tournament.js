// ============================================================
// GET  /api/tournament               — joriy hafta turniri jadvali
// POST /api/tournament/score         — turnirga ball yozish
// POST /api/tournament/claim         — o'tgan hafta TOP-3 mukofotini olish
// ============================================================
// Haftalik turnir: har dushanba 00:00 da yangi hafta boshlanadi.
// Ball = tugallangan darslar * 10 + tanga / 10 + streak * 5.
// Hafta oxirida TOP-3: 1-o'rin 200🪙, 2-o'rin 100🪙, 3-o'rin 50🪙
// (mukofot faqat turnir sahifasida "Olib olish" tugmasi orqali).
import {
  weekKey, weekEndsAt, prevWeekKey,
  updateTournamentScore, getTournament,
  getTournamentPrize, claimTournamentPrize,
} from '../lib/gamification.js';

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    const uid = String(req.query?.uid || '');
    const week = String(req.query?.week || '') || undefined;
    const data = await getTournament({ week, limit: 20, uid });
    if (!data.ok) {
      return res.status(200).json({ ok: false, fallback: true, error: 'Turnir o\'qib bo\'lmadi' });
    }
    // O'tgan hafta TOP-3 bo'lsa — mukofot haqida ma'lumot
    const prize = await getTournamentPrize(uid);
    return res.status(200).json({
      ...data,
      endsAt: weekEndsAt(),
      prevWeek: prevWeekKey(),
      prize: prize.prize || 0,
      prizeRank: prize.rank || -1,
    });
  }

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

  if (method === 'POST' && (req.url?.includes('/claim') || body.action === 'claim')) {
    const data = await claimTournamentPrize(uid);
    return res.status(200).json(data);
  }

  if (method === 'POST') {
    await updateTournamentScore({
      uid,
      week: weekKey(),
      score: Number(body.score) || 0,
      name: String(body.name || 'O\'quvchi'),
      lessons: Number(body.lessons) || 0,
      coins: Number(body.coins) || 0,
      streak: Number(body.streak) || 0,
      lang: String(body.lang || ''),
    });
    return res.status(200).json({ ok: true, week: weekKey() });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
