// POST /api/admin/login — admin login (server-side tekshiruv)
// Body: { username, password }
// Javob: { ok: true, token, user: { username, name, role } }
//        yoki { ok: false, code: 'not_configured'|'invalid'|'server_error', error }
import { authenticate, isAuthConfigured, signToken, checkRateLimit, registerFailure, resetFailures, isUsingDefaultPassword } from '../_lib/adminAuth.js';
import { logAdminAttempt } from '../_lib/activityLog.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, code: 'server_error', error: 'Method not allowed' });
  }

  // Serverda ADMIN_PASSWORD o'rnatilmagan — login butunlay yopiq
  if (!isAuthConfigured()) {
    return res.status(200).json({
      ok: false,
      code: 'not_configured',
      error: "Admin panel server'da sozlanmagan. Vercel sozlamalariga ADMIN_PASSWORD ni qo'shing (README'ga qarang).",
    });
  }

  // Oddiy brute-force himoyasi: IP'ga 5 xato urinishdan keyin 5 daqiqa blok
  const ip = String(req.headers?.['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      ok: false,
      code: 'rate_limited',
      error: 'Juda ko\u2018p xato urinish. 5 daqiqadan keyin qayta urinib ko\u2018ring.',
    });
  }

  const { username, password } = req.body || {};
  const ua = String(req.headers?.['user-agent'] || '');
  const user = await authenticate(username, password);
  // Jonli faoliyat logi: kim kirgani (yoki urinib ko'rgani) qayd etiladi.
  // Fire-and-forget — login tezligini sekinlashtirmaslik uchun.
  const recordAttempt = (uname, ok) => {
    logAdminAttempt({ username: uname, ok, ip, ua }).catch(() => {});
  };
  if (!user) {
    registerFailure(ip);
    recordAttempt(username, false);
    return res.status(200).json({
      ok: false,
      code: 'invalid',
      error: "Login yoki parol noto'g'ri!",
    });
  }

  resetFailures(ip);
  recordAttempt(user.username, true);
  const token = signToken(user);
  // Default parol ishlatilayotgan bo'lsa — panelda ogohlantirish ko'rsatiladi
  const warning = isUsingDefaultPassword()
    ? "Standart parol ishlatilmoqda. Vercel sozlamalarida ADMIN_PASSWORD ni o'rnatish tavsiya etiladi (README'ga qarang)."
    : undefined;
  return res.status(200).json({ ok: true, token, user, warning });
}
