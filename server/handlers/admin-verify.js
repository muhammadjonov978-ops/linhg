// GET /api/admin/verify?token=... — sessiya token'ini server'da tekshiradi.
// Brauzer localStorage'ida saqlangan sessiyani soxtalashtirib bo'lmaydi —
// chunki token faqat server (ADMIN_PASSWORD/ADMIN_TOKEN_SECRET) bilan
// imzolangan bo'ladi va bu yerda tasdiqlanadi.
import { verifyToken, isAuthConfigured } from '../lib/adminAuth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, code: 'server_error', error: 'Method not allowed' });
  }
  if (!isAuthConfigured()) {
    return res.status(200).json({
      ok: false,
      code: 'not_configured',
      error: "Admin panel server'da sozlanmagan. Vercel sozlamalariga ADMIN_PASSWORD ni qo'shing (README'ga qarang).",
    });
  }

  const token = req.query?.token || '';
  const user = verifyToken(token);
  if (!user) {
    return res.status(200).json({ ok: false, code: 'invalid', error: 'Sessiya yaroqsiz yoki muddati tugagan' });
  }
  return res.status(200).json({ ok: true, user });
}
