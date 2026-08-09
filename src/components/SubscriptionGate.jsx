import { useState, useEffect, useRef, useCallback } from 'react';
import { useI18n } from '../i18n';
import LanguageSwitcher from './LanguageSwitcher';
import { GATE_CHANNELS } from '../data/gateChannels';
import {
  isAdminLoggedIn, markGatePassed,
  loadSessionVerified, saveSessionVerified,
  telegramVerifyStart, telegramVerifyStatus,
} from '../lib/gate';
import {
  LuSend, LuInstagram, LuShieldCheck, LuCheck, LuExternalLink,
  LuLoader, LuArrowRight, LuSparkles, LuLock, LuBadgeCheck,
  LuCircleCheck, LuGlobe, LuCrown,
} from 'react-icons/lu';

export default function SubscriptionGate({ onPass }) {
  const { t } = useI18n();
  const [verified, setVerified] = useState(() => loadSessionVerified());
  const [isAdmin] = useState(() => isAdminLoggedIn());

  // Telegram tasdiqlash holati
  const [tgBusy, setTgBusy] = useState(false);
  const [tgMsg, setTgMsg] = useState('');
  const [tgBotUrl, setTgBotUrl] = useState(''); // popup bloklansa qo'lda bosiladigan havola
  const tgTimer = useRef(null);

  useEffect(() => {
    saveSessionVerified(verified);
  }, [verified]);

  useEffect(() => () => { if (tgTimer.current) clearTimeout(tgTimer.current); }, []);

  const verifiedCount = GATE_CHANNELS.filter((c) => verified[c.id]).length;
  const allDone = verifiedCount === GATE_CHANNELS.length;

  const markVerified = useCallback((id) => {
    setVerified((v) => (v[id] ? v : { ...v, [id]: true }));
  }, []);

  // Instagram — "Obuna bo'ldim ✓" tugmasi
  const confirmInstagram = (id) => {
    markVerified(id);
  };

  // Telegram — HAQIQIY tekshiruv (bot orqali)
  const verifyTelegram = async (channel) => {
    if (tgTimer.current) clearTimeout(tgTimer.current);
    setTgBusy(true);
    setTgMsg('');

    const info = await telegramVerifyStart(channel.tgChannel);
    if (!info || !info.ok || !info.configured || !info.botUsername) {
      setTgBusy(false);
      setTgMsg('bot_not_configured');
      return;
    }
    const code = info.code;
    // Botga /start verify_<kod> yuboriladigan havola ochiladi.
    // Popup blokerga qarshi — havola qo'lda bosish uchun ham ko'rsatiladi.
    const url = `https://t.me/${info.botUsername}?start=verify_${code}`;
    setTgBotUrl(url);
    window.open(url, '_blank', 'noopener');

    const deadline = Date.now() + 120000; // 2 daqiqa
    const tick = async () => {
      const res = await telegramVerifyStatus(code, channel.tgChannel);
      if (res && res.pending === false) {
        setTgBusy(false);
        if (res.member) {
          markVerified(channel.id);
          setTgMsg('success');
        } else if (res.error && res.error !== 'telegram_error') {
          setTgMsg('bot_not_admin');
        } else {
          setTgMsg('not_member');
        }
        return;
      }
      if (Date.now() > deadline) {
        setTgBusy(false);
        setTgMsg('timeout');
        return;
      }
      tgTimer.current = setTimeout(tick, 2500);
    };
    tick();
  };

  // Qo'lda tasdiqlash (bot sozlanmagan / admin bo'lmaganda)
  const manualConfirm = () => {
    const tg = GATE_CHANNELS.find((c) => c.type === 'telegram');
    if (tg) markVerified(tg.id);
    setTgBusy(false);
    setTgMsg('');
  };

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

  const tgMsgText = (key) => {
    const map = {
      success: t('gate.verified'),
      not_member: t('gate.notMember'),
      bot_not_admin: t('gate.botNotAdmin'),
      bot_not_configured: t('gate.botNotConfigured'),
      timeout: t('gate.timeout'),
    };
    return map[key] || '';
  };

  // Kanal yetarli emas — qo'lda tasdiqlash faqat Telegram xatosi bo'lganda ko'rsatiladi

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
            <img src="/logo.png" alt="Lingohub" className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#d4af37]/50 gold-glow" />
            <span className="font-bold font-display text-xl text-white">
              Lingo<span className="gold-text">hub</span>
            </span>
          </div>
          <LanguageSwitcher size="sm" />
        </div>

        {/* Asosiy karta */}
        <div className="w-full max-w-lg gate-card rounded-3xl p-6 sm:p-8 relative overflow-hidden animate-[fadeInUp_0.5s_ease-out]">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#facc15]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-[#38bdf8]/10 blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="text-center mb-7">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#facc15] to-[#f59e0b] flex items-center justify-center shadow-lg shadow-[#facc15]/30 mb-4 animate-[bounceIn_0.6s_ease-out]">
                <LuGlobe className="w-8 h-8 text-black" />
              </div>
              <h1 className="text-2xl font-extrabold text-white font-display">
                {t('gate.title')}
              </h1>
              <p className="text-sm text-white/50 mt-2 leading-relaxed">
                {t('gate.subtitle')}
              </p>
            </div>

            {/* Kanal ro'yxati */}
            <div className="space-y-3 mb-6">
              {GATE_CHANNELS.map((ch) => {
                const done = Boolean(verified[ch.id]);
                const isTg = ch.type === 'telegram';
                return (
                  <div
                    key={ch.id}
                    className={`rounded-2xl border p-3.5 flex items-center gap-3.5 transition-all duration-300 ${
                      done
                        ? 'border-[#4ade80]/50 bg-[#4ade80]/[0.07]'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                    }`}
                  >
                    {/* Brand ikonka */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        isTg
                          ? 'bg-gradient-to-br from-[#2AABEE] to-[#229ED9] shadow-lg shadow-[#2AABEE]/25'
                          : 'bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] shadow-lg shadow-[#dd2a7b]/25'
                      }`}
                    >
                      {isTg ? (
                        <LuSend className="w-6 h-6 text-white" />
                      ) : (
                        <LuInstagram className="w-6 h-6 text-white" />
                      )}
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
                      ) : isTg ? (
                        <>
                          <button
                            onClick={() => verifyTelegram(ch)}
                            disabled={tgBusy}
                            className="btn btn-xs gap-1 border-0 bg-gradient-to-r from-[#2AABEE] to-[#229ED9] text-white hover:brightness-110 disabled:opacity-50"
                          >
                            {tgBusy ? (
                              <LuLoader className="w-3 h-3 animate-spin" />
                            ) : (
                              <LuShieldCheck className="w-3 h-3" />
                            )}
                            {t('gate.verifyTg')}
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
                      ) : (
                        <>
                          <button
                            onClick={() => confirmInstagram(ch.id)}
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

            {/* Telegram holat xabarlari */}
            {tgBusy && !tgMsg && (
              <div className="rounded-xl px-3.5 py-2.5 text-xs bg-[#2AABEE]/10 border border-[#2AABEE]/30 text-[#7dd3fc] mb-4 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <LuLoader className="w-3.5 h-3.5 animate-spin shrink-0" />
                  {t('gate.waiting')}
                </span>
                {tgBotUrl && (
                  <a
                    href={tgBotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-xs gap-1 border-0 bg-gradient-to-r from-[#2AABEE] to-[#229ED9] text-white hover:brightness-110 shrink-0"
                  >
                    <LuSend className="w-3 h-3" /> {t('gate.openBot')}
                  </a>
                )}
              </div>
            )}
            {tgMsg && tgMsg !== 'success' && (
              <div className="rounded-xl px-3.5 py-2.5 text-xs bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#fbbf24] mb-4 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <LuShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  {tgMsgText(tgMsg)}
                </span>
                {tgMsg === 'bot_not_admin' || tgMsg === 'bot_not_configured' || tgMsg === 'timeout' ? (
                  <button
                    onClick={manualConfirm}
                    className="text-[11px] font-semibold text-white/80 hover:text-white underline shrink-0"
                  >
                    {t('gate.manual')}
                  </button>
                ) : null}
              </div>
            )}

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
                  className="h-full bg-gradient-to-r from-[#facc15] to-[#4ade80] rounded-full transition-all duration-500"
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
                  ? 'bg-gradient-to-r from-[#facc15] to-[#f59e0b] text-black hover:brightness-110 shadow-lg shadow-[#facc15]/30 scale-[1.02] hover:scale-[1.03]'
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
              <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl border border-[#facc15]/30 bg-[#facc15]/[0.07] px-4 py-3">
                <span className="text-xs text-white/70 flex items-center gap-1.5">
                  <LuCrown className="w-4 h-4 text-[#facc15]" /> {t('gate.adminNote')}
                </span>
                <button
                  onClick={handleAdminEnter}
                  className="btn btn-xs gap-1 border-0 bg-gradient-to-r from-[#facc15] to-[#f59e0b] text-black font-bold"
                >
                  <LuShieldCheck className="w-3 h-3" /> {t('gate.adminEnter')}
                </button>
              </div>
            )}

            <p className="text-center text-[10px] text-white/30 mt-5 flex items-center justify-center gap-1">
              <LuSparkles className="w-3 h-3 text-[#facc15]" /> {t('gate.freeNote')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
