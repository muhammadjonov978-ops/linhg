// Admin hisoblari API:
//   GET    /api/admin/accounts?token=...   — barcha adminlar ro'yxati (parolsiz)
//   POST   /api/admin/accounts             — yangi hisob yaratish (faqat EGA)
//          body: { username, password, name }
//   DELETE /api/admin/accounts?username=.. — hisobni o'chirish (faqat EGA)
//
// Yaratilgan hisoblar endi HAQIQIY ishlaydi — darhol login qilish mumkin
// (Redis saqlanadi; Redis yo'q bo'lsa vaqtincha xotirada).
import { verifyToken, getAllAccounts } from '../_lib/adminAuth.js';
import { addStoredAccount, removeStoredAccount, getStoreMode } from '../_lib/adminAccounts.js';

function extractToken(req) {
  const auth = req.headers?.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return req.query?.token || '';
}

export default async function handler(req, res) {
  const token = extractToken(req);
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ ok: false, code: 'unauthorized', error: "Ruxsat yo'q — qayta kiring" });
  }

  // GET — ro'yxat
  if (req.method === 'GET') {
    const accounts = await getAllAccounts();
    return res.status(200).json({ ok: true, accounts, storeMode: getStoreMode() });
  }

  // POST — yaratish (faqat egasi)
  if (req.method === 'POST') {
    if (user.role !== 'owner') {
      return res.status(403).json({ ok: false, code: 'forbidden', error: 'Faqat egasi yangi hisob yarata oladi' });
    }
    const { username, password, name } = req.body || {};
    const result = await addStoredAccount({ username, password, name });
    if (!result.ok) {
      return res.status(200).json({ ok: false, code: result.code, error: result.error });
    }
    return res.status(200).json({
      ok: true,
      account: result.account,
      accounts: await getAllAccounts(),
      storeMode: getStoreMode(),
    });
  }

  // DELETE — o'chirish (faqat egasi)
  if (req.method === 'DELETE') {
    if (user.role !== 'owner') {
      return res.status(403).json({ ok: false, code: 'forbidden', error: "Faqat egasi hisob o'chira oladi" });
    }
    const username = req.query?.username || (req.body && req.body.username) || '';
    if (String(username).trim().toLowerCase() === user.username.toLowerCase()) {
      return res.status(200).json({ ok: false, code: 'self', error: "O'z hisobingizni o'chira olmaysiz" });
    }
    const result = await removeStoredAccount(username);
    if (!result.ok) {
      return res.status(200).json({ ok: false, code: result.code, error: result.error });
    }
    return res.status(200).json({
      ok: true,
      accounts: await getAllAccounts(),
      storeMode: getStoreMode(),
    });
  }

  return res.status(405).json({ ok: false, code: 'server_error', error: 'Method not allowed' });
}
