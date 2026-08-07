import { useState, useEffect, useRef } from 'react';
import {
  FaKeyboard as Keyboard, FaExternalLinkAlt as ExternalLink,
  FaTimes as X, FaBolt as Bolt, FaGlobe as Globe,
  FaPaintRoller as PaintRoller, FaGamepad as Gamepad, FaRocket as Rocket,
  FaChevronRight as ChevronRight, FaBullhorn as Megaphone,
} from 'react-icons/fa';

const STYPING_URL = 'https://styping.uz';

const STYPING_FEATURES = [
  { icon: Globe, title: '20+ til', desc: "O'zbek, rus, ingliz va boshqalar" },
  { icon: Bolt, title: 'Tezlik & aniqlik', desc: 'WPM, xatolar va foizda aniqlik' },
  { icon: PaintRoller, title: '25+ mavzu', desc: 'Chiroyli va qulay dizaynlar' },
  { icon: Gamepad, title: 'Mini-o\'yinlar', desc: 'O\'yin orqali mashq qiling' },
];

export default function StypingAdBanner() {
  const [open, setOpen] = useState(false);
  const closeBtnRef = useRef(null);

  // Escape tugmasi bilan yopish + orqa fon scroll'ini bloklash
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Modal ochilganda focus'ni yopish tugmasiga beramiz
    closeBtnRef.current?.focus();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      {/* ===== Reklama paneli (banner) ===== */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group w-full text-left card bg-base-100 border border-base-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden cursor-pointer relative"
        aria-label="STyping.uz haqida batafsil"
      >
        {/* Dekorativ gradient chiziq */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 opacity-70" />
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-gradient-to-br from-slate-100/10 via-transparent to-transparent" />

        <div className="card-body p-5 flex-row items-center gap-4">
          {/* Logo */}
          <div className="relative shrink-0">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-slate-300/50 to-slate-600/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img
              src="/styping-logo.svg"
              alt="STyping.uz"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover ring-2 ring-slate-500/60 shadow-lg shadow-black/40 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300"
            />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-base-100 animate-pulse" />
          </div>

          {/* Matn */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-wide">
                STyping.uz
              </span>
              <span className="badge badge-ghost badge-xs gap-1 opacity-70">
                <Megaphone className="w-2.5 h-2.5" /> Reklama
              </span>
            </div>
            <p className="text-sm opacity-70 line-clamp-2">
              Tez yozish tezligingizni o'lchang va oshiring — 20+ til, 25+ mavzu va mini-o'yinlar bilan.
            </p>
          </div>

          {/* O'q */}
          <div className="shrink-0 flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
            <span className="text-xs font-semibold hidden sm:inline">Batafsil</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </button>

      {/* ===== Ma'lumot oynasi (modal) ===== */}
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Orqa fon */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setOpen(false)}
          />

          {/* Modal karta */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="styping-modal-title"
            className="relative w-full max-w-md bg-base-100 rounded-3xl border border-base-300 shadow-2xl shadow-black/60 overflow-x-hidden overflow-y-auto animate-[scaleIn_0.25s_ease-out] max-h-[90dvh] chat-scroll"
          >
            {/* Gradient tepa */}
            <div className="relative h-28 bg-gradient-to-br from-slate-800 via-slate-900 to-black flex items-center justify-center">
              <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(400px 160px at 50% -40%, rgba(255,255,255,0.35), transparent 60%)' }} />
              <img
                src="/styping-logo.svg"
                alt="STyping.uz"
                className="relative w-24 h-24 rounded-full object-cover ring-4 ring-slate-400/40 shadow-2xl shadow-black/60 animate-bounceIn"
              />
              {/* Yopish tugmasi */}
              <button
                ref={closeBtnRef}
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 btn btn-ghost btn-sm btn-circle bg-black/30 text-white hover:bg-black/50 border border-white/15 modal-close-focus"
                aria-label="Yopish"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {/* Sarlavha */}
              <div className="text-center mb-5">
                <h3 id="styping-modal-title" className="text-2xl font-extrabold mb-1">
                  <span className="bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                    STyping.uz
                  </span>
                </h3>
                <p className="text-sm opacity-70">
                  Bepul tez yozish (typing speed test) platformasi
                </p>
              </div>

              {/* Tavsif */}
              <p className="text-sm opacity-80 text-center mb-6 leading-relaxed">
                Klaviaturada tez va xatosiz yozishni o'rganing! WPM tezligingizni
                o'lchang, aniqlikni kuzating va qiziqarli mashqlar bilan
                mahoratingizni oshiring.
              </p>

              {/* Xususiyatlar */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {STYPING_FEATURES.map((f, i) => (
                  <div
                    key={i}
                    className="card bg-base-200/60 border border-base-300/70 p-3.5 hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <f.icon className="w-5 h-5 text-slate-300 mb-2" />
                    <p className="text-xs font-bold">{f.title}</p>
                    <p className="text-[11px] opacity-60 mt-0.5 leading-snug">{f.desc}</p>
                  </div>
                ))}
              </div>

              {/* Haqida qisqa */}
              <div className="flex items-start gap-2.5 bg-primary/5 border border-primary/15 rounded-2xl p-3.5 mb-6">
                <Keyboard className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs opacity-75 leading-relaxed">
                  Touch-typing (klaviaturaga qaramasdan yozish) mashqlari bilan
                  muskul xotirani rivojlantiring — qaysi tilda bo'lishidan qat'i nazar!
                </p>
              </div>

              {/* Tugmalar */}
              <div className="flex flex-col gap-2.5">
                <a
                  href={STYPING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary gap-2 w-full btn-wave"
                >
                  <Rocket className="w-4 h-4" />
                  Saytga o'tish
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
                <button
                  onClick={() => setOpen(false)}
                  className="btn btn-ghost btn-sm w-full"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
