// ==== THIRD-PARTY SERVICE CONFIGURATION ====
// To enable real Google sign-in, payments and SMS, fill these values
// (or set them in a .env file — see .env.example).

// Google OAuth Client ID (Google Cloud Console → APIs & Services → Credentials)
// https://console.cloud.google.com/apis/credentials
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Payme merchant ID (https://payme.uz) — for real card payments.
// Saytga ko'rinadigan (VITE_ prefiksli) — xavfsiz, checkout URL'da ishlatiladi.
export const PAYME_MERCHANT_ID = import.meta.env.VITE_PAYME_MERCHANT_ID || '';

// Click merchant ID + service ID (https://click.uz) — for real card payments.
// Service ID — Click kabinetidagi xizmat (service) raqami.
export const CLICK_MERCHANT_ID = import.meta.env.VITE_CLICK_MERCHANT_ID || '';
export const CLICK_SERVICE_ID = import.meta.env.VITE_CLICK_SERVICE_ID || '';

// Saytning to'liq manzili (return_url uchun). Agar ko'rsatilmagan bo'lsa, brauzer URL'i ishlatiladi.
export const SITE_URL = import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://lingohub.uz');

// To'lov tizimi sozlanganmi?
export const HAS_PAYMENT = !!(PAYME_MERCHANT_ID || (CLICK_MERCHANT_ID && CLICK_SERVICE_ID));

// Pro (premium) narxlari — so'mda (Payme/Click UZS qabul qiladi)
// Narxlarni o'zgartirmoqchi bo'lsangiz shu yerdan o'zgartiring
export const PREMIUM_MONTHLY_PRICE = 49000;
export const PREMIUM_YEARLY_PRICE = 490000;

// SMS provider API key (Eskiz — https://eskiz.uz) — for missed-day reminders
export const SMS_API_KEY = import.meta.env.VITE_SMS_API_KEY || '';

// Backend endpoint that sends SMS (needed because SMS can't be sent from the browser alone)
export const SMS_BACKEND_URL = import.meta.env.VITE_SMS_BACKEND_URL || '';

export const HAS_GOOGLE_AUTH = !!GOOGLE_CLIENT_ID;
