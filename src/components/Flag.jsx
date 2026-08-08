import { useState } from 'react';

// ===== FLAG IMAGES =====
// Windows/Telegram'da bayroq emojilari ko'rinmaydi (o'rniga "GB", "ES" kabi
// harflar chiqadi). Shu sababli emoji bayroqlarni flagcdn.com'dagi HAQIQIY
// bayroq rasmlariga aylantiramiz. Rasm yuklanmasa — emoji qaytadi.

// Emoji bayroqni ISO davlat kodiga aylantiradi:
//   🇬🇧 -> "GB"  (regional indicator symbol juftligi)
//   🏴󠁧󠁢󠁷󠁬󠁳󠁿 -> "WLS"  (Wales/Scotland/England tag ketma-ketligi)
// Boshqa (🌍, 🏛️) -> null (emoji qoladi)
export function emojiFlagToCode(flag) {
  if (!flag || typeof flag !== 'string') return null;
  const pts = Array.from(flag);
  if (pts.length === 2) {
    const a = pts[0].codePointAt(0);
    const b = pts[1].codePointAt(0);
    if (a >= 0x1F1E6 && a <= 0x1F1FF && b >= 0x1F1E6 && b <= 0x1F1FF) {
      return String.fromCharCode(a - 0x1F1E6 + 65) + String.fromCharCode(b - 0x1F1E6 + 65);
    }
  }
  // Subdivision bayroqlar (Wales, Scotland, England): 🏴 + tag harflari
  // Taglar davlat kodidan boshlanadi (gb) + bo'lim kodi (wls/sct/eng):
  //   🏴󠁧󠁢󠁷󠁬󠁳󠁿 -> "gbwls" -> "wls"
  if (pts[0]?.codePointAt(0) === 0x1F3F4) {
    let out = '';
    for (let i = 1; i < pts.length; i++) {
      const cp = pts[i].codePointAt(0);
      if (cp >= 0xE0061 && cp <= 0xE007A) out += String.fromCharCode(cp - 0xE0061 + 97);
    }
    if (out.length > 2) out = out.slice(2); // "gb" prefiksini olib tashlaymiz
    return out || null; // wls / sct / eng
  }
  return null;
}

/**
 * Haqiqiy bayroq rasmini ko'rsatadi.
 * @param {{ flag: string, name?: string }} lang — til obyekti (languages'dan)
 * @param {number} size — bayroq balandligi, px (width = size * 1.5)
 */
export default function Flag({ lang, size = 36, className = '', rounded = true }) {
  const [failed, setFailed] = useState(false);
  const code = lang ? emojiFlagToCode(lang.flag) : null;

  if (!code || failed) {
    return (
      <span
        className={`inline-flex items-center justify-center select-none ${className}`}
        style={{ width: size * 1.5, height: size, fontSize: Math.round(size * 0.62) }}
        title={lang?.name}
      >
        {lang?.flag || '🌍'}
      </span>
    );
  }

  const c = code.toLowerCase();
  return (
    <span
      className={`inline-block overflow-hidden shadow-sm ring-1 ring-black/20 bg-black/10 shrink-0 ${rounded ? 'rounded-[4px]' : ''} ${className}`}
      style={{ width: size * 1.5, height: size }}
      title={lang?.name}
    >
      <img
        src={`https://flagcdn.com/w80/${c}.png`}
        srcSet={`https://flagcdn.com/w160/${c}.png 2x`}
        alt={lang?.name || code}
        loading="lazy"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover"
      />
    </span>
  );
}
