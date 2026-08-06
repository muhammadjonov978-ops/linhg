import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SMS_API_KEY, SMS_BACKEND_URL } from '../config';
import { Bell, Phone, X, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const SMS_REMINDER_KEY = 'lingohub_sms_reminder';
const LAST_SENT_KEY = 'lingohub_sms_last_sent';

/**
 * SMSReminder — if the user hasn't studied for more than 24h (missed a day),
 * ask for their phone number and send a reminder SMS (via Eskiz API through a backend).
 * Note: SMS cannot be sent directly from the browser — a small backend is required.
 */
export default function SMSReminder() {
  const { state } = useApp();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const lastActive = state.lastActive || 0;
  const hoursSinceActive = lastActive ? (Date.now() - lastActive) / (1000 * 60 * 60) : 0;
  const missedDay = hoursSinceActive > 24;

  // Only show if user missed a day and hasn't been asked today
  useEffect(() => {
    if (!missedDay) return;
    try {
      const today = new Date().toDateString();
      const lastAsk = localStorage.getItem(SMS_REMINDER_KEY);
      if (lastAsk !== today) {
        setOpen(true);
      }
    } catch { /* noop */ }
  }, [missedDay]);

  if (!open) return null;

  const handleSend = async () => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    if (cleanPhone.length < 9) {
      setError("Telefon raqamni to'g'ri kiriting (masalan: +998901234567)");
      return;
    }

    setSending(true);
    setError('');

    try {
      // 1) Try the backend endpoint if configured (recommended — keeps API key secret)
      if (SMS_BACKEND_URL) {
        const res = await fetch(SMS_BACKEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone, type: 'missed-day' }),
        });
        if (!res.ok) throw new Error('Backend xatosi');
      } else if (SMS_API_KEY && typeof window !== 'undefined') {
        // 2) Fallback: direct Eskiz API call (not recommended for production — key is exposed)
        const tokenRes = await fetch('https://notify.eskiz.uz/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'demo@eskiz.uz', password: SMS_API_KEY }),
        });
        const tokenData = await tokenRes.json();
        const token = tokenData?.data?.token;
        if (!token) throw new Error('Eskiz token olinmadi');

        const message = "Assalomu alaykum! Lingohub'da bugun dars qilmadingiz. Til o'rganishni davom ettiring! 🔥";
        await fetch('https://notify.eskiz.uz/api/message/sms/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            mobile_phone: cleanPhone,
            message,
            from: '4546',
          }),
        });
      } else {
        // 3) No backend / API key — simulate and show guidance
        await new Promise(r => setTimeout(r, 800));
      }

      // Mark as asked today
      try {
        localStorage.setItem(SMS_REMINDER_KEY, new Date().toDateString());
        localStorage.setItem(LAST_SENT_KEY, String(Date.now()));
      } catch { /* noop */ }

      setSent(true);
      setTimeout(() => setOpen(false), 2500);
    } catch (e) {
      setError("SMS jo'natilmadi: " + (e?.message || 'xato'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-[95] w-full max-w-sm animate-[slideInRight_0.4s_ease-out]">
      <div className="card bg-base-100 border-2 border-warning/40 shadow-2xl">
        <div className="card-body p-5">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 btn btn-ghost btn-xs btn-circle"
          >
            <X className="w-3 h-3" />
          </button>

          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-10 h-10 text-success mx-auto mb-2" />
              <p className="font-bold">SMS yuborildi!</p>
              <p className="text-xs opacity-60 mt-1">Ertaga dars qilishni unutmang! 💪</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Darsni o'tkazib yubordingiz</h3>
                  <p className="text-xs opacity-60">24 soatdan ko'proq vaqt bo'ldi</p>
                </div>
              </div>

              <p className="text-xs opacity-70 mb-3">
                Sizga SMS eslatma yuboramiz. Telefon raqamingizni kiriting:
              </p>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="input input-bordered w-full pl-9"
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={sending || !phone.trim()}
                  className="btn btn-primary gap-1"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                  Yuborish
                </button>
              </div>

              {error && (
                <p className="text-xs text-error mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {error}
                </p>
              )}

              {!SMS_BACKEND_URL && !SMS_API_KEY && (
                <p className="text-[10px] opacity-40 mt-2">
                  * Haqiqiy SMS uchun Eskiz API kaliti va kichik backend kerak (config.js ga qarang)
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
