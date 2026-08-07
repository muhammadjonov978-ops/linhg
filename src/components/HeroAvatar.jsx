import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { getShopItem } from '../data/shop';

// ==== QAHRAMON AVATARI (pixel-art) ====
// SVG chizma avval quriladi, keyin PAST RUXSATDAGI kichik canvas'ga tushirilib,
// cheklangan palitra bo'yicha kvantizatsiya qilinadi. Natija — retro "piksel"
// ko'rinishdagi qahramon: AI'ga o'xshamaydigan, chinakam o'yin uslubidagi avatar.

const SKIN = '#fcd7a8';
const SKIN_SHADE = '#f0b97e';
const HAIR = '#5b3a26';
const HAIR_DARK = '#42270f';
const PANTS = '#c2b280';
const PANTS_DARK = '#b3a26c';
const BOOT = '#33241a';
const BOOT_DARK = '#241811';

function HatLayer({ item }) {
  if (!item || item.style === 'none') return null;
  const c = item.color;
  const a = item.accent;
  // Bosh tepasi y=44 — eski geometriyaga nisbatan +4 pastga
  return (
    <g transform="translate(0,4)">
      {item.style === 'cap' && (
        <g>
          <path d="M62 48 Q62 30 78 26 Q100 22 122 26 Q138 30 138 48 L138 52 L62 52 Z" fill={c} />
          <path d="M60 52 Q62 62 74 62 L132 62 Q138 62 140 52 L138 46 Q100 56 62 46 Z" fill={a} />
        </g>
      )}
      {item.style === 'beanie' && (
        <g>
          <path d="M64 50 Q64 26 78 22 Q100 16 122 22 Q136 26 136 50 L136 56 L64 56 Z" fill={c} />
          <rect x="62" y="54" width="76" height="10" rx="4" fill={a} />
          <circle cx="100" cy="20" r="7" fill={a} />
        </g>
      )}
      {item.style === 'flower' && (
        <g>
          <circle cx="88" cy="34" r="9" fill={c} />
          <circle cx="112" cy="34" r="9" fill={c} />
          <circle cx="100" cy="24" r="9" fill={c} />
          <circle cx="100" cy="44" r="9" fill={c} />
          <circle cx="100" cy="34" r="6" fill={a} />
        </g>
      )}
      {item.style === 'cowboy' && (
        <g>
          <ellipse cx="100" cy="50" rx="44" ry="10" fill={c} />
          <path d="M72 48 Q72 26 88 22 Q100 20 112 22 Q128 26 128 48 Z" fill={c} />
          <path d="M70 46 Q100 38 130 46 L130 52 Q100 44 70 52 Z" fill={a} />
        </g>
      )}
      {item.style === 'grad' && (
        <g>
          <path d="M100 14 L128 34 L100 54 L72 34 Z" fill={c} />
          <rect x="66" y="36" width="68" height="8" rx="3" fill={c} />
          <path d="M128 34 L142 48" stroke={a} strokeWidth="3" strokeLinecap="round" />
          <circle cx="142" cy="50" r="4" fill={a} />
        </g>
      )}
      {item.style === 'tophat' && (
        <g>
          <rect x="86" y="16" width="28" height="38" rx="2" fill={c} />
          <rect x="80" y="38" width="40" height="8" fill={a} />
          <rect x="66" y="52" width="68" height="8" rx="3" fill={c} />
        </g>
      )}
      {item.style === 'viking' && (
        <g>
          <path d="M100 10 L78 36 L122 36 Z" fill={c} />
          <path d="M72 34 L54 22 L64 40 Z" fill={a} />
          <path d="M128 34 L146 22 L136 40 Z" fill={a} />
          <rect x="70" y="40" width="60" height="8" rx="4" fill={c} />
          <circle cx="92" cy="30" r="3" fill={a} />
          <circle cx="108" cy="30" r="3" fill={a} />
        </g>
      )}
      {item.style === 'wizard' && (
        <g>
          <path d="M100 8 L122 46 L78 46 Z" fill={c} />
          <ellipse cx="100" cy="46" rx="30" ry="8" fill={a} />
          <path d="M92 24 L104 24 L100 14 Z" fill={a} />
          <circle cx="112" cy="32" r="3" fill="#fff" opacity="0.9" />
          <circle cx="86" cy="36" r="2" fill="#fff" opacity="0.9" />
        </g>
      )}
      {item.style === 'crown' && (
        <g>
          <path d="M68 52 L74 24 L88 36 L100 16 L112 36 L126 24 L132 52 Z" fill={c} stroke={a} strokeWidth="2" />
          <rect x="68" y="52" width="64" height="7" rx="3" fill={a} />
          <circle cx="88" cy="42" r="3.5" fill="#ef4444" />
          <circle cx="100" cy="30" r="3.5" fill="#3b82f6" />
          <circle cx="112" cy="42" r="3.5" fill="#22c55e" />
        </g>
      )}
    </g>
  );
}

