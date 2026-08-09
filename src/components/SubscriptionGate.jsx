import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../i18n';
import LanguageSwitcher from './LanguageSwitcher';
import { GATE_CHANNELS } from '../data/gateChannels';
import {
  isAdminLoggedIn, markGatePassed,
  loadSessionVerified, saveSessionVerified,
} from '../lib/gate';
import {
  LuInstagram, LuShieldCheck, LuCheck, LuExternalLink,
  LuArrowRight, LuSparkles, LuGlobe, LuCrown, LuBadgeCheck,
  LuCircleCheck, LuLock,
} from 'react-icons/lu';

export default function SubscriptionGate({ onPass }) {
  const { t } = useI18n();
  const [verified, setVerified] = useState(() => loadSessionVerified());
  const [isAdmin] = useState(() => isAdminLoggedIn());

  useEffect(() => {
    saveSessionVerified(verified);
  }, [verified]);

  const verifiedCount = GATE_CHANNELS.filter((c) => verified[c.id]).length;
  const allDone = verifiedCount === GATE_CHANNELS.length;

  const markVerified = useCallback((id) => {
    setVerified((v) => (v[id] ? v : { ...v, [id]: true }));
  }, []);

  const handleEnter = () => {
    markGatePassed(verified);
    onPass();
  };

  const handleAdminEnter = () => {
    const all = {};
    GATE_CHANNELS.forEach((c) => { all[c.id] = true; });
    markGatePassed(all);
    onPass();
  };

  return (
    <div className="gate-root fixed inset-0 z-[120] overflow-y-auto">
      {/* Animatsion fon */}
      <div className="fixed inset-0 gate-bg" />
      <div className="fixed inset-0 gate-grid pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[
          { e: '✦', top: '12%', left: '8%', d: '0s', s: 'text-3xl' },
          { e: '✧', top: '22%', right: '10%', d: '1.2s', s: 'text-2xl' },
          { e: '✦', bottom: '18%', left: '14%', d: '2.1s', s: 'text-4xl' },
          { e: '✧', bottom: '26%', right: '16%', d: '0.6s', s: 'text-3xl' },
          { e: '✦', top: '62%', left: '6%', d: '1.8s', s: 'text-xl' },
          { e: '✦', top: '8%', left: '45%', d: '2.6s', s: 'text-2xl' },
        ].map((p, i) => (
          <span
            key={i}
            className={`gate-star absolute ${p.s}`}
            style={{ top: p.top, left: p.left, right: p.right, animationDelay: p.d }}
          >
            {p.e}
          </span>
        ))}
      </div>

      <div className="relative min-h-full flex flex-col items-center justify-center p-4 py-8">
        {/* Yuqori qator */}
        <div className="w-full max-w-lg flex items-center justify-between mb-5 px-1">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Lingohub" className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#3b82f6]/50 gold-glow" />
            <span className="font-bold font-display text-xl text-white">
              Lingo<span className="gold-text">hub</span>
            </span>
          </div>
          <LanguageSwitcher size="sm" />
        </div>

        {/* Asosiy karta */}
        <div className="w-full max-w-lg gate-card rounded-3xl p-6 sm:p-8 relative overflow-hidden animate-[fadeInUp_0.5s_ease-out]">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#3b82f6]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-[#38bdf8]/10 blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="text-center mb-7">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center shadow-lg shadow-[#3b82f6]/30 mb-4 animate-[bounceIn_0.6s_ease-out]">
                <LuGlobe className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-white font-display">
                {t('gate.title')}
              </h1>
              <p className="text-sm text-white/50 mt-2 leading-relaxed">
                {t('gate.subtitle')}
              </p>
            </div>

            {/* Instagram kanallar */}
            <div className="space-y-3 mb-6">
              {GATE_CHANNELS.map((ch) => {
                const done = Boolean(verified[ch.id]);
                return (
                  <div
                    key={ch.id}
                    className={`rounded-2xl border p-3.5 flex items-center gap-3.5 transition-all duration-300 ${
                      done
                        ? 'border-[#4ade80]/50 bg-[#4ade80]/[0.07]'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                    }`}
                  >
                    {/* Instagram ikonkasi */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] shadow-lg shadow-[#dd2a7b]/25 flex items-center justify-center shrink-0">
                      <LuInstagram className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm flex items-center gap-1.5">
                        {ch.name}
                        {done && <LuBadgeCheck className="w-4 h-4 text-[#4ade80]" />}
                      </p>
                      <p className="text-[11px] text-white/40">{ch.label}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {done ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#4ade80]">
                          <LuCircleCheck className="w-4 h-4" /> {t('gate.verified')}
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => markVerified(ch.id)}
                            className="btn btn-xs gap-1 border-0 bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white hover:brightness-110"
                          >
                            <LuCheck className="w-3 h-3" /> {t('gate.igConfirm')}
                          </button>
                          <a
                            href={ch.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-white/50 hover:text-white transition-colors"
                          >
                            <LuExternalLink className="w-2.5 h-2.5" /> {t('gate.openChannel')}
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-white/50">{t('gate.progress', { n: verifiedCount, total: GATE_CHANNELS.length })}</span>
                {allDone ? (
                  <span className="inline-flex items-center gap-1 text-[#4ade80] font-semibold">
                    <LuBadgeCheck className="w-3.5 h-3.5" /> {t('gate.allDone')}
                  </span>
                ) : null}
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#3b82f6] to-[#4ade80] rounded-full transition-all duration-500"
                  style={{ width: `${(verifiedCount / GATE_CHANNELS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Kirish tugmasi */}
            <button
              onClick={handleEnter}
              disabled={!allDone}
              className={`btn w-full gap-2 border-0 text-base font-bold h-12 rounded-2xl transition-all duration-300 ${
                allDone
                  ? 'bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white hover:brightness-110 shadow-lg shadow-[#3b82f6]/30 scale-[1.02] hover:scale-[1.03]'
                  : 'bg-white/10 text-white/35 cursor-not-allowed'
              }`}
            >
              {allDone ? (
                <>
                  <LuArrowRight className="w-5 h-5" /> {t('gate.enter')}
                </>
              ) : (
                <>
                  <LuLock className="w-4 h-4" /> {t('gate.enterLocked')}
                </>
              )}
            </button>

            {/* Admin imtiyozi */}
            {isAdmin && (
              <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl border border-[#3b82f6]/30 bg-[#3b82f6]/[0.07] px-4 py-3">
                <span className="text-xs text-white/70 flex items-center gap-1.5">
                  <LuCrown className="w-4 h-4 text-[#3b82f6]" /> {t('gate.adminNote')}
                </span>
                <button
                  onClick={handleAdminEnter}
                  className="btn btn-xs gap-1 border-0 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white font-bold"
                >
                  <LuShieldCheck className="w-3 h-3" /> {t('gate.adminEnter')}
                </button>
              </div>
            )}

            <p className="text-center text-[10px] text-white/30 mt-5 flex items-center justify-center gap-1">
              <LuSparkles className="w-3 h-3 text-[#3b82f6]" /> {t('gate.freeNote')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
