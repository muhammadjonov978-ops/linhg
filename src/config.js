// ==== THIRD-PARTY SERVICE CONFIGURATION ====
// To enable real Google sign-in, payments and SMS, fill these values
// (or set them in a .env file — see .env.example).

// Google OAuth Client ID (Google Cloud Console → APIs & Services → Credentials)
// https://console.cloud.google.com/apis/credentials
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Payme merchant ID (https://payme.uz) — for real card payments
export const PAYME_MERCHANT_ID = import.meta.env.VITE_PAYME_MERCHANT_ID || '';

// Click merchant ID (https://click.uz) — for real card payments
export const CLICK_MERCHANT_ID = import.meta.env.VITE_CLICK_MERCHANT_ID || '';

// SMS provider API key (Eskiz — https://eskiz.uz) — for missed-day reminders
export const SMS_API_KEY = import.meta.env.VITE_SMS_API_KEY || '';

// Backend endpoint that sends SMS (needed because SMS can't be sent from the browser alone)
export const SMS_BACKEND_URL = import.meta.env.VITE_SMS_BACKEND_URL || '';

export const HAS_GOOGLE_AUTH = !!GOOGLE_CLIENT_ID;
