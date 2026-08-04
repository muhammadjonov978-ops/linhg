// ==== ADMIN PANEL ACCOUNTS ====
// Owner:  shox.. / shox.kea
// Staff:  admin1..admin20  (parol = login bilan bir xil)
//
// NOTE: bu foydalanuvchilar ro'yxati mijoz (brauzer) tomonida saqlanadi —
// statik sayt uchun mo'ljallangan demo himoya. Haqiqiy xavfsizlik uchun
// backend + server tomonida autentifikatsiya kerak bo'ladi.

export const ADMIN_USERS = [
  { username: 'shox..', password: 'shox.kea', name: 'Shox', role: 'owner' },
  ...Array.from({ length: 20 }, (_, i) => ({
    username: `admin${i + 1}`,
    password: `admin${i + 1}`,
    name: `Admin ${i + 1}`,
    role: 'admin',
  })),
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