function AccessoryLayer({ item }) {
  if (!item || item.style === 'none') return null;
  const c = item.color;
  const a = item.accent;
  switch (item.style) {
    case 'glasses':
      return (
        <g fill="none" stroke={c} strokeWidth="3">
          <circle cx="88" cy="84" r="10" />
          <circle cx="112" cy="84" r="10" />
          <path d="M98 84 L102 84" strokeWidth="2" />
          <path d="M78 84 L68 80" />
          <path d="M122 84 L132 80" />
        </g>
      );
    case 'sunglasses':
      return (
        <g>
          <rect x="74" y="74" width="24" height="17" rx="6" fill={c} />
          <rect x="102" y="74" width="24" height="17" rx="6" fill={c} />
          <rect x="78" y="78" width="8" height="4" rx="2" fill="#fff" opacity="0.35" />
          <rect x="106" y="78" width="8" height="4" rx="2" fill="#fff" opacity="0.35" />
          <path d="M98 82 L102 82" stroke={a} strokeWidth="2.5" />
          <path d="M74 80 L66 76" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M126 80 L134 76" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        </g>
      );
    case 'bowtie':
      return (
        <g>
          <path d="M100 116 L82 108 L82 124 Z" fill={c} />
          <path d="M100 116 L118 108 L118 124 Z" fill={c} />
          <circle cx="100" cy="116" r="5" fill={a} />
        </g>
      );
    case 'scarf':
      return (
        <g>
          <path d="M74 108 Q100 120 126 108 L128 116 Q100 128 72 116 Z" fill={c} />
          <path d="M114 120 L110 148 L118 148 Z" fill={a} />
          <path d="M122 120 L120 146 L128 146 Z" fill={c} />
        </g>
      );
    case 'mask':
      return (
        <g>
          <path d="M72 76 Q100 64 128 76 L128 92 Q100 104 72 92 Z" fill={c} />
          <path d="M86 84 Q100 90 114 84 Q100 96 86 84 Z" fill={a} />
        </g>
      );
    case 'headphones':
      return (
        <g>
          <path d="M60 64 Q60 42 80 36 Q100 32 120 36 Q140 42 140 64" fill="none" stroke={c} strokeWidth="9" strokeLinecap="round" />
          <rect x="52" y="62" width="16" height="28" rx="8" fill={c} />
          <rect x="132" y="62" width="16" height="28" rx="8" fill={c} />
          <rect x="55" y="80" width="10" height="9" rx="3" fill={a} />
          <rect x="135" y="80" width="10" height="9" rx="3" fill={a} />
        </g>
      );
    case 'chain':
      return (
        <g>
          <path d="M82 114 Q100 126 118 114" fill="none" stroke={c} strokeWidth="4" />
          <circle cx="100" cy="126" r="8" fill={a} />
          <circle cx="100" cy="126" r="4" fill={c} />
        </g>
      );
    case 'halo':
      return (
        <g>
          <ellipse cx="100" cy="16" rx="22" ry="7" fill="none" stroke={c} strokeWidth="4" />
        </g>
      );
    default:
      return null;
  }
}

