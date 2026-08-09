// ==== OBUNA SHLYUZI — kanallar ro'yxati ====
// Saytga kirishdan oldin foydalanuvchi shu kanallarga obuna bo'lishi kerak.
// Instagram profilari uchun rasmiy obuna tekshiruv API si yo'q —
// shuning uchun "Obuna bo'ldim ✓" tugmasi orqali tasdiqlanadi.
export const GATE_CHANNELS = [
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

// Shlyuzdan o'tish saqlanadigan kalit — sessionStorage'da (har yangi oynada
// sayt yana obuna so'raydi). Egasining talabi: obuna bo'lmasa kirish taqiqlansin.
export const GATE_STORAGE_KEY = 'lingohub_gate_pass';
// Shlyuz oynasi ichida tasdiqlangan kanallar (sahifa yangilanganda yo'qolmasligi uchun)
export const GATE_SESSION_KEY = 'lingohub_gate_session';
