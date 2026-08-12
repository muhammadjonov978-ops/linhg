// ==== THIRD-PARTY SERVICE CONFIGURATION ====
// To enable real Google sign-in and SMS reminders, fill these values
// (or set them in a .env file — see .env.example).

// Google OAuth Client ID (Google Cloud Console → APIs & Services → Credentials)
// https://console.cloud.google.com/apis/credentials
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Saytning to'liq manzili
export const SITE_URL = import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://lingohub.uz');

// SMS eslatmalar (dars o'tkazib yuborilganda) — HAMMASI SERVERDA ishlaydi:
//   POST /api/sms/send  → Eskiz.uz (ESKIZ_EMAIL / ESKIZ_PASSWORD Vercel env'larida).
// Kalitlar brauzerga chiqmaydi — xavfsiz. Frontend'da hech narsa sozlash shart emas.

export const HAS_GOOGLE_AUTH = !!GOOGLE_CLIENT_ID;
