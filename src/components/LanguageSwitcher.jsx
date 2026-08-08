// ==== TIL ALMASHTIRGICH (UZ / RU / ENG) ====
// Saytni boshqa tilga o'giradigan panel — Navbar'da joylashadi.
import { useI18n } from '../i18n';

export default function LanguageSwitcher({ size = 'md' }) {
  const { lang, setLang, langs } = useI18n();

  const sizeCls = size === 'sm' ? 'h-7 text-[10px] px-2' : 'h-8 text-xs px-2.5';

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full border border-base-300/70 bg-base-100/80 p-0.5 shadow-sm backdrop-blur-sm`}
      role="group"
      aria-label="Tilni tanlash / Language"
    >
      {langs.map((l) => {
        const active = lang === l.id;
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => setLang(l.id)}
            title={l.name}
            aria-pressed={active}
            className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wide transition-all duration-200 ${sizeCls} ${
              active
                ? 'bg-gradient-to-r from-[#facc15] to-[#f59e0b] text-black shadow-md shadow-[#facc15]/25 scale-105'
                : 'text-base-content/60 hover:text-base-content hover:bg-base-200/70'
            }`}
          >
            <span className="text-sm leading-none">{l.flag}</span>
            <span className={size === 'sm' ? 'hidden sm:inline' : ''}>{l.label}</span>
          </button>
        );
      })}
    </div>
  );
}
