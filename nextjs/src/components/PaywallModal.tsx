'use client';

import { X, Check, Crown, Star, Shield, Zap, Sparkles } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
}

export default function PaywallModal({ isOpen, onClose, onUnlock }: PaywallModalProps) {
  if (!isOpen) return null;

  const features = [
    'Advanced darajadagi barcha darslar',
    'Shaxsiy AI Tutor to\'liq rejimda',
    'Cheksiz speaking amaliyoti',
    'Barcha tillarda to\'liq kurslar',
    'Statistika va tahlillar',
    'Maxsus sertifikatlar',
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-base-100 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-[scaleIn_0.3s_ease-out]">
        {/* Premium header */}
        <div className="bg-gradient-to-br from-warning via-amber-500 to-orange-500 p-6 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 btn btn-ghost btn-xs btn-circle text-white">
            <X className="w-4 h-4" />
          </button>
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 premium-glow">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Premium-ni oching</h2>
          <p className="text-white/80 text-sm">Cheksiz imkoniyatlar bilan til o'rganing</p>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-warning">$9.99</span>
              <span className="text-sm opacity-50">/oy</span>
            </div>
            <p className="text-xs opacity-50 mt-1">Har qanday vaqtda bekor qilishingiz mumkin</p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-success" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={onUnlock}
            className="btn btn-warning w-full gap-2 text-base font-bold shadow-lg shadow-warning/20 hover:shadow-xl hover:shadow-warning/30 transition-all"
          >
            <Crown className="w-5 h-5" />
            Premium-ni ochish
            <Sparkles className="w-4 h-4" />
          </button>

          <p className="text-xs opacity-40 text-center mt-4">
            To'lov bir marta amalga oshiriladi. Hech qanday abonement talab qilinmaydi.
          </p>
        </div>
      </div>
    </div>
  );
}
