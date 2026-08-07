import { getShopItem } from '../data/shop';

// ==== QAHRAMON AVATARI ====
// SVG'da chizilgan kichkina qahramon. Kiygan narsalar (bosh kiyim, kiyim,
// aksessuar, uy hayvoni) item.style bo'yicha qatlam-qatlam chiziladi.

const SKIN = '#fcd7a8';
const SKIN_SHADE = '#f0b97e';
const HAIR = '#5b3a26';

function HatLayer({ item }) {
  if (!item || item.style === 'none') return null;
  const c = item.color;
  const a = item.accent;
  switch (item.style) {
    case 'cap':
      return (
        <g>
          <path d="M62 48 Q62 30 78 26 Q100 22 122 26 Q138 30 138 48 L138 52 L62 52 Z" fill={c} />
          <path d="M60 52 Q62 62 74 62 L132 62 Q138 62 140 52 L138 46 Q100 56 62 46 Z" fill={a} />
        </g>
      );
    case 'beanie':
      return (
        <g>
          <path d="M64 50 Q64 26 78 22 Q100 16 122 22 Q136 26 136 50 L136 56 L64 56 Z" fill={c} />
          <rect x="62" y="54" width="76" height="10" rx="4" fill={a} />
          <circle cx="100" cy="20" r="7" fill={a} />
        </g>
      );
    case 'flower':
      return (
        <g>
          <circle cx="88" cy="34" r="9" fill={c} />
          <circle cx="112" cy="34" r="9" fill={c} />
          <circle cx="100" cy="24" r="9" fill={c} />
          <circle cx="100" cy="44" r="9" fill={c} />
          <circle cx="100" cy="34" r="6" fill={a} />
        </g>
      );
    case 'cowboy':
      return (
        <g>
          <ellipse cx="100" cy="50" rx="44" ry="10" fill={c} />
          <path d="M72 48 Q72 26 88 22 Q100 20 112 22 Q128 26 128 48 Z" fill={c} />
          <path d="M70 46 Q100 38 130 46 L130 52 Q100 44 70 52 Z" fill={a} />
        </g>
      );
    case 'grad':
      return (
        <g>
          <path d="M100 14 L128 34 L100 54 L72 34 Z" fill={c} />
          <rect x="66" y="36" width="68" height="8" rx="3" fill={c} />
          <path d="M128 34 L142 48" stroke={a} strokeWidth="3" strokeLinecap="round" />
          <circle cx="142" cy="50" r="4" fill={a} />
        </g>
      );
    case 'tophat':
      return (
        <g>
          <rect x="86" y="16" width="28" height="38" rx="2" fill={c} />
          <rect x="80" y="38" width="40" height="8" fill={a} />
          <rect x="66" y="52" width="68" height="8" rx="3" fill={c} />
        </g>
      );
    case 'viking':
      return (
        <g>
          <path d="M100 10 L78 36 L122 36 Z" fill={c} />
          <path d="M72 34 L54 22 L64 40 Z" fill={a} />
          <path d="M128 34 L146 22 L136 40 Z" fill={a} />
          <rect x="70" y="40" width="60" height="8" rx="4" fill={c} />
          <circle cx="92" cy="30" r="3" fill={a} />
          <circle cx="108" cy="30" r="3" fill={a} />
        </g>
      );
    case 'wizard':
      return (
        <g>
          <path d="M100 8 L122 46 L78 46 Z" fill={c} />
          <ellipse cx="100" cy="46" rx="30" ry="8" fill={a} />
          <path d="M92 24 L104 24 L100 14 Z" fill={a} />
          <circle cx="112" cy="32" r="3" fill="#fff" opacity="0.9" />
          <circle cx="86" cy="36" r="2" fill="#fff" opacity="0.9" />
        </g>
      );
    case 'crown':
      return (
        <g>
          <path d="M68 52 L74 24 L88 36 L100 16 L112 36 L126 24 L132 52 Z" fill={c} stroke={a} strokeWidth="2" />
          <rect x="68" y="52" width="64" height="7" rx="3" fill={a} />
          <circle cx="88" cy="42" r="3.5" fill="#ef4444" />
          <circle cx="100" cy="30" r="3.5" fill="#3b82f6" />
          <circle cx="112" cy="42" r="3.5" fill="#22c55e" />
        </g>
      );
    default:
      return null;
  }
}

