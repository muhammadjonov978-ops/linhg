// ==== IJTIMOIY TARMOQLARDA ULASHISH ====
// Telegram, WhatsApp, X (Twitter) va nusxalash uchun yordamchi funksiyalar.

export function shareToTelegram(url, text = '') {
  const base = 'https://t.me/share/url';
  const params = new URLSearchParams({ url });
  if (text) params.set('text', text);
  window.open(`${base}?${params.toString()}`, '_blank', 'noopener,noreferrer,width=600,height=500');
}

export function shareToWhatsApp(url, text = '') {
  const msg = encodeURIComponent(text ? `${text} ${url}` : url);
  window.open(`https://wa.me/?text=${msg}`, '_blank', 'noopener,noreferrer,width=600,height=500');
}

export function shareToX(url, text = '') {
  const base = 'https://twitter.com/intent/tweet';
  const params = new URLSearchParams({ url, text });
  window.open(`${base}?${params.toString()}`, '_blank', 'noopener,noreferrer,width=600,height=500');
}

export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback (eski brauzerlar)
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    return true;
  } catch {
    return false;
  }
}

