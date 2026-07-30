import { Crown, Star, Check, X, Sparkles, Shield, Zap, Infinity } from 'lucide-react';

export default function PaywallModal({ isOpen, onClose, onUnlock }) {
  if (!isOpen) return null;

  const handleFakePayment = (plan) => {
    // Simulate payment processing
    const btn = document.activeElement;
    if (btn) btn.textContent = 'Processing...';

    setTimeout(() => {
      onUnlock();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

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
                <Crown className="w-12 h-12" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-2">Pro Level'ni oching!</h2>
            <p className="text-white/80 text-lg">
              Advanced (B2-C1) darajasiga chiqing va tilni mukammal o'rganing
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="px-8 pt-6">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: Infinity, text: 'Cheksiz mashqlar' },
              { icon: Zap, text: 'AI Tutor bilan suhbat' },
              { icon: Star, text: 'Advanced daraja' },
              { icon: Shield, text: 'Sertifikat olish' },
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <benefit.icon className="w-4 h-4 text-primary" />
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing cards */}
        <div className="px-8 pb-8 grid md:grid-cols-2 gap-4">
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
              <button
                onClick={() => handleFakePayment('monthly')}
                className="btn btn-primary w-full"
              >
                Obuna bo'lish
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
              <button
                onClick={() => handleFakePayment('yearly')}
                className="btn btn-primary w-full"
              >
                Obuna bo'lish
              </button>
            </div>
          </div>
        </div>

        {/* Payment methods mock */}
        <div className="px-8 pb-6 text-center">
          <p className="text-xs opacity-60 mb-3">To'lov usullari:</p>
          <div className="flex justify-center gap-3">
            <div className="btn btn-sm btn-ghost bg-base-200">Payme</div>
            <div className="btn btn-sm btn-ghost bg-base-200">Click</div>
            <div className="btn btn-sm btn-ghost bg-base-200">UzCard</div>
            <div className="btn btn-sm btn-ghost bg-base-200">Visa/MC</div>
          </div>
          <p className="text-xs opacity-40 mt-3">* Bu mock to'lov tizimi. Haqiqiy to'lov amalga oshirilmaydi.</p>
        </div>
      </div>
    </div>
  );
}
