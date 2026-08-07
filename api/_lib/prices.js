// ==== SERVER-SIDE NARXLAR (yagona manba — source of truth) ====
// To'lov miqdori FAKAT shu yerdagi narxlar bilan tekshiriladi.
// Foydalanuvchi narxni o'zi o'zgartirib, arzonroq to'lab qo'yishini oldini oladi.
//
// ⚠️ Narx o'zgartirganda:
//   1) Bu faylni yangilang va deploy qiling
//   2) Frontend'da ko'rsatiladigan narxlar bilan mos bo'lishi uchun
//      src/data/siteConfig.js (DEFAULT_CONFIG.prices) ni ham yangilang

// Pullik tillar narxlari (so'm) — src/data/languages.js'dagi `price` bilan bir xil
export const LANGUAGE_PRICES = {
  korean: 20000,
  japanese: 20000,
  chinese: 20000,
  arabic: 20000,
  hindi: 20000,
  hebrew: 20000,
};

// Premium (Pro) obuna narxlari — so'm
// Default: src/config.js bilan bir xil; Vercel'da PREMIUM_* env orqali o'zgartirish mumkin
export const PREMIUM_MONTHLY_PRICE = Number(process.env.PREMIUM_MONTHLY_PRICE) || 49000;
export const PREMIUM_YEARLY_PRICE = Number(process.env.PREMIUM_YEARLY_PRICE) || 490000;
