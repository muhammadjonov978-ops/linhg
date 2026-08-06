import { useState } from 'react';
import { FaCrown as Crown, FaStar as Star, FaCheck as Check, FaTimes as X, FaMagic as Sparkles, FaShieldAlt as Shield, FaBolt as Zap, FaInfinity as InfinityIcon, FaCreditCard as CreditCard, FaLock as Lock, FaCoins as Coins, FaSpinner as Loader2 } from 'react-icons/fa';
import { useSiteConfig, getLangPrice } from '../data/siteConfig';

/**
 * PaywallModal
 * - mode "premium": Pro Level obunasi (mavjud funksiya)
 * - mode "language": pullik til (20 000 so'm) — karta bilan ochish
 */
export default function PaywallModal({ isOpen, onClose, onUnlock, lang }) {
  const config = useSiteConfig();
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardName, setCardName] = useState('');

  if (!isOpen) return null;

  const isLanguageMode = !!lang;
  const price = isLanguageMode ? (getLangPrice(config, lang) || 20000) : 20000;

  const handlePay = (_plan) => {
    // Simulate payment processing (real gateway: Payme/Click/UzCard/HUMO)
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onUnlock();
      onClose();
    }, 1500);
  };

  const formatPrice = (n) => n.toLocaleString('uz-UZ') + " so'm";

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
                ? `Bu til uchun bir martalik to'lov — ${formatPrice(price)}`
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
                  <span className="text-5xl font-extrabold text-primary">{formatPrice(price)}</span>
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
                    <span className="text-4xl font-bold">$9.99</span>
                    <span className="text-sm opacity-70">/oy</span>
                  </div>
                  <ul className="text-sm space-y-2 mb-4">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> Barcha darajalar</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> AI Tutor</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> Speaking mashqlar</li>
                  </ul>
                  <button onClick={() => handlePay('monthly')} disabled={processing} className="btn btn-primary w-full">
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Obuna bo'lish
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
                    <span className="text-4xl font-bold">$79.99</span>
                    <span className="text-sm opacity-70">/yil</span>
                  </div>
                  <div className="badge badge-success mb-2">2 oy bepul</div>
                  <ul className="text-sm space-y-2 mb-4">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> Barcha darajalar</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> AI Tutor</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> Speaking mashqlar</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> Sertifikat</li>
                  </ul>
                  <button onClick={() => handlePay('yearly')} disabled={processing} className="btn btn-primary w-full">
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Obuna bo'lish
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card payment form (language mode) */}
        {isLanguageMode && (
          <div className="px-8 pb-4">
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body p-5">
                <h4 className="font-bold text-sm flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Karta ma'lumotlari
                </h4>

                {/* Method tabs */}
                <div className="flex gap-2 mb-4">
                  {[
                    { id: 'card', label: '💳 Karta' },
                    { id: 'payme', label: 'Payme' },
                    { id: 'click', label: 'Click' },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`btn btn-xs ${method === m.id ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {method === 'card' && (
                  <div className="space-y-3">
                    <div className="relative">
                      <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/[^\d ]/g, '').slice(0, 19))}
                        placeholder="Karta raqami (0000 0000 0000 0000)"
                        className="input input-bordered w-full pl-9 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        placeholder="MM/YY"
                        className="input input-bordered font-mono"
                      />
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Karta egasi ismi"
                        className="input input-bordered"
                      />
                    </div>
                    <p className="text-[11px] opacity-50 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-success" />
                      Ma'lumotlaringiz shifrlangan va xavfsiz saqlanadi (PCI DSS)
                    </p>
                  </div>
                )}

                {method !== 'card' && (
                  <div className="text-center py-4 text-sm opacity-60">
                    {method === 'payme' ? '📱 Payme ilovasida to\'lov oynasi ochiladi' : '📱 Click ilovasida to\'lov oynasi ochiladi'}
                  </div>
                )}

                <button
                  onClick={() => handlePay('language')}
                  disabled={processing || (method === 'card' && cardNumber.replace(/\s/g, '').length < 12)}
                  className="btn btn-primary w-full mt-2 gap-2"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {processing ? 'To\'lov amalga oshirilmoqda...' : `${formatPrice(price)} to'lash`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment methods mock */}
        <div className="px-8 pb-6 text-center">
          <p className="text-xs opacity-60 mb-3">To'lov usullari:</p>
          <div className="flex justify-center gap-3">
            <div className="btn btn-sm btn-ghost bg-base-200">Payme</div>
            <div className="btn btn-sm btn-ghost bg-base-200">Click</div>
            <div className="btn btn-sm btn-ghost bg-base-200">UzCard</div>
            <div className="btn btn-sm btn-ghost bg-base-200">HUMO</div>
            <div className="btn btn-sm btn-ghost bg-base-200">Visa/MC</div>
          </div>
          <p className="text-xs opacity-40 mt-3">
            {isLanguageMode
              ? '* Haqiqiy to\'lov uchun Payme/Click merchant ID ulanishi kerak'
              : '* Bu mock to\'lov tizimi. Haqiqiy to\'lov amalga oshirilmaydi.'}
          </p>
        </div>
      </div>
    </div>
  );
}
