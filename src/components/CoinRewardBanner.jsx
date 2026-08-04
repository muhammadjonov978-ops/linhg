import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { languages } from '../data/languages';
import { useSiteConfig, getLangPrice } from '../data/siteConfig';
import { Coins, Sparkles, Check, X, Lock, CheckCircle } from 'lucide-react';

const COIN_REWARD = 5000;
const MAX_FREE_LANGS = 2;

export default function CoinRewardBanner() {
  const { state, dispatch } = useApp();
  const config = useSiteConfig();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState([]);

  // Pullik tillar (admin narx sozlagan tillar; id bo'yicha unikal)
  const PAID_LANGS = Array.from(
    new Map(languages.filter(l => getLangPrice(config, l) > 0).map(l => [l.id, l])).values()
  );

  const unlocked = state.unlockedLanguages || {};
  const availableLangs = PAID_LANGS.filter(l => !unlocked[l.id]);
  const hasReward = state.coins >= COIN_REWARD;
  const remaining = Math.max(0, COIN_REWARD - state.coins);
  const progress = Math.min(100, Math.round((state.coins / COIN_REWARD) * 100));

  const toggleLang = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < MAX_FREE_LANGS ? [...prev, id] : prev
    );
  };

  const handleRedeem = () => {
    if (selected.length !== MAX_FREE_LANGS) return;
    selected.forEach(id => dispatch({ type: 'UNLOCK_LANGUAGE', payload: id }));
    dispatch({ type: 'ADD_COINS', payload: -COIN_REWARD });
    setOpen(false);
    setSelected([]);
  };

  // Barcha pullik tillar ochilgan bo'lsa — banner ko'rsatilmaydi
  if (availableLangs.length === 0) return null;

  return (
    <>
      {/* Banner */}
      <div className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${
        hasReward
          ? 'border-warning/50 bg-gradient-to-r from-warning/15 via-base-100 to-secondary/15 shadow-lg shadow-warning/10'
          : 'border-base-300 bg-base-100'
      }`}>
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${hasReward ? 'bg-warning/40 animate-pulse' : 'bg-warning/20'}`} />
          <div className={`absolute -bottom-8 left-10 w-20 h-20 rounded-full ${hasReward ? 'bg-secondary/40 animate-pulse' : 'bg-secondary/20'}`} style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="relative flex flex-col sm:flex-row items-center gap-4 p-4 md:p-5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
            hasReward ? 'bg-warning text-base-100 scale-110' : 'bg-warning/10 text-warning'
          }`}>
            {hasReward ? <Sparkles className="w-6 h-6" /> : <Coins className="w-6 h-6" />}
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h3 className="font-bold text-sm flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              {hasReward ? (
                <>
                  <span className="text-warning">5000 🪙 to'plandi!</span>
                  <span className="badge badge-warning badge-sm gap-1">
                    <Sparkles className="w-3 h-3" /> 2 ta pullik til bepul
                  </span>
                </>
              ) : (
                <span>5000 tanga yig'ing — 2 ta pullik tilni bepul tanlang!</span>
              )}
            </h3>
            <p className="text-xs opacity-60 mt-1">
              {hasReward
                ? `${availableLangs.length} ta pullik til ichidan xohlagan 2 tasini tanlang`
                : `Hozircha ${state.coins} 🪙 · yana ${remaining} tanga qoldi`}
            </p>

            {/* Progress bar */}
            {!hasReward && (
              <div className="w-full h-1.5 bg-base-300 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-warning to-secondary rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          {hasReward && (
            <button
              onClick={() => setOpen(true)}
              className="btn btn-warning btn-sm gap-2 shrink-0 btn-wave"
            >
              <Coins className="w-4 h-4" />
              Tanlash (2 ta)
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-base-100 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-[fadeIn_0.3s_ease-out]">
            <div className="bg-gradient-to-br from-warning via-amber-600 to-secondary rounded-t-3xl p-6 text-center text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-8 animate-ping text-3xl">🪙</div>
                <div className="absolute bottom-4 right-8 animate-ping text-3xl" style={{ animationDelay: '0.5s' }}>✨</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 btn btn-ghost btn-circle btn-sm z-10 text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="relative">
                <div className="flex justify-center mb-3">
                  <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                    <Coins className="w-8 h-8" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold">2 ta pullik tilni tanlang</h2>
                <p className="text-white/85 text-sm mt-1">
                  5000 🪙 sarflanadi · tillar umrbod ochiq qoladi
                </p>
              </div>
            </div>

            <div className="p-5">
              <p className="text-xs opacity-60 mb-3 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                {selected.length}/{MAX_FREE_LANGS} ta tanlandi — tugmani bosib tasdiqlang
              </p>

              <div className="space-y-2">
                {availableLangs.map(lang => {
                  const isSelected = selected.includes(lang.id);
                  return (
                    <button
                      key={lang.id}
                      onClick={() => toggleLang(lang.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-warning bg-warning/10'
                          : 'border-base-300 hover:border-primary/40 hover:bg-base-200/50'
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="flex-1 min-w-0">
                        <span className="font-bold text-sm block">{lang.name}</span>
                        <span className="text-[11px] opacity-50 flex items-center gap-1">
                          <Coins className="w-3 h-3" /> {getLangPrice(config, lang).toLocaleString('uz-UZ')} so'm — BEPUL
                        </span>
                      </span>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isSelected ? 'bg-warning text-base-100' : 'bg-base-300'
                      }`}>
                        {isSelected && <Check className="w-4 h-4" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleRedeem}
                disabled={selected.length !== MAX_FREE_LANGS}
                className="btn btn-warning w-full mt-4 gap-2 btn-wave"
              >
                <CheckCircle className="w-4 h-4" />
                {selected.length === MAX_FREE_LANGS
                  ? `5000 🪙 sarflab ochish`
                  : `Yana ${MAX_FREE_LANGS - selected.length} ta tanlang`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
