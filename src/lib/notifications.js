// ==== PWA + PUSH NOTIFIKATSIYALAR ====
// 1) Service Worker ro'yxatdan o'tkazish (offline rejim + push qabul)
// 2) Brauzer ruxsatini so'rash
// 3) Sayt ochiq paytida lokal bildirishnomalar (streak eslatmasi va h.k.)
// 4) Web Push obuna (VAPID kalitlar serverda — /api/push/subscribe)

const REMINDER_KEY = 'lingohub_reminder_shown';

// Service Worker'ni ro'yxatdan o'tkazish (faqat prod / localhost HTTPS)
export function registerServiceWorker() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  if (!window.isSecureContext) return; // HTTPS shart

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW registration failed:', err);
    });
  });
}

// Push ruxsatini so'rash — foydalanuvchi tugmani bossa
export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { granted: false, reason: 'unsupported' };
  }
  if (Notification.permission === 'granted') return { granted: true };
  if (Notification.permission === 'denied') return { granted: false, reason: 'denied' };
  try {
    const permission = await Notification.requestPermission();
    return { granted: permission === 'granted', reason: permission };
  } catch (e) {
    return { granted: false, reason: e?.message };
  }
}

// Lokal bildirishnoma ko'rsatish (sayt ochiq paytida)
export function showLocalNotification(title, body, url = '/') {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;
  try {
    const n = new Notification(title, {
      body,
      icon: '/favicon-192x192.png',
      badge: '/favicon-192x192.png',
      data: { url },
    });
    n.onclick = () => {
      window.focus();
      if (url && url !== '/') window.location.hash = url;
      n.close();
    };
    return true;
  } catch {
    return false;
  }
}

// Kunlik eslatma — faqat kuniga 1 marta (streak uzilishidan oldin ogohlantiradi)
export function maybeShowDailyReminder({ streak, studiedToday, todayLabel }) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const today = new Date().toDateString();
  try {
    const shown = localStorage.getItem(REMINDER_KEY);
    if (shown === today) return; // bugun allaqachon ko'rsatilgan
  } catch { /* ignore */ }

  // Faqat eslatma kerak bo'lganda: streak bor, lekin bugun dars qilinmagan
  if (!studiedToday && streak > 0) {
    showLocalNotification(
      '🔥 Streakingizni saqlang!',
      `${streak} kunlik streak — bugun kamida 1 ta dars bajaring, ${todayLabel}`,
      '/'
    );
  }

  try {
    localStorage.setItem(REMINDER_KEY, today);
  } catch { /* ignore */ }
}

// ===== WEB PUSH OBUNA =====
// VAPID public kalit frontend'ga ko'rinadi (xavfsiz), private kalit serverda.
// Faqat server /api/push/subscribe sozlangan bo'lsa ishlaydi.

export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

export async function subscribeToPush() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, reason: 'unsupported' };
  }
  if (!VAPID_PUBLIC_KEY) {
    return { ok: false, reason: 'vapid-not-configured' };
  }
  const perm = await requestNotificationPermission();
  if (!perm.granted) return { ok: false, reason: perm.reason };

  try {
    const reg = await navigator.serviceWorker.ready;
    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    // Obunani serverga yuborish (Redis'da saqlanadi)
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: subscription.toJSON() }),
    });
    return { ok: res.ok, subscription };
  } catch (e) {
    return { ok: false, reason: e?.message };
  }
}

export async function unsubscribeFromPush() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return;
  }
  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    if (subscription) await subscription.unsubscribe();
  } catch {
    /* ignore */
  }
}

// VAPID base64url → Uint8Array (PushManager talab qiladi)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
