// ==== OBUNA SHLYUZI — kanallar ro'yxati ====
// Saytga kirishdan oldin foydalanuvchi shu kanallarga obuna bo'lishi kerak.
// Telegram kanali BOT orqali haqiqiy tekshiriladi (getChatMember),
// Instagram profilari uchun esa rasmiy API yo'q — "Obuna bo'ldim ✓" tugmasi.
export const GATE_CHANNELS = [
  {
    id: 'telegram_khoja_akbar',
    type: 'telegram',
    brand: 'telegram',
    name: '@khoja_akbar',
    label: 'Telegram kanal',
    url: 'https://t.me/khoja_akbar',
    tgChannel: 'khoja_akbar', // getChatMember uchun kanal username
  },
  {
    id: 'instagram_ai_videochi_uz',
    type: 'instagram',
    brand: 'instagram',
    name: '@ai_videochi_uz',
    label: 'Instagram profil',
    url: 'https://www.instagram.com/ai_videochi_uz?igsh=anBrdDE2d2dnZDRv',
  },
  {
    id: 'instagram_lingohub_u',
    type: 'instagram',
    brand: 'instagram',
    name: '@lingohub.u',
    label: 'Instagram profil',
    url: 'https://www.instagram.com/lingohub.u?igsh=MWc1d2Zrb3F5a29pcA==',
  },
];

// Shlyuzdan o'tish saqlanadigan kalitlar
export const GATE_STORAGE_KEY = 'lingohub_gate_pass';
// Sessiya ichida tasdiqlangan kanallar (sahifa yangilanganda yo'qolmasligi uchun)
export const GATE_SESSION_KEY = 'lingohub_gate_session';
// Bir marta tasdiqlagandan keyin shu muddatgacha qayta so'ralmaydi (7 kun)
export const GATE_PASS_TTL = 7 * 24 * 60 * 60 * 1000;
