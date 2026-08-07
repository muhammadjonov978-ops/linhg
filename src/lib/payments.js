// ===== To'lov (Payme + Click) frontend yordamchilari =====
// Haqiqiy to'lov jarayoni:
//   1. createPaymentOrder() — backend'da order yaratiladi (Redis'da saqlanadi)
//   2. getCheckoutUrl() — Payme/Click checkout sahifasi havolasi
//   3. Foydalanuvchi Payme/Click'da to'laydi
//   4. Payme/Click webhook backend'ni xabardor qiladi (order -> paid)
//   5. pollOrderStatus() — sayt to'lov holatini tekshiradi va tilni ochadi
import {
  PAYME_MERCHANT_ID,
  CLICK_MERCHANT_ID,
  CLICK_SERVICE_ID,
  SITE_URL,
} from '../config';

// Unique order ID — to'lov bilan bog'langan buyurtma raqami
export function generateOrderId(prefix = 'lng') {
  const rand = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  return `${prefix}-${rand}`;
}

// Base64 — URL-xavfsiz (unicode-safe): btoa natijasidagi + va / belgilari
// URL yo'lini buzmasligi uchun - va _ bilan almashtiriladi, = olib tashlanadi.
function toBase64UrlSafe(str) {
  let b64;
  if (typeof btoa === 'function') {
    b64 = btoa(unescape(encodeURIComponent(str)));
  } else {
    b64 = Buffer.from(str, 'utf-8').toString('base64');
  }
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Payme checkout URL:
//   https://checkout.paycom.uz/{base64("m={merchant};ac.order_id={order};a={tiyin};c={return};l=uz")}
// `c` parametri ODDIY URL sifatida beriladi (encodeURIComponent qilish YO'Q) —
// Payme `c` qiymatini percent-decode qilmaydi va encode qilingan URL bo'lsa
// foydalanuvchi noto'g'ri manzilga qaytadi. Params `;` bilan ajratilgani uchun
// URL ichidagi `?` va `=` belgilari muammo tug'dirmaydi.
export function buildPaymeUrl({ orderId, amount, returnUrl, lang = 'uz' }) {
  const tiyin = Math.round(amount * 100); // 1 so'm = 100 tiyin
  const params = `m=${PAYME_MERCHANT_ID};ac.order_id=${orderId};a=${tiyin};c=${returnUrl};l=${lang}`;
  return `https://checkout.paycom.uz/${toBase64UrlSafe(params)}`;
}

// Click pay link:
//   https://my.click.uz/services/pay?service_id=...&merchant_id=...&amount=...&transaction_param=...&return_url=...
export function buildClickUrl({ orderId, amount, returnUrl }) {
  const qs = new URLSearchParams({
    service_id: CLICK_SERVICE_ID,
    merchant_id: CLICK_MERCHANT_ID,
    amount: amount.toFixed(2),
    transaction_param: orderId,
    return_url: returnUrl,
  });
  return `https://my.click.uz/services/pay?${qs.toString()}`;
}

// Backend'da yangi order yaratadi
export async function createPaymentOrder({ orderId, langId, amount, provider, plan }) {
  const res = await fetch('/api/payment/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, langId, amount, provider, plan }),
  });
  const data = await res.json().catch(() => ({ ok: false, error: 'Server javob bermadi' }));
  if (!res.ok || !data.ok) {
    throw new Error(data.error || 'Order yaratilmadi');
  }
  return data.order;
}

// Order holatini tekshiradi: { status: 'pending' | 'paid', langId, plan, amount }
export async function getOrderStatus(orderId) {
  const res = await fetch(`/api/payment/status?orderId=${encodeURIComponent(orderId)}`);
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) return null;
  return data;
}

// To'lov sahifasiga yo'naltirish uchun havolani qaytaradi (order oldin yaratilgan bo'lishi kerak)
export function getCheckoutUrl({ provider, orderId, amount, returnUrl }) {
  if (provider === 'payme') return buildPaymeUrl({ orderId, amount, returnUrl });
  if (provider === 'click') return buildClickUrl({ orderId, amount, returnUrl });
  throw new Error('Noma\'lum provider');
}

// Return URL — to'lovdan so'ng foydalanuvchi shu yerga qaytadi
export function buildReturnUrl(orderId) {
  return `${SITE_URL}/?payment=${orderId}`;
}

// To'lov holatini bir necha marta so'rab turadi (polling)
export function pollOrderStatus(orderId, { interval = 2000, timeout = 120000 } = {}) {
  return new Promise((resolve) => {
    const started = Date.now();
    const timer = setInterval(async () => {
      const data = await getOrderStatus(orderId).catch(() => null);
      if (data && data.status === 'paid') {
        clearInterval(timer);
        resolve(data);
      } else if (Date.now() - started > timeout) {
        clearInterval(timer);
        resolve(null);
      }
    }, interval);
  });
}
