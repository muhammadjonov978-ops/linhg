// ==== ADMIN PANEL ACCOUNTS ====
// Barcha hisoblar uchun parol bir xil: shox1010
// Egas:  shox / shox1010
// Jami 5 ta hisob panelga kira oladi (egasi + 4 ta admin).
//
// NOTE: bu foydalanuvchilar ro'yxati mijoz (brauzer) tomonida saqlanadi —
// statik sayt uchun mo'ljallangan demo himoya. Haqiqiy xavfsizlik uchun
// backend + server tomonida autentifikatsiya kerak bo'ladi.

export const ADMIN_USERS = [
  { username: 'shox', password: 'shox1010', name: 'Shox', role: 'owner' },
  { username: 'admin1', password: 'shox1010', name: 'Admin 1', role: 'admin' },
  { username: 'admin2', password: 'shox1010', name: 'Admin 2', role: 'admin' },
  { username: 'admin3', password: 'shox1010', name: 'Admin 3', role: 'admin' },
  { username: 'admin4', password: 'shox1010', name: 'Admin 4', role: 'admin' },
];

export const findAdminUser = (username, password) => {
  const user = ADMIN_USERS.find(
    (u) => u.username.toLowerCase() === String(username || '').trim().toLowerCase()
  );
  if (!user) return null;
  if (user.password !== password) return null;
  return user;
};

export const isOwner = (user) => user?.role === 'owner';
