// ==== ADMIN PANEL LOGIN ====
// Hamma uchun BIRTA umumiy login:  shox / shox1010
// Admin panelda qo'shilgan qo'shimcha hisoblar ham (login + parol bilan) kira oladi.
//
// NOTE: bu himoya mijoz (brauzer) tomonida — statik sayt uchun demo. Haqiqiy
// xavfsizlik uchun backend + server tomonida autentifikatsiya kerak bo'ladi.

import { loadConfig } from './siteConfig';

// Umumiy kirish — hamma shu login/parol bilan panelga kira oladi
export const UNIVERSAL_USERNAME = 'shox';
export const UNIVERSAL_PASSWORD = 'shox1010';

export const getAdminAccounts = () => loadConfig().accounts || [];

export const findAdminUser = (username, password) => {
  const u = String(username || '').trim().toLowerCase();
  const p = String(password || '');

  // Bitta umumiy login/parol — hamma uchun
  if (u === UNIVERSAL_USERNAME && p === UNIVERSAL_PASSWORD) {
    return { username: UNIVERSAL_USERNAME, password: UNIVERSAL_PASSWORD, name: 'Shox', role: 'owner' };
  }

  // Admin panelda qo'shilgan boshqa hisoblar (egasi emas)
  const account = getAdminAccounts().find(
    (a) => a.role !== 'owner' && String(a.username || '').toLowerCase() === u && a.password === p
  );
  return account ? { ...account } : null;
};
