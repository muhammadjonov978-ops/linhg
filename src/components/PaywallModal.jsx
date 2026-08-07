import { useState } from 'react';
import { FaCrown as Crown, FaStar as Star, FaCheck as Check, FaTimes as X, FaMagic as Sparkles, FaShieldAlt as Shield, FaBolt as Zap, FaInfinity as InfinityIcon, FaLock as Lock, FaCoins as Coins, FaSpinner as Loader2, FaExternalLinkAlt as ExternalLink } from 'react-icons/fa';
import { useSiteConfig, getLangPrice } from '../data/siteConfig';
import { HAS_PAYMENT, HAS_PAYME, HAS_CLICK, PAYME_MERCHANT_ID, CLICK_MERCHANT_ID, CLICK_SERVICE_ID, PREMIUM_MONTHLY_PRICE, PREMIUM_YEARLY_PRICE } from '../config';
import { generateOrderId, createPaymentOrder, getCheckoutUrl, buildReturnUrl } from '../lib/payments';

const PENDING_KEY = 'lingohub_pending_payment';

/**
 * PaywallModal
 * - mode "premium": Pro Level obunasi (haqiqiy to'lov)
 * - mode "language": pullik til (so'm) — haqiqiy to'lov
 *
 * To'lov Payme yoki Click checkout sahifasida amalga oshiriladi.
 * To'lov tasdiqlangach foydalanuvchi saytga qaytadi va App.jsx
 * order holatini tekshirib tilni/premium'ni ochadi.
 */