function AccessoryLayer({ item }) {
  if (!item || item.style === 'none') return null;
  const c = item.color;
  const a = item.accent;
  switch (item.style) {
    case 'glasses':
      return (
        <g fill="none" stroke={c} strokeWidth="3">
          <circle cx="88" cy="78" r="11" />
          <circle cx="112" cy="78" r="11" />
          <path d="M99 78 L101 78" strokeWidth="2" />
          <path d="M77 78 L70 74" />
          <path d="M123 78 L130 74" />
        </g>
      );
    case 'sunglasses':
      return (
        <g>
          <rect x="76" y="70" width="26" height="17" rx="5" fill={c} />
          <rect x="98" y="70" width="26" height="17" rx="5" fill={c} />
          <path d="M102 78 L98 78" stroke={a} strokeWidth="2" />
          <path d="M76 76 L68 72" stroke={c} strokeWidth="3" />
          <path d="M124 76 L132 72" stroke={c} strokeWidth="3" />
        </g>
      );
    case 'bowtie':
      return (
        <g>
          <path d="M100 108 L84 100 L84 116 Z" fill={c} />
          <path d="M100 108 L116 100 L116 116 Z" fill={c} />
          <circle cx="100" cy="108" r="4.5" fill={a} />
        </g>
      );
    case 'scarf':
      return (
        <g>
          <path d="M74 100 Q100 112 126 100 L128 108 Q100 120 72 108 Z" fill={c} />
          <path d="M112 112 L108 140 L116 140 Z" fill={a} />
          <path d="M120 112 L118 138 L126 138 Z" fill={c} />
        </g>
      );
    case 'mask':
      return (
        <g>
          <path d="M70 68 Q100 56 130 68 L130 86 Q100 98 70 86 Z" fill={c} />
          <path d="M84 76 Q100 82 116 76 Q100 88 84 76 Z" fill={a} />
        </g>
      );
    case 'headphones':
      return (
        <g>
          <path d="M66 56 Q66 36 84 30 Q100 26 116 30 Q134 36 134 56" fill="none" stroke={c} strokeWidth="9" strokeLinecap="round" />
          <rect x="58" y="54" width="16" height="26" rx="7" fill={c} />
          <rect x="126" y="54" width="16" height="26" rx="7" fill={c} />
          <rect x="61" y="72" width="10" height="8" rx="3" fill={a} />
          <rect x="129" y="72" width="10" height="8" rx="3" fill={a} />
        </g>
      );
    case 'chain':
      return (
        <g>
          <path d="M80 106 Q100 118 120 106" fill="none" stroke={c} strokeWidth="4" />
          <circle cx="100" cy="118" r="8" fill={a} />
          <circle cx="100" cy="118" r="4" fill={c} />
        </g>
      );
    case 'halo':
      return (
        <g>
          <ellipse cx="100" cy="18" rx="22" ry="7" fill="none" stroke={c} strokeWidth="4" />
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
  // Tanasi (torso)
  const body = <path d="M64 128 Q64 120 72 118 L88 114 Q100 112 112 114 L128 118 Q136 120 136 128 L136 196 Q136 208 124 208 L76 208 Q64 208 64 196 Z" fill={c} />;

  switch (item.style) {
    case 'tshirt':
      return (
        <g>
          {body}
          <path d="M92 116 L100 128 L108 116" fill="none" stroke={a} strokeWidth="3" />
        </g>
      );
    case 'sweater':
      return (
        <g>
          {body}
          <rect x="64" y="138" width="72" height="5" fill={a} opacity="0.85" />
          <rect x="64" y="152" width="72" height="5" fill={a} opacity="0.85" />
          <rect x="64" y="166" width="72" height="5" fill={a} opacity="0.85" />
          <rect x="88" y="112" width="24" height="8" rx="3" fill={a} />
        </g>
      );
    case 'hoodie':
      return (
        <g>
          {body}
          <path d="M70 118 Q100 96 130 118 L130 126 Q100 106 70 126 Z" fill={a} />
          <path d="M94 126 L92 152 M106 126 L108 152" stroke={a} strokeWidth="2.5" strokeLinecap="round" />
          <rect x="82" y="162" width="36" height="20" rx="6" fill={a} />
        </g>
      );
    case 'lab':
      return (
        <g>
          {body}
          <path d="M92 116 L100 132 L108 116" fill="none" stroke={a} strokeWidth="3" />
          <rect x="86" y="150" width="28" height="18" rx="3" fill={a} opacity="0.6" />
        </g>
      );
    case 'kimono':
      return (
        <g>
          {body}
          <path d="M94 116 L100 132 L106 116 L100 110 Z" fill={a} />
          <rect x="64" y="146" width="72" height="10" rx="4" fill={a} />
          <path d="M64 156 L74 170 M136 156 L126 170" stroke={a} strokeWidth="4" />
        </g>
      );
    case 'pirate':
      return (
        <g>
          {body}
          <rect x="64" y="146" width="72" height="9" fill="#1c1917" />
          <rect x="90" y="144" width="20" height="13" rx="2" fill="#facc15" />
          <circle cx="100" cy="150" r="3" fill="#1c1917" />
          <circle cx="96" cy="150" r="3" fill="#1c1917" />
          <circle cx="104" cy="150" r="3" fill="#1c1917" />
          <path d="M70 176 Q86 168 100 176 Q114 168 130 176" fill="none" stroke={a} strokeWidth="2.5" />
        </g>
      );
    case 'suit':
      return (
        <g>
          {body}
          <path d="M92 116 L100 134 L108 116 L116 128 L108 132 L100 128 L92 132 L84 128 Z" fill={a} />
          <path d="M100 128 L98 156 L102 156 Z" fill="#dc2626" />
        </g>
      );
    case 'astronaut':
      return (
        <g>
          {body}
          <rect x="80" y="122" width="40" height="10" rx="4" fill={a} opacity="0.85" />
          <rect x="86" y="150" width="28" height="22" rx="4" fill="#cbd5e1" />
          <circle cx="94" cy="158" r="3" fill="#ef4444" />
          <circle cx="106" cy="164" r="3" fill="#3b82f6" />
          <circle cx="100" cy="170" r="3" fill="#22c55e" />
        </g>
      );
    case 'superhero':
      return (
        <g>
          <path d="M70 126 Q46 150 50 200 L68 200 Q62 160 78 136 Z" fill={a} opacity="0.9" />
          <path d="M130 126 Q154 150 150 200 L132 200 Q138 160 122 136 Z" fill={a} opacity="0.9" />
          {body}
          <circle cx="100" cy="152" r="15" fill={a} />
          <path d="M100 141 L108 153 L101 153 L105 163 L92 151 L99 151 Z" fill={c} />
        </g>
      );
    case 'armor':
      return (
        <g>
          {body}
          <path d="M80 120 L88 118 L88 208 L80 206 Z" fill={a} opacity="0.7" />
          <path d="M120 120 L112 118 L112 208 L120 206 Z" fill={a} opacity="0.7" />
          <rect x="64" y="160" width="72" height="8" rx="3" fill={a} />
          <circle cx="100" cy="150" r="8" fill={a} />
          <circle cx="100" cy="150" r="4" fill={c} />
        </g>
      );
    default:
      return body;
  }
}

export default function HeroAvatar({ equipped = {}, size = 180, previewNote = null, animate = false }) {
  const hat = getShopItem(equipped.hat);
  const outfit = getShopItem(equipped.outfit);
  const accessory = getShopItem(equipped.accessory);
  const pet = getShopItem(equipped.pet);

  return (
    <svg
      viewBox="0 0 200 230"
      width={size}
      height={size * 1.15}
      className={animate ? 'animate-float' : ''}
      role="img"
      aria-label="Qahramon avatari"
    >
      {/* Soya */}
      <ellipse cx="100" cy="212" rx="48" ry="7" fill="#000" opacity="0.12" />

      {/* Uy hayvoni (orqa tomonda, yonida) */}
      {pet && pet.style === 'pet' && (
        <text x="158" y="186" fontSize="42" textAnchor="middle">
          {pet.emoji}
        </text>
      )}

      {/* Tana */}
      <OutfitLayer item={outfit} />

      {/* Bo'yin */}
      <rect x="92" y="108" width="16" height="14" rx="4" fill={SKIN_SHADE} />

      {/* Bosh */}
      <circle cx="100" cy="78" r="38" fill={SKIN} />
      {/* Quloqlar */}
      <circle cx="63" cy="80" r="8" fill={SKIN} />
      <circle cx="137" cy="80" r="8" fill={SKIN} />

      {/* Soch */}
      <path d="M64 72 Q64 44 84 40 Q100 36 116 40 Q136 44 136 72 L136 66 Q136 40 116 34 Q100 30 84 34 Q64 40 64 66 Z" fill={HAIR} />

      {/* Yuz */}
      <circle cx="88" cy="78" r="4" fill="#292524" />
      <circle cx="112" cy="78" r="4" fill="#292524" />
      <circle cx="90.5" cy="76.5" r="1.3" fill="#fff" />
      <circle cx="114.5" cy="76.5" r="1.3" fill="#fff" />
      <path d="M92 94 Q100 102 108 94" fill="none" stroke="#292524" strokeWidth="3" strokeLinecap="round" />
      {/* Yonoqlar */}
      <ellipse cx="76" cy="90" rx="6" ry="4" fill="#f8a5c2" opacity="0.55" />
      <ellipse cx="124" cy="90" rx="6" ry="4" fill="#f8a5c2" opacity="0.55" />

      {/* Aksessuar */}
      <AccessoryLayer item={accessory} />

      {/* Bosh kiyim */}
      <HatLayer item={hat} />

      {previewNote && (
        <g>
          <rect x="40" y="196" width="120" height="20" rx="10" fill="#0f172a" opacity="0.85" />
          <text x="100" y="209" fontSize="11" textAnchor="middle" fill="#fde047" fontWeight="bold">
            {previewNote}
          </text>
        </g>
      )}
    </svg>
  );
}