function OutfitLayer({ item }) {
  if (!item) return null;
  const c = item.color;
  const a = item.accent;

  // Ko'ylak (torso) — och rangli futbolka uslubida
  const body = (
    <path
      d="M72 132 Q72 122 84 118 L116 118 Q128 122 128 132 L128 184 Q128 192 120 192 L80 192 Q72 192 72 184 Z"
      fill={c}
    />
  );

  // Qo'llar (sleeve + qo'l)
  const arms = (
    <g>
      <rect x="58" y="124" width="20" height="34" rx="10" fill={c} />
      <rect x="122" y="124" width="20" height="34" rx="10" fill={c} />
      <circle cx="66" cy="162" r="7" fill={SKIN} />
      <circle cx="134" cy="162" r="7" fill={SKIN} />
    </g>
  );

  let details = null;
  switch (item.style) {
    case 'tshirt':
      details = <path d="M92 118 L100 132 L108 118" fill="none" stroke={a} strokeWidth="3" strokeLinecap="round" />;
      break;
    case 'sweater':
      details = (
        <g>
          <rect x="72" y="134" width="56" height="5" fill={a} opacity="0.85" />
          <rect x="72" y="148" width="56" height="5" fill={a} opacity="0.85" />
          <rect x="72" y="162" width="56" height="5" fill={a} opacity="0.85" />
          <rect x="72" y="176" width="56" height="5" fill={a} opacity="0.85" />
          <rect x="90" y="114" width="20" height="8" rx="3" fill={a} />
        </g>
      );
      break;
    case 'hoodie':
      details = (
        <g>
          <path d="M72 120 Q100 96 128 120 L128 128 Q100 108 72 128 Z" fill={a} />
          <path d="M94 130 L92 154 M106 130 L108 154" stroke={a} strokeWidth="2.5" strokeLinecap="round" />
          <rect x="84" y="158" width="32" height="20" rx="6" fill={a} />
        </g>
      );
      break;
    case 'lab':
      details = (
        <g>
          <path d="M92 118 L100 132 L108 118" fill="none" stroke={a} strokeWidth="3" strokeLinecap="round" />
          <rect x="88" y="148" width="24" height="18" rx="3" fill={a} opacity="0.6" />
        </g>
      );
      break;
    case 'kimono':
      details = (
        <g>
          <path d="M94 118 L100 132 L106 118 L100 112 Z" fill={a} />
          <rect x="72" y="146" width="56" height="10" rx="4" fill={a} />
          <path d="M72 156 L82 170 M128 156 L118 170" stroke={a} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
      break;
    case 'pirate':
      details = (
        <g>
          <rect x="72" y="148" width="56" height="9" fill="#1c1917" />
          <rect x="90" y="146" width="20" height="13" rx="2" fill="#facc15" />
          <circle cx="100" cy="152" r="3" fill="#1c1917" />
          <circle cx="96" cy="152" r="3" fill="#1c1917" />
          <circle cx="104" cy="152" r="3" fill="#1c1917" />
          <path d="M72 176 Q86 168 100 176 Q114 168 128 176" fill="none" stroke={a} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
      break;
    case 'suit':
      details = (
        <g>
          <path d="M92 118 L100 134 L108 118 L116 128 L108 132 L100 128 L92 132 L84 128 Z" fill={a} />
          <path d="M100 128 L98 154 L102 154 Z" fill="#dc2626" />
        </g>
      );
      break;
    case 'astronaut':
      details = (
        <g>
          <rect x="80" y="124" width="40" height="10" rx="4" fill={a} opacity="0.85" />
          <rect x="86" y="148" width="28" height="22" rx="4" fill="#cbd5e1" />
          <circle cx="94" cy="156" r="3" fill="#ef4444" />
          <circle cx="106" cy="162" r="3" fill="#3b82f6" />
          <circle cx="100" cy="168" r="3" fill="#22c55e" />
        </g>
      );
      break;
    case 'superhero':
      details = (
        <g>
          <circle cx="100" cy="152" r="14" fill={a} />
          <path d="M100 142 L107 152 L101 152 L104 161 L93 150 L99 150 Z" fill={c} />
        </g>
      );
      break;
    case 'armor':
      details = (
        <g>
          <path d="M80 122 L88 120 L88 190 L80 188 Z" fill={a} opacity="0.7" />
          <path d="M120 122 L112 120 L112 190 L120 188 Z" fill={a} opacity="0.7" />
          <rect x="72" y="158" width="56" height="8" rx="3" fill={a} />
          <circle cx="100" cy="148" r="8" fill={a} />
          <circle cx="100" cy="148" r="4" fill={c} />
        </g>
      );
      break;
    default:
      break;
  }

  return (
    <g>
      {/* Plash (superqahramon) — tana orqasida */}
      {item.style === 'superhero' && (
        <path
          d="M74 128 Q50 150 54 200 L70 200 Q64 162 80 138 Z M126 128 Q150 150 146 200 L130 200 Q136 162 120 138 Z"
          fill={a}
          opacity="0.9"
        />
      )}
      {arms}
      {body}
      {details}
    </g>
  );
}

// ============ SVG qatlami (pixel'ga aylantirishdan oldingi chizma) ============
function HeroAvatarSvg({ equipped = {}, previewNote = null }) {
  const hat = getShopItem(equipped.hat);
  const outfit = getShopItem(equipped.outfit);
  const accessory = getShopItem(equipped.accessory);
  const pet = getShopItem(equipped.pet);

  return (
    <svg viewBox="0 0 200 270" width="200" height="270" role="img" aria-label="Qahramon avatari">
      {/* Tuproq tepalik */}
      <ellipse cx="100" cy="250" rx="62" ry="10" fill="#92400e" />
      <ellipse cx="100" cy="252" rx="46" ry="8" fill="#a16207" />
      <ellipse cx="66" cy="254" rx="7" ry="3.5" fill="#78350f" />
      <ellipse cx="138" cy="253" rx="5" ry="2.5" fill="#78350f" />

      {/* Uy hayvoni (orqa tomonda, yonida) */}
      {pet && pet.style === 'pet' && (
        <text x="160" y="200" fontSize="42" textAnchor="middle">
          {pet.emoji}
        </text>
      )}

      {/* Etiklar */}
      <rect x="64" y="216" width="30" height="18" rx="9" fill={BOOT} />
      <rect x="106" y="216" width="30" height="18" rx="9" fill={BOOT} />
      <rect x="62" y="230" width="34" height="7" rx="3" fill={BOOT_DARK} />
      <rect x="104" y="230" width="34" height="7" rx="3" fill={BOOT_DARK} />

      {/* Xaki shim */}
      <rect x="70" y="180" width="24" height="42" rx="9" fill={PANTS} />
      <rect x="106" y="180" width="24" height="42" rx="9" fill={PANTS} />
      <rect x="64" y="192" width="12" height="15" rx="3" fill={PANTS_DARK} />
      <rect x="124" y="192" width="12" height="15" rx="3" fill={PANTS_DARK} />
      <path d="M64 196 L76 196 M124 196 L136 196" stroke={BOOT} strokeWidth="1.5" opacity="0.5" />

      {/* Tana (ko'ylak) */}
      <OutfitLayer item={outfit} />

      {/* Bo'yin */}
      <rect x="94" y="112" width="12" height="14" rx="4" fill={SKIN_SHADE} />

      {/* Bosh */}
      <circle cx="100" cy="84" r="40" fill={SKIN} />
      {/* Quloqlar */}
      <circle cx="60" cy="86" r="8" fill={SKIN} />
      <circle cx="140" cy="86" r="8" fill={SKIN} />

      {/* Tikansimon soch */}
      <path
        d="M63 68 L58 50 L70 58 L76 40 L86 54 L94 36 L100 50 L106 36 L114 54 L124 40 L130 58 L142 50 L137 68 Q136 74 130 76 L70 76 Q64 74 63 68 Z"
        fill={HAIR}
      />
      <path d="M76 40 L82 52 L88 44 L94 36 L100 50 L106 36 L112 46 L118 40 L124 40 L130 58 L124 44 L118 52 L114 44 L106 48 L100 42 L94 48 L88 44 L84 52 L76 40 Z" fill={HAIR_DARK} opacity="0.55" />

      {/* Yuz */}
      <circle cx="88" cy="84" r="4" fill="#292524" />
      <circle cx="112" cy="84" r="4" fill="#292524" />
      <circle cx="90.5" cy="82.5" r="1.3" fill="#fff" />
      <circle cx="114.5" cy="82.5" r="1.3" fill="#fff" />
      <path d="M92 100 Q100 108 108 100" fill="none" stroke="#292524" strokeWidth="3" strokeLinecap="round" />
      {/* Yonoqlar */}
      <ellipse cx="76" cy="96" rx="6" ry="4" fill="#f8a5c2" opacity="0.5" />
      <ellipse cx="124" cy="96" rx="6" ry="4" fill="#f8a5c2" opacity="0.5" />

      {/* Aksessuar */}
      <AccessoryLayer item={accessory} />

      {/* Bosh kiyim */}
      <HatLayer item={hat} />

      {previewNote && (
        <g>
          <rect x="40" y="250" width="120" height="18" rx="9" fill="#0f172a" opacity="0.85" />
          <text x="100" y="262" fontSize="11" textAnchor="middle" fill="#fde047" fontWeight="bold">
            {previewNote}
          </text>
        </g>
      )}
    </svg>
  );
}

// ============ PIXEL-ART YAKUNI ============
// Cheklangan ranglar palitrasi — "retro o'yin" ko'rinishi uchun.
const PIXEL_PALETTE = [
  // oq / kulranglar
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b',
  '#475569', '#334155', '#1e293b', '#0f172a', '#111827', '#1c1917',
  // teri / yuz
  '#fcd7a8', '#f0b97e', '#f8a5c2',
  // soch / etik
  '#5b3a26', '#42270f', '#292524', '#33241a', '#241811',
  // jigarranglar (shim, tuproq)
  '#c2b280', '#b3a26c', '#a16207', '#92400e', '#78350f', '#b45309', '#d97706',
  // qizil / to'q qizil
  '#f87171', '#ef4444', '#dc2626', '#991b1b',
  // sariq / amber
  '#fde047', '#facc15', '#fbbf24', '#f59e0b',
  // ko'k / havo rang
  '#60a5fa', '#38bdf8', '#3b82f6', '#0ea5e9',
  // yashil
  '#a7f3d0', '#22c55e', '#10b981', '#16a34a', '#14532d',
  // pushti / binafsha
  '#fbcfe8', '#f472b6', '#ec4899', '#c084fc', '#a78bfa', '#8b5cf6', '#7c3aed', '#4c1d95',
  // olovrang
  '#f97316', '#ea580c',
];

const PALETTE_RGB = PIXEL_PALETTE.map((hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
]);

function quantize(data) {
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 128) {
      data[i + 3] = 0; // shaffof piksel — tozalab tashlaymiz
      continue;
    }
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    let best = 0;
    let bestDist = Infinity;
    for (let p = 0; p < PALETTE_RGB.length; p++) {
      const dr = PALETTE_RGB[p][0] - r;
      const dg = PALETTE_RGB[p][1] - g;
      const db = PALETTE_RGB[p][2] - b;
      const dist = dr * dr + dg * dg + db * db;
      if (dist < bestDist) {
        bestDist = dist;
        best = p;
      }
    }
    data[i] = PALETTE_RGB[best][0];
    data[i + 1] = PALETTE_RGB[best][1];
    data[i + 2] = PALETTE_RGB[best][2];
    data[i + 3] = 255;
  }
}

