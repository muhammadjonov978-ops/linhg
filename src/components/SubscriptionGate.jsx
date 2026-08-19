import { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from '../i18n';
import LanguageSwitcher from './LanguageSwitcher';
import { GATE_CHANNELS, GATE_TELEGRAM_CHANNEL } from '../data/gateChannels';
import {
  isAdminLoggedIn, markGatePassed,
  loadSessionVerified, saveSessionVerified,
} from '../lib/gate';
import {
  LuInstagram, LuSend as LuTelegram, LuShieldCheck, LuExternalLink,
  LuArrowRight, LuSparkles, LuGlobe, LuCrown, LuBadgeCheck,
  LuCircleCheck, LuLock, LuRefreshCw, LuKeyRound, LuLoader,
} from 'react-icons/lu';

const TELEGRAM_POLL_MS = 2500;
const TELEGRAM_TIMEOUT_MS = 120000;

export default function SubscriptionGate({ onPass }) {
  const { t } = useI18n();
  const [verified, setVerified] = useState(() => loadSessionVerified());
  const [isAdmin] = useState(() => isAdminLoggedIn());
  const [tgConfigured, setTgConfigured] = useState(null);
  const [igHasCode, setIgHasCode] = useState(null);
  const [tg, setTg] = useState({ phase: 'idle', code: null, botUsername: null, error: '' });
  const [igInputs, setIgInputs] = useState({});
  const pollTimer = useRef(null);
  const verifiedRef = useRef(verified);
  verifiedRef.current = verified;

  const markVerified = useCallback((id) => {
    setVerified((v) => (v[id] ? v : { ...v, [id]: true }));
  }, []);

  // Server holatini yuklash
  useEffect(() => {
    let cancelled = false;
    fetch('/api/telegram/verify', { method: 'POST' })
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setTgConfigured(!!d.configured); })
      .catch(() => { if (!cancelled) setTgConfigured(false); });
    fetch('/api/gate/code/status')
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setIgHasCode(!!d.hasCode); })
      .catch(() => { if (!cancelled) setIgHasCode(false); });
    return () => { cancelled = true; };
  }, []);

  // AUTO-BYPASS: Agar hech qanday tekshiruv usuli mavjud bo'lmasa
  // (Telegram bot sozlanmagan + Instagram kodlari yo'q) — shlyuzni avtomatik o'tkazamiz.
  // Bu dev/demo rejimda saytga kirishni ta'minlaydi.
  const bypassDone = useRef(false);
  useEffect(() => {
    if (bypassDone.current) return;
    // Hali serverdan javob kelmagan bo'lsa — kutamiz
    if (tgConfigured === null || igHasCode === null) return;
    // Kamida bitta tekshiruv usuli mavjud — foydalanuvchi obuna bo'lishi kerak
    if (tgConfigured === true || igHasCode === true) return;
    // Hech qanday usul yo'q — avtomatik o'tkazamiz
    bypassDone.current = true;
    const all = {};
    GATE_CHANNELS.forEach((c) => { all[c.id] = true; });
    markGatePassed(all);
    onPass();
  }, [tgConfigured, igHasCode, onPass]);

  useEffect(() => {
    saveSessionVerified(verified);
  }, [verified]);

  useEffect(() => () => clearInterval(pollTimer.current), []);

  const verifiedCount = GATE_CHANNELS.filter((c) => verified[c.id]).length;
  const allDone = verifiedCount === GATE_CHANNELS.length;

  // ---------- TELEGRAM ----------
  const startTelegramVerify = async () => {
    setTg({ phase: 'link', code: null, botUsername: null, error: '' });
    try {
      const res = await fetch('/api/telegram/verify', { method: 'POST' });
      const data = await res.json();
      if (!data?.ok || !data.configured || !data.code) {
        setTg({ phase: 'error', code: null, botUsername: null, error: data?.error || t('gate.tgNotConfigured') });
        return;
      }
      setTg({ phase: 'link', code: data.code, botUsername: data.botUsername, error: '' });
      startPolling(data.code);
    } catch {
      setTg({ phase: 'error', code: null, botUsername: null, error: t('gate.tgServerError') });
    }
  };

  const startPolling = (code) => {
    if (pollTimer.current) clearInterval(pollTimer.current);
    const startedAt = Date.now();
    const poll = async () => {
      try {
        const res = await fetch(
          `/api/telegram/verify/status?code=${encodeURIComponent(code)}&channel=${encodeURIComponent(GATE_TELEGRAM_CHANNEL.id)}`
        );
        const data = await res.json();
        if (data?.pending) {
          if (Date.now() - startedAt > TELEGRAM_TIMEOUT_MS) {
            clearInterval(pollTimer.current);
            setTg((s) => ({ ...s, phase: 'error', error: t('gate.tgTimeout') }));
          }
          return;
        }
        clearInterval(pollTimer.current);
        if (data?.member) {
          markVerified(GATE_TELEGRAM_CHANNEL.id);
          setTg((s) => ({ ...s, phase: 'done', error: '' }));
        } else {
          setTg((s) => ({ ...s, phase: 'error', error: data?.error || t('gate.tgNotMember') }));
        }
      } catch { /* retry next poll */ }
    };
    poll();
    pollTimer.current = setInterval(poll, TELEGRAM_POLL_MS);
  };

  const openTelegramBot = () => {
    if (tg.botUsername && tg.code) {
      window.open(`https://t.me/${tg.botUsername}?start=verify_${tg.code}`, '_blank', 'noopener');
    }
  };

  // ---------- INSTAGRAM ----------
  const setIgValue = (id, value) => setIgInputs((s) => ({ ...s, [id]: { ...(s[id] || {}), value, error: '' } }));

  const checkIgCode = async (ch) => {
    const value = (igInputs[ch.id]?.value || '').trim();
    if (!value) return;
    setIgInputs((s) => ({ ...s, [ch.id]: { ...(s[ch.id] || {}), checking: true, error: '' } }));
    try {
      const res = await fetch('/api/gate/code/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: value }),
      });
      const data = await res.json();
      if (data?.valid) {
        markVerified(ch.id);
        setIgInputs((s) => ({ ...s, [ch.id]: { ...(s[ch.id] || {}), checking: false, ok: true, error: '' } }));
      } else {
        setIgInputs((s) => ({
          ...s,
          [ch.id]: { ...(s[ch.id] || {}), checking: false, error: data?.missing ? t('gate.igNoCode') : t('gate.igWrong') },
        }));
      }
    } catch {
      setIgInputs((s) => ({ ...s, [ch.id]: { ...(s[ch.id] || {}), checking: false, error: t('gate.tgServerError') } }));
    }
  };

  const handleEnter = () => {
    markGatePassed(verifiedRef.current);
    onPass();
  };

  const handleAdminEnter = () => {
    const all = {};
    GATE_CHANNELS.forEach((c) => { all[c.id] = true; });
    markGatePassed(all);
    onPass();
  };

  const tgChannel = GATE_CHANNELS.find((c) => c.type === 'telegram');

  // Telegram kanal kartasi ichidagi boshqaruv
  const renderTelegramControl = () => {
    const done = Boolean(verified[tgChannel?.id]);
    if (done) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#4ade80]">
          <LuCircleCheck className="w-4 h-4" /> {t('gate.verified')}
        </span>
      );
    }
    if (tgConfigured === false) {
      return (
        <span className="text-[10px] text-amber-300/80 text-right max-w-[160px] sm:max-w-[180px] leading-snug shrink-0">
          {t('gate.tgNotSetup')}
        </span>
      );
    }
    if (tg.phase === 'idle') {
      return (
        <button
          onClick={startTelegramVerify}
          className="btn btn-xs gap-1 border-0 bg-gradient-to-r from-[#38bdf8] to-[#0ea5e9] text-white hover:brightness-110 shrink-0"
        >
          <LuTelegram className="w-3 h-3" /> {t('gate.telegramVerify')}
        </button>
      );
    }
    if (tg.phase === 'link') {
      return (
        <div className="flex flex-col items-end gap-1.5 shrink-0 max-w-[160px] sm:max-w-[180px]">
          <button
            onClick={openTelegramBot}
            className="btn btn-xs gap-1 border-0 bg-gradient-to-r from-[#38bdf8] to-[#0ea5e9] text-white hover:brightness-110 w-full"
          >
            <LuTelegram className="w-3 h-3" /> {t('gate.telegramOpenBot')}
          </button>
          <span className="inline-flex items-center gap-1.5 text-[10px] text-white/50">
            <LuLoader className="w-3 h-3 animate-spin" /> {t('gate.telegramWaiting')}
          </span>
        </div>
      );
    }
    if (tg.phase === 'error') {
      return (
        <div className="flex flex-col items-end gap-1.5 shrink-0 max-w-[160px] sm:max-w-[190px]">
          <span className="text-[10px] text-red-300/90 text-right leading-snug">{tg.error}</span>
          <button
            onClick={startTelegramVerify}
            className="btn btn-xs gap-1 border border-white/20 bg-white/[0.06] text-white hover:bg-white/[0.12]"
          >
            <LuRefreshCw className="w-3 h-3" /> {t('gate.retry')}
          </button>
        </div>
      );
    }
    return null;
  };

  // Instagram kanal kartasi ichidagi boshqaruv
  const renderIgControl = (ch) => {
    const st = igInputs[ch.id] || {};
    if (verified[ch.id]) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#4ade80]">
          <LuCircleCheck className="w-4 h-4" /> {t('gate.verified')}
        </span>
      );
    }
    if (igHasCode === false) {
      return (
        <span className="text-[10px] text-amber-300/80 text-right max-w-[160px] sm:max-w-[180px] leading-snug shrink-0">
          {t('gate.igNoCode')}
        </span>
      );
    }
    return (
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={st.value || ''}
            onChange={(e) => setIgValue(ch.id, e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') checkIgCode(ch); }}
            placeholder={t('gate.igCodePlaceholder')}
            className="input input-xs w-20 sm:w-28 bg-white/[0.05] border border-white/15 text-white placeholder:text-white/30 focus:border-[#dd2a7b] focus:outline-none transition-colors text-center tracking-widest uppercase"
            maxLength={16}
          />
          <button
            onClick={() => checkIgCode(ch)}
            disabled={!st.value || st.checking}
            className="btn btn-xs gap-1 border-0 bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white hover:brightness-110 disabled:opacity-50"
          >
            {st.checking ? <LuLoader className="w-3 h-3 animate-spin" /> : <LuKeyRound className="w-3 h-3" />}
            <span className="hidden sm:inline">{t('gate.igCheck')}</span>
          </button>
        </div>
        <a
          href={ch.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] text-white/50 hover:text-white transition-colors"
        >
          <LuExternalLink className="w-2.5 h-2.5" /> {t('gate.openChannel')}
        </a>
        {st.error && <span className="text-[10px] text-red-300/90 text-right leading-snug max-w-[160px] sm:max-w-[180px]">{st.error}</span>}
      </div>
    );
  };

  // Yuklanmoqda — serverdan javob kutilmoqda
  if (tgConfigured === null || igHasCode === null) {
    return (
      <div className="gate-root fixed inset-0 z-[120] flex items-center justify-center">
        <div className="fixed inset-0 gate-bg" />
        <div className="relative flex flex-col items-center gap-3">
          <LuLoader className="w-8 h-8 animate-spin text-[#8b5cf6]" />
          <span className="text-white/60 text-sm">Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

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

      <div className="relative min-h-full flex flex-col items-center justify-center p-3 sm:p-4 py-6 sm:py-8">
        {/* Yuqori qator */}
        <div className="w-full max-w-lg flex items-center justify-between mb-4 sm:mb-5 px-1">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Lingohub" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover ring-1 ring-[#8b5cf6]/50 gold-glow" />
            <span className="font-bold font-display text-lg sm:text-xl text-white">
              Lingo<span className="gold-text">hub</span>
            </span>
          </div>
          <LanguageSwitcher size="sm" />
        </div>

        {/* Asosiy karta */}
        <div className="w-full max-w-lg gate-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 relative overflow-hidden animate-[fadeInUp_0.5s_ease-out]">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#8b5cf6]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-[#38bdf8]/10 blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="text-center mb-5 sm:mb-7">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] flex items-center justify-center shadow-lg shadow-[#8b5cf6]/30 mb-3 sm:mb-4 animate-[bounceIn_0.6s_ease-out]">
                <LuGlobe className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                {t('gate.title')}
              </h1>
              <p className="text-xs sm:text-sm text-white/50 mt-1.5 sm:mt-2 leading-relaxed">
                {t('gate.subtitle')}
              </p>
            </div>

            {/* Kanallar */}
            <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
              {GATE_CHANNELS.map((ch) => {
                const done = Boolean(verified[ch.id]);
                const isTg = ch.type === 'telegram';
                return (
                  <div
                    key={ch.id}
                    className={`rounded-xl sm:rounded-2xl border p-3 sm:p-3.5 flex items-center gap-2.5 sm:gap-3.5 transition-all duration-300 ${
                      done
                        ? 'border-[#4ade80]/50 bg-[#4ade80]/[0.07]'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                    }`}
                  >
                    {/* Ikonka */}
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center shrink-0 ${
                        isTg
                          ? 'bg-gradient-to-br from-[#38bdf8] to-[#0ea5e9] shadow-[#0ea5e9]/25'
                          : 'bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] shadow-[#dd2a7b]/25'
                      }`}
                    >
                      {isTg ? <LuTelegram className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> : <LuInstagram className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                        {ch.name}
                        {done && <LuBadgeCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4ade80]" />}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-white/40">{ch.label}</p>
                      {!done && isTg && tgConfigured !== false && (
                        <p className="text-[9px] sm:text-[10px] text-white/30 mt-0.5 leading-snug">{t('gate.telegramVerifyHint')}</p>
                      )}
                      {!done && !isTg && igHasCode !== false && (
                        <p className="text-[9px] sm:text-[10px] text-white/30 mt-0.5 leading-snug">{t('gate.igCodeHint')}</p>
                      )}
                    </div>

                    {isTg ? renderTelegramControl() : renderIgControl(ch)}
                  </div>
                );
              })}
            </div>

            {/* Progress */}
            <div className="mb-5 sm:mb-6">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-white/50">{t('gate.progress', { n: verifiedCount, total: GATE_CHANNELS.length })}</span>
                {allDone ? (
                  <span className="inline-flex items-center gap-1 text-[#4ade80] font-semibold">
                    <LuBadgeCheck className="w-3.5 h-3.5" /> {t('gate.allDone')}
                  </span>
                ) : null}
              </div>
              <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] rounded-full transition-all duration-500"
                  style={{ width: `${(verifiedCount / GATE_CHANNELS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Kirish tugmasi */}
            <button
              onClick={handleEnter}
              disabled={!allDone}
              className={`btn w-full gap-2 border-0 text-sm sm:text-base font-bold h-11 sm:h-12 rounded-xl sm:rounded-2xl transition-all duration-300 ${
                allDone
                  ? 'bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] text-white hover:brightness-110 shadow-lg shadow-[#8b5cf6]/30 scale-[1.02] hover:scale-[1.03]'
                  : 'bg-white/10 text-white/35 cursor-not-allowed'
              }`}
            >
              {allDone ? (
                <>
                  <LuArrowRight className="w-4 h-4 sm:w-5 sm:h-5" /> {t('gate.enter')}
                </>
              ) : (
                <>
                  <LuLock className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {t('gate.enterLocked')}
                </>
              )}
            </button>

            {/* Admin imtiyozi */}
            {isAdmin && (
              <div className="mt-3 sm:mt-4 flex items-center justify-between gap-2 rounded-xl sm:rounded-2xl border border-[#8b5cf6]/30 bg-[#8b5cf6]/[0.07] px-3 sm:px-4 py-2.5 sm:py-3">
                <span className="text-[10px] sm:text-xs text-white/70 flex items-center gap-1.5">
                  <LuCrown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8b5cf6]" /> {t('gate.adminNote')}
                </span>
                <button
                  onClick={handleAdminEnter}
                  className="btn btn-xs gap-1 border-0 bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] text-white font-bold"
                >
                  <LuShieldCheck className="w-3 h-3" /> {t('gate.adminEnter')}
                </button>
              </div>
            )}

            <p className="text-center text-[9px] sm:text-[10px] text-white/30 mt-4 sm:mt-5 flex items-center justify-center gap-1">
              <LuSparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#8b5cf6]" /> {t('gate.freeNote')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
