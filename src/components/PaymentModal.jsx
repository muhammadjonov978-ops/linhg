// ==== TO'LOV MODALI — Pullik tillar uchun Payme/Click to'lov tizimi ====
// Backend endpoint'lari: POST /api/payment/create, GET /api/payment/status
// Payme: checkout.payme.uz ga yo'naltiriladi
// Click: click.uz ga yo'naltiriladi
import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { SITE_URL } from '../config';
import {
  FaTimes as X, FaSpinner as Loader2, FaCheckCircle as CheckCircle,
  FaExclamationTriangle as Warning, FaCreditCard as CreditCard,
  FaShieldAlt as Shield, FaLock as Lock,
} from 'react-icons/fa';

const PAYMENT_POLL_MS = 3000;
const PAYMENT_TIMEOUT_MS = 120000; // 2 daqiqa

function generateOrderId(langId) {
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  return `lh_${langId}_${ts}_${rand}`;
}

function formatPrice(amount) {
  return Number(amount).toLocaleString('uz-UZ') + " so'm";
}

export default function PaymentModal({ isOpen, onClose, langId, langName, price }) {
  const { dispatch } = useApp();
  const [phase, setPhase] = useState('choose'); // choose | creating | pending | success | error
  const [orderId, setOrderId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const pollRef = useRef(null);
  const startedAtRef = useRef(null);

  // Tozalash
  useEffect(() => {
    if (!isOpen) {
      setPhase('choose');
      setOrderId(null);
      setErrorMsg('');
      if (pollRef.current) clearInterval(pollRef.current);
    }
  }, [isOpen]);

  // Poll to'lov holatini tekshirish
  const startPolling = useCallback((oid) => {
    if (pollRef.current) clearInterval(pollRef.current);
    startedAtRef.current = Date.now();
    setPhase('pending');

    const poll = async () => {
      try {
        const res = await fetch(`/api/payment/status?orderId=${encodeURIComponent(oid)}`);
        const data = await res.json();
        if (data?.ok && data.status === 'paid') {
          clearInterval(pollRef.current);
          // Til ochiladi
          dispatch({ type: 'UNLOCK_LANGUAGE', payload: langId });
          setPhase('success');
          setTimeout(() => onClose(), 2000);
          return;
        }
      } catch { /* retry */ }

      // Timeout tekshirish
      if (Date.now() - startedAtRef.current > PAYMENT_TIMEOUT_MS) {
        clearInterval(pollRef.current);
        setErrorMsg("To'lov vaqti tugadi. Qayta urinib ko'ring.");
        setPhase('error');
      }
    };

    poll();
    pollRef.current = setInterval(poll, PAYMENT_POLL_MS);
  }, [dispatch, langId, onClose]);

  // To'lov jarayonini boshlash
  const startPayment = async (provider) => {
    setPhase('creating');
    setErrorMsg('');
    const oid = generateOrderId(langId);
    setOrderId(oid);

    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: oid,
          langId,
          amount: price,
          provider,
          plan: 'language',
        }),
      });
      const data = await res.json();
      if (!data?.ok) {
        setErrorMsg(data?.error || "Order yaratishda xatolik");
        setPhase('error');
        return;
      }

      // To'lov sahifasini ochish
      if (provider === 'payme') {
        openPaymeCheckout(oid, price);
      } else if (provider === 'click') {
        openClickCheckout(oid, price);
      }

      // Poll boshlash
      startPolling(oid);
    } catch (e) {
      setErrorMsg("Server bilan bog'lanib bo'lmadi");
      setPhase('error');
    }
  };

  // Payme checkout sahifasini ochish
  const openPaymeCheckout = (oid, amount) => {
    const merchantId = import.meta.env.VITE_PAYME_MERCHANT_ID || '';
    if (!merchantId) {
      setErrorMsg('Payme sozlanmagan');
      setPhase('error');
      return;
    }
    const params = new URLSearchParams({
      merchant: merchantId,
      amount: String(amount * 100), // tiyin
      'account[order_id]': oid,
      lang: 'uz',
    });
    window.open(`https://checkout.payme.uz/?${params.toString()}`, '_blank', 'noopener');
  };

  // Click checkout sahifasini ochish
  const openClickCheckout = (oid, amount) => {
    const merchantId = import.meta.env.VITE_CLICK_MERCHANT_ID || '';
    const serviceId = import.meta.env.VITE_CLICK_SERVICE_ID || '';
    if (!merchantId || !serviceId) {
      setErrorMsg('Click sozlanmagan');
      setPhase('error');
      return;
    }
    const params = new URLSearchParams({
      service_id: serviceId,
      merchant_id: merchantId,
      amount: String(amount),
      transaction_param: oid,
    });
    window.open(`https://click.uz/pay/?${params.toString()}`, '_blank', 'noopener');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={phase !== 'creating' && phase !== 'pending' ? onClose : undefined} />

      <div className="relative bg-base-100 rounded-3xl shadow-2xl max-w-md w-full animate-[fadeIn_0.3s_ease-out] overflow-hidden border border-primary/20 gold-glow">
        {/* Yopish tugmasi */}
        {phase !== 'creating' && phase !== 'pending' && (
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-base-200/90 border border-base-300 text-white/80 hover:text-white hover:bg-error hover:border-error hover:scale-110 active:scale-95 transition-all duration-200 shadow-lg"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        )}

        <div className="p-8">
          {/* ===== TANLASH PHASE ===== */}
          {phase === 'choose' && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-amber-500/25">
                  💳
                </div>
                <h2 className="text-xl font-bold mb-1 font-display">{langName} — To'lov</h2>
                <p className="text-sm opacity-60">
                  {langName} tilini ochish uchun to'lov qiling
                </p>
                <div className="mt-3 text-2xl font-extrabold text-primary">
                  {formatPrice(price)}
                </div>
              </div>

              {/* To'lov usullari */}
              <div className="space-y-3 mb-6">
                {/* Payme */}
                <button
                  onClick={() => startPayment('payme')}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-base-300 hover:border-green-400 hover:bg-green-400/5 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform">
                    P
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-sm">Payme</p>
                    <p className="text-[11px] opacity-50">Payme orqali to'lash</p>
                  </div>
                  <CreditCard className="w-5 h-5 opacity-30 group-hover:opacity-70 transition-opacity" />
                </button>

                {/* Click */}
                <button
                  onClick={() => startPayment('click')}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-base-300 hover:border-sky-400 hover:bg-sky-400/5 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-sky-500/25 group-hover:scale-110 transition-transform">
                    C
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-sm">Click</p>
                    <p className="text-[11px] opacity-50">Click orqali to'lash</p>
                  </div>
                  <CreditCard className="w-5 h-5 opacity-30 group-hover:opacity-70 transition-opacity" />
                </button>
              </div>

              {/* Xavfsizlik */}
              <div className="flex items-center justify-center gap-2 text-[10px] opacity-40">
                <Shield className="w-3 h-3" />
                <span>To'lov xavfsiz muhitda amalga oshiriladi</span>
                <Lock className="w-3 h-3" />
              </div>
            </>
          )}

          {/* ===== YARATILMOQDA ===== */}
          {phase === 'creating' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="font-bold">Order yaratilmoqda...</p>
              <p className="text-xs opacity-50 mt-1">Iltimos kuting</p>
            </div>
          )}

          {/* ===== TO'LOV KUTILMOQDA ===== */}
          {phase === 'pending' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-amber-400/15 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CreditCard className="w-8 h-8 text-amber-400" />
              </div>
              <p className="font-bold mb-1">To'lov kutilmoqda...</p>
              <p className="text-xs opacity-50">
                To'lov sahifasida tranzaksiyani yakunlang
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-xs opacity-60">Avtomatik tekshirilmoqda...</span>
              </div>
              {orderId && (
                <p className="text-[10px] opacity-30 mt-3 font-mono">
                  Order: {orderId}
                </p>
              )}
            </div>
          )}

          {/* ===== MUVAFFAQIYAT ===== */}
          {phase === 'success' && (
            <div className="text-center py-8 animate-[scaleIn_0.4s_ease-out]">
              <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <p className="font-bold text-lg text-success mb-1">To'lov qabul qilindi!</p>
              <p className="text-sm opacity-60">{langName} tili ochildi 🎉</p>
            </div>
          )}

          {/* ===== XATO ===== */}
          {phase === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-error/15 flex items-center justify-center mx-auto mb-4">
                <Warning className="w-8 h-8 text-error" />
              </div>
              <p className="font-bold text-error mb-1">Xatolik yuz berdi</p>
              <p className="text-xs opacity-60 mb-4">{errorMsg}</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => { setPhase('choose'); setErrorMsg(''); }}
                  className="btn btn-primary btn-sm gap-2"
                >
                  Qayta urinish
                </button>
                <button onClick={onClose} className="btn btn-ghost btn-sm">
                  Yopish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