// Past ruxsatli "piksel" o'lchami (200x270 SVG => 44x59 blok)
const PX_W = 44;
const PX_H = 59;

export default function HeroAvatar({ equipped = {}, size = 180, previewNote = null, animate = false }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  // equipped ob'ekti har renderda yangi bo'lishi mumkin (ShopPage preview) —
  // shuning uchun faqat MAZMUNI (equippedKey) o'zgarganida pipeline qayta ishga tushadi.
  const equippedKey = JSON.stringify(equipped || {});
  const equippedRef = useRef(equipped);
  const noteRef = useRef(previewNote);

  useEffect(() => {
    let cancelled = false;

    // Ref'larni effect ichida yangilaymiz (render paytida emas)
    equippedRef.current = equipped;
    noteRef.current = previewNote;

    // 1) SVG'ni ajratilgan (detached) container'ga chizib, serializatsiya qilamiz
    //    react-dom/server emas — createRoot + flushSync (bundle kichik qoladi).
    const container = document.createElement('div');
    const root = createRoot(container);
    let svg = '';
    try {
      flushSync(() => {
        root.render(<HeroAvatarSvg equipped={equippedRef.current} previewNote={noteRef.current} />);
      });
      svg = container.innerHTML;
    } finally {
      root.unmount();
    }
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 2) Past ruxsatga tushiramiz (nearest-neighbor => blokli ko'rinish)
      ctx.clearRect(0, 0, PX_W, PX_H);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, PX_W, PX_H);

      // 3) Ranglarni cheklangan palitra bo'yicha kvantizatsiya qilamiz
      try {
        const imageData = ctx.getImageData(0, 0, PX_W, PX_H);
        quantize(imageData.data);
        ctx.putImageData(imageData, 0, 0);
      } catch {
        /* CORS/kattalik cheklovi bo'lsa — kvantizatsiyasiz qoldiramiz */
      }

      setReady(true);
    };
    // Xavfsizlik to'ri: SVG yuklanmasa ham avatar ko'rinmas bo'lib qolmaydi
    img.onerror = () => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, PX_W, PX_H);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, PX_W, PX_H);
      ctx.font = `${Math.floor(PX_H * 0.55)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🦸', PX_W / 2, PX_H / 2 + 1);
      setReady(true);
    };
    img.src = url;

    return () => {
      cancelled = true;
    };
    // oxlint: ataylab ref'lar orqali o'qiladi — equipped/previewNote prop'lari
    // ob'ekt referensiyasi har renderda o'zgarsa ham pipeline faqat mazmuni
    // o'zgarganida ishga tushishi kerak.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [equippedKey, previewNote]);

  return (
    <canvas
      ref={canvasRef}
      width={PX_W}
      height={PX_H}
      className={`pixel-hero transition-opacity duration-300 ${animate ? 'animate-float' : ''} ${ready ? 'opacity-100' : 'opacity-0'}`}
      style={{ width: size, height: Math.round(size * 1.35), imageRendering: 'pixelated' }}
      role="img"
      aria-label="Qahramon avatari (pixel-art)"
    />
  );
}
