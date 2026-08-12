import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { fetchDailyBonus, claimDailyBonus, getServerUid } from '../lib/server';
import {
  FaGift as Gift, FaCheckCircle as CheckCircle, FaSpinner as Loader2,
  FaFire as Flame, FaCoins as Coins,
} from 'react-icons/fa';

// Kunlik bonus — serverda boshqariladi (cheat qilib bo'lmaydi):
// har kuni 1 marta, streak oshgan sari bonus ham oshadi.
export default function DailyBonus() {
  const { state, dispatch } = useApp();
  const [status, setStatus] = useState(null);   // { claimed, streak, nextAmount }
  const [busy, setBusy] = useState(false);
  const [granted, setGranted] = useState(0);

  const load = useCallback(() => {
    fetchDailyBonus(getServerUid()).then((data) => {
      if (data?.ok) {
        setStatus({ claimed: !!data.claimed, streak: data.streak || 0, nextAmount: data.nextAmount || 10 });
      }
    });
  }, []);

  useEffect(() => {
    load();
    // Har daqiqada yangilab turamiz — tunda 00:00 da avtomatik ochiladi
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  const handleClaim = async () => {
    if (busy || status?.claimed) return;
    setBusy(true);
    try {
      const data = await claimDailyBonus(getServerUid());
      if (data?.ok && data.granted > 0) {
        dispatch({ type: 'ADD_COINS', payload: data.granted });
        setGranted(data.granted);
        setStatus({ claimed: true, streak: data.newStreak || 1, nextAmount: data.granted });
        // Toast ko'rsatish
        const toast = document.createElement('div');
        toast.className = 'fixed top-20 right-4 z-[200] px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold shadow-2xl animate-[fadeInUp_0.4s_ease-out]';
        toast.textContent = `🎁 Kunlik bonus: +${data.granted} tanga!`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
      }
    } finally {
      setBusy(false);
    }
  };

  const nextAmount = status?.nextAmount || 10;
  const claimed = status?.claimed;

  return (
    <div className={`card overflow-hidden transition-all duration-300 group ${
      claimed ? 'bg-base-100 border border-base-300' : 'bg-gradient-to-br from-amber-500/15 to-orange-600/10 border border-amber-400/30 shadow-sm hover:shadow-md'
    }`}>
      <div className="card-body p-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              claimed ? 'bg-success/10' : 'bg-gradient-to-br from-amber-400 to-orange-500'
            }`}>
              {claimed ? <CheckCircle className="w-4 h-4 text-success" /> : <Gift className="w-4 h-4 text-white" />}
            </div>
            <div>
              <h3 className="font-bold text-sm">Kunlik bonus</h3>
              <p className="text-[11px] opacity-50">
                {claimed ? 'Bugun olindi — ertaga yana keling!' : `Har kuni +${nextAmount} tanga`}
              </p>
            </div>
          </div>
          {!claimed && status && (
            <span className="badge badge-warning badge-xs gap-1 animate-pulse">
              <Coins className="w-2.5 h-2.5" /> +{nextAmount}
            </span>
          )}
        </div>

        {/* Streak ko'rsatkichi */}
        <div className="flex items-center gap-1.5 mt-2">
          <Flame className={`w-3.5 h-3.5 ${(status?.streak || 0) > 0 ? 'text-orange-500' : 'opacity-30'}`} />
          <span className="text-xs font-semibold">{status?.streak || 0}-kun</span>
          <div className="flex-1 h-1.5 bg-base-200 rounded-full overflow-hidden ml-1">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(((status?.streak || 0) / 7) * 100, 100)}%` }}
            />
          </div>
          <span className="text-[10px] opacity-40">{Math.min(status?.streak || 0, 7)}/7</span>
        </div>

        {!claimed ? (
          <button
            onClick={handleClaim}
            disabled={busy || !status}
            className="btn btn-sm btn-warning w-full mt-2 gap-1 border-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:brightness-110 disabled:opacity-50 transition-all duration-300"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Gift className="w-3.5 h-3.5" />}
            {busy ? 'Olinmoqda...' : `Bonusingizni oling (+${nextAmount} 🪙)`}
          </button>
        ) : (
          <div className="mt-2 text-center text-xs text-success font-medium animate-[fadeIn_0.3s_ease-out]">
            {granted > 0 ? `✅ +${granted} tanga hisobingizga qo'shildi!` : '✅ Bugungi bonus olindi'}
          </div>
        )}
      </div>
    </div>
  );
}