export default function PaywallModal({ isOpen, onClose, lang }) {
  const config = useSiteConfig();
  const [processing, setProcessing] = useState(false);
  // Default usul — Payme sozlangan bo'lsa, aks holda Click
  const [method, setMethod] = useState(HAS_PAYME ? 'payme' : HAS_CLICK ? 'click' : 'payme');
  const [error, setError] = useState('');
  const [payPlan, setPayPlan] = useState(null); // premium rejimda tanlangan plan

  // Faqat sozlangan (konfiguratsiya qilingan) to'lov usullari ko'rsatiladi
  const paymentMethods = [
    HAS_PAYME && { id: 'payme', label: 'Payme' },
    HAS_CLICK && { id: 'click', label: 'Click' },
  ].filter(Boolean);

  if (!isOpen) return null;

  const isLanguageMode = !!lang;
  const langPrice = isLanguageMode ? (getLangPrice(config, lang) || 20000) : 0;

  const formatPrice = (n) => n.toLocaleString('uz-UZ') + " so'm";

  const getPrice = (plan) => (isLanguageMode ? langPrice : (plan === 'yearly' ? PREMIUM_YEARLY_PRICE : PREMIUM_MONTHLY_PRICE));

  const startPayment = async (plan = 'language') => {
    if (!HAS_PAYMENT) {
      setError('To\'lov tizimi hali sozlanmagan. Vercel sozlamalarida VITE_PAYME_MERCHANT_ID ni kiriting (README\'ga qarang).');
      return;
    }
    if (method === 'payme' && !PAYME_MERCHANT_ID) {
      setError('Payme sozlanmagan. Iltimos, boshqa usulni tanlang.');
      return;
    }
    if (method === 'click' && (!CLICK_MERCHANT_ID || !CLICK_SERVICE_ID)) {
      setError('Click sozlanmagan. Iltimos, boshqa usulni tanlang.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const orderId = generateOrderId(isLanguageMode ? 'lng' : 'prm');
      const amount = getPrice(plan);
      // Qaytishda qaysi til/premium ochilishini eslab qolamiz
      localStorage.setItem(PENDING_KEY, JSON.stringify({
        orderId,
        langId: isLanguageMode ? lang.id : null,
        plan,
        timestamp: Date.now(),
      }));

      await createPaymentOrder({
        orderId,
        langId: isLanguageMode ? lang.id : 'premium',
        amount,
        provider: method,
        plan,
      });

      const checkoutUrl = getCheckoutUrl({
        provider: method,
        orderId,
        amount,
        returnUrl: buildReturnUrl(orderId),
      });

      // Payme/Click sahifasiga yo'naltiramiz
      window.location.href = checkoutUrl;
    } catch (e) {
      setProcessing(false);
      setError(e.message || 'To\'lovni boshlab bo\'lmadi. Qayta urinib ko\'ring.');
    }
  };

  const handlePremiumPay = (plan) => {
    setPayPlan(plan);
    startPayment(plan);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-base-100 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-[fadeIn_0.3s_ease-out]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 btn btn-ghost btn-circle btn-sm z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-primary via-purple-600 to-secondary rounded-t-3xl p-8 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 animate-ping text-4xl">⭐</div>
            <div className="absolute top-20 right-20 animate-ping text-3xl" style={{ animationDelay: '0.5s' }}>👑</div>
            <div className="absolute bottom-10 left-1/4 animate-ping text-2xl" style={{ animationDelay: '1s' }}>✨</div>
          </div>

          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                {isLanguageMode ? <Lock className="w-12 h-12" /> : <Crown className="w-12 h-12" />}
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {isLanguageMode ? `${lang.flag} ${lang.name} tilini oching!` : "Pro Level'ni oching!"}
            </h2>
            <p className="text-white/80 text-lg">
              {isLanguageMode
                ? `Bu til uchun bir martalik to'lov — ${formatPrice(langPrice)}`
                : 'Advanced (B2-C1) darajasiga chiqing va tilni mukammal o\'rganing'}
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="px-8 pt-6">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: InfinityIcon, text: isLanguageMode ? 'Cheksiz darslar' : 'Cheksiz mashqlar' },
              { icon: Zap, text: 'AI Tutor bilan suhbat' },
              { icon: Star, text: isLanguageMode ? `${lang.flag} ${lang.name} to'liq kurs` : 'Advanced daraja' },
              { icon: Shield, text: 'Sertifikat olish' },
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <benefit.icon className="w-4 h-4 text-primary" />
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="px-8 pb-4">
          {isLanguageMode ? (
            <div className="card bg-base-200 border-2 border-primary shadow-lg shadow-primary/20">
              <div className="card-body items-center text-center">
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6 text-warning" />
                  <h3 className="card-title text-lg">{lang.flag} {lang.name}</h3>
                </div>
                <div className="my-3">
                  <span className="text-5xl font-extrabold text-primary">{formatPrice(langPrice)}</span>
                  <div className="text-xs opacity-60 mt-1">Bir martalik to'lov • umrbod ochiq</div>
                </div>
                <ul className="text-sm space-y-2 mb-4">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> Barcha 100 dars</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> Alifbo, Reading, Listening</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> Writing, Speaking mashqlari</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Monthly */}
              <div className="card bg-base-200 border-2 border-base-300 hover:border-primary/50 transition-all duration-300">
                <div className="card-body items-center text-center">
                  <h3 className="card-title text-lg">Oylik</h3>
                  <div className="my-4">
                    <span className="text-4xl font-bold">{formatPrice(PREMIUM_MONTHLY_PRICE)}</span>
                    <span className="text-sm opacity-70">/oy</span>
                  </div>
                  <ul className="text-sm space-y-2 mb-4">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> Barcha darajalar</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> AI Tutor</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> Speaking mashqlar</li>
                  </ul>
                  <button onClick={() => handlePremiumPay('monthly')} disabled={processing} className="btn btn-primary w-full">
                    {processing && payPlan === 'monthly' ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Obuna bo'lish
                  </button>
                </div>
              </div>

              {/* Yearly - highlighted */}
              <div className="card bg-base-200 border-2 border-primary shadow-lg shadow-primary/20 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="badge badge-primary gap-1 px-4 py-2">
                    <Sparkles className="w-3 h-3" /> Eng yaxshi tanlov
                  </div>
                </div>
                <div className="card-body items-center text-center pt-8">
                  <h3 className="card-title text-lg">Yillik</h3>
                  <div className="my-4">
                    <span className="text-4xl font-bold">{formatPrice(PREMIUM_YEARLY_PRICE)}</span>
                    <span className="text-sm opacity-70">/yil</span>
                  </div>
                  <div className="badge badge-success mb-2">2 oy bepul</div>
                  <ul className="text-sm space-y-2 mb-4">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> Barcha darajalar</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> AI Tutor</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> Speaking mashqlar</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> Sertifikat</li>
                  </ul>
                  <button onClick={() => handlePremiumPay('yearly')} disabled={processing} className="btn btn-primary w-full">
                    {processing && payPlan === 'yearly' ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Obuna bo'lish
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment method selection (both modes) */}
        <div className="px-8 pb-4">
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-5">
              <h4 className="font-bold text-sm flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-primary" />
                To'lov usulini tanlang
              </h4>

              {/* Method tabs — faqat sozlangan usullar */}
              <div className="flex gap-2 mb-4">
                {paymentMethods.length > 1 ? paymentMethods.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setMethod(m.id); setError(''); }}
                    className={`btn btn-xs ${method === m.id ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    {m.label}
                  </button>
                )) : (
                  <div className="badge badge-primary badge-lg gap-1">
                    {method === 'payme' ? 'Payme' : 'Click'}
                  </div>
                )}
              </div>

              <div className="text-center py-2 text-sm opacity-70">
                📱 {method === 'payme' ? 'Payme ilovasida to\'lov oynasi ochiladi' : 'Click ilovasida to\'lov oynasi ochiladi'}
                <span className="block text-xs opacity-50 mt-1">
                  To'lovdan so'ng avtomatik qaytasiz va {isLanguageMode ? 'til ochiladi' : 'premium faollashadi'}
                </span>
              </div>

              {error && (
                <div className="alert alert-warning text-xs mt-3 py-2">
                  <span>⚠️ {error}</span>
                </div>
              )}

              {/* Language mode: yagona to'lash tugmasi */}
              {isLanguageMode && (
                <button
                  onClick={() => startPayment('language')}
                  disabled={processing || !HAS_PAYMENT}
                  className="btn btn-primary w-full mt-3 gap-2"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                  {processing ? 'To\'lov sahifasiga yo\'naltirilmoqda...' : `${formatPrice(langPrice)} to'lash`}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Payment methods note */}
        <div className="px-8 pb-6 text-center">
          <p className="text-xs opacity-60 mb-3">Qabul qilinadigan to'lov usullari:</p>
          <div className="flex justify-center gap-3">
            {HAS_PAYME && <div className="btn btn-sm btn-ghost bg-base-200">Payme</div>}
            {HAS_CLICK && <div className="btn btn-sm btn-ghost bg-base-200">Click</div>}
            {HAS_PAYMENT && (
              <>
                <div className="btn btn-sm btn-ghost bg-base-200">UzCard</div>
                <div className="btn btn-sm btn-ghost bg-base-200">HUMO</div>
                <div className="btn btn-sm btn-ghost bg-base-200">Visa/MC</div>
              </>
            )}
          </div>
          {!HAS_PAYMENT && (
            <p className="text-xs opacity-40 mt-3">
              * Haqiqiy to'lov ulash uchun Vercel sozlamalarida VITE_PAYME_MERCHANT_ID va PAYME_KEY kiriting
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
