// ==== ADMIN PANEL LOGIN (server-side) ====
// Parol endi BRAUZER KODIDA SAQLANMAYDI. Login/parol serverda tekshiriladi:
//   POST /api/admin/login   — kirish (token qaytaradi)
//   GET  /api/admin/verify  — saqlangan sessiyani tasdiqlash
//
// Vercel sozlamalarida (Environment Variables) o'rnatilishi kerak:
//   ADMIN_USERNAME  (ixtiyoriy, default: shox)
//   ADMIN_PASSWORD  (majburiy — egasi paroli, maxfiy!)
//   ADMIN_NAME      (ixtiyoriy, default: Shox)
//   ADMIN_EXTRA_ACCOUNTS (ixtiyoriy: login:parol:Ism,login2:parol2:Ism2)
//
// Agar ADMIN_PASSWORD o'rnatilmagan bo'lsa — login ishlamaydi va panel
// tushunarli xato ko'rsatadi (README'ga qarang).

// Egasi logini — panel'dagi ro'yxatlar (masalan CoinsTab) uchun
export const UNIVERSAL_USERNAME = 'shxsh';

// Admin sessiya saqlanadigan localStorage kaliti (AdminPanel + asosiy ilova)
export const ADMIN_SESSION_KEY = 'lingohub_admin_session';

// Serverga kirish so'rovi. Natija:
//   { ok: true, token, user: { username, name, role } }
//   { ok: false, code: 'not_configured'|'invalid'|'server_error'|'network', error }
export async function adminLogin(username, password) {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      return {
        ok: false,
        code: data?.code || 'server_error',
        error: data?.error || 'Server xatosi. Qayta urinib ko\u2018ring.',
      };
    }
    return { ok: true, token: data.token, user: data.user };
  } catch {
    return { ok: false, code: 'network', error: 'Serverga ulanishmadi. Internetni tekshiring va qayta urinib ko\u2018ring.' };
  }
}

// Saqlangan sessiyani server'da tasdiqlaydi — soxtalashtirilgan sessiyalar
// bu yerda rad etiladi va foydalanuvchi chiqarib yuboriladi.
export async function verifyAdminSession(token) {
  if (!token) return { ok: false, code: 'invalid', error: 'Sessiya yo\u2018q' };
  try {
    const res = await fetch(`/api/admin/verify?token=${encodeURIComponent(token)}`);
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      return {
        ok: false,
        code: data?.code || 'invalid',
        error: data?.error || 'Sessiya yaroqsiz',
      };
    }
    return { ok: true, user: data.user };
  } catch {
    return { ok: false, code: 'network', error: 'Serverga ulanishmadi' };
  }
}

// ---- Admin hisoblari API (panel'da yaratilgan hisoblar HAQIQIY ishlaydi) ----

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// GET /api/admin/accounts — barcha adminlar ro'yxati (parolsiz)
export async function adminFetchAccounts(token) {
  try {
    const res = await fetch(`/api/admin/accounts${token ? `?token=${encodeURIComponent(token)}` : ''}`);
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) return { ok: false, error: data?.error || 'Server xatosi' };
    return { ok: true, accounts: data.accounts, storeMode: data.storeMode };
  } catch {
    return { ok: false, code: 'network', error: 'Serverga ulanishmadi' };
  }
}

// POST /api/admin/accounts — yangi hisob yaratish (faqat egasi)
export async function adminCreateAccount(token, { username, password, name }) {
  try {
    const res = await fetch('/api/admin/accounts', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ username, password, name }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) return { ok: false, code: data?.code, error: data?.error || 'Server xatosi' };
    return { ok: true, account: data.account, accounts: data.accounts, storeMode: data.storeMode };
  } catch {
    return { ok: false, code: 'network', error: 'Serverga ulanishmadi' };
  }
}

// DELETE /api/admin/accounts — hisobni o'chirish (faqat egasi)
export async function adminDeleteAccount(token, username) {
  try {
    const res = await fetch(`/api/admin/accounts?username=${encodeURIComponent(username)}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) return { ok: false, code: data?.code, error: data?.error || 'Server xatosi' };
    return { ok: true, accounts: data.accounts, storeMode: data.storeMode };
  } catch {
    return { ok: false, code: 'network', error: 'Serverga ulanishmadi' };
  }
}

// GET /api/admin/activity — kim kirganini jonli ko'rsatish
//   { entries, total, today, mode }  (mode: 'redis' | 'memory')
export async function adminFetchActivity(token) {
  try {
    const res = await fetch(`/api/admin/activity?token=${encodeURIComponent(token || '')}`);
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) return null;
    return data;
  } catch {
    return null;
  }
}
