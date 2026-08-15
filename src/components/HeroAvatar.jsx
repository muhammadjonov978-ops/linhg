import { getShopItem } from '../data/shop';

// ==== QAHRAMON AVATARI (silliq) ====
// Rasmga bir-bir mos qahramon: qo'ng'ir tikanli soch, qalin qoshlar, katta qora
// ko'zoynak, krem futbolka, xaki yukxalta shim, tan bog'ichli etiklar, tuproq
// tepalik ustida. Kiyilgan narsalar (fon, bosh kiyim, kiyim, aksessuar, uy
// hayvoni) item.style bo'yicha chiziladi.

const SKIN = '#fcd7a8';
const SKIN_SHADE = '#f0b97e';
const HAIR = '#5b3a26';
const HAIR_DARK = '#42270f';
const PANTS = '#c2b280';
const PANTS_DARK = '#b3a26c';
const BOOT = '#a16207'; // tan etik
const BOOT_DARK = '#78350f';
const EYE = '#292524';

// Yulduzlar pozitsiyalari — har safar bir xil chiqishi uchun statik
const STARS = [
  [12, 18], [30, 34], [52, 12], [70, 46], [95, 22], [120, 40],
  [142, 14], [168, 30], [186, 50], [24, 58], [150, 58], [60, 64],
];

function BgLayer({ item }) {
  if (!item || item.style === 'none') return null;
  const c = item.color;
  return (
    <g>
      <rect x="0" y="0" width="200" height="270" fill={c} />
      {/* Yulduzlar */}
      {STARS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2 : 1.4} fill="#ffffff" opacity={0.45 + (i % 3) * 0.15} />
      ))}
      {item.style === 'night' && (
        <g>
          <circle cx="158" cy="72" r="34" fill="#8b5cf6" />
          <circle cx="148" cy="62" r="9" fill="#c4b5fd" opacity="0.5" />
          <ellipse cx="158" cy="72" rx="52" ry="12" fill="none" stroke="#c084fc" strokeWidth="4" opacity="0.8" transform="rotate(-18 158 72)" />
          <circle cx="120" cy="102" r="5" fill="#cbd5e1" opacity="0.6" />
          <circle cx="66" cy="118" r="3" fill="#cbd5e1" opacity="0.5" />
        </g>
      )}
      {item.style === 'galaxy' && (
        <g>
          <circle cx="40" cy="60" r="26" fill="#7c3aed" opacity="0.55" />
          <circle cx="160" cy="150" r="40" fill="#a855f7" opacity="0.35" />
          <path d="M-10 212 Q 100 162 210 202" stroke="#c084fc" strokeWidth="5" fill="none" opacity="0.5" />
          <circle cx="90" cy="40" r="3" fill="#fde047" />
          <circle cx="180" cy="30" r="2.4" fill="#fde047" />
        </g>
      )}
      {item.style === 'mars' && (
        <g>
          <circle cx="150" cy="80" r="38" fill="#f97316" />
          <circle cx="140" cy="70" r="10" fill="#fdba74" opacity="0.5" />
          <ellipse cx="150" cy="80" rx="50" ry="14" fill="none" stroke="#fb923c" strokeWidth="4" opacity="0.7" transform="rotate(-12 150 80)" />
          <circle cx="60" cy="130" r="6" fill="#cbd5e1" opacity="0.4" />
        </g>
      )}
      {item.style === 'sunset' && (
        <g>
          <circle cx="100" cy="150" r="60" fill="#f97316" opacity="0.55" />
          <circle cx="100" cy="150" r="46" fill="#fb923c" opacity="0.5" />
          <rect x="0" y="150" width="200" height="120" fill="#7c2d12" opacity="0.55" />
          <circle cx="140" cy="70" r="3" fill="#fde047" />
        </g>
      )}
    </g>
  );
}

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
          <circle cx="100" cy="30" r="3.5" fill="#8b5cf6" />
          <circle cx="112" cy="42" r="3.5" fill="#22c55e" />
        </g>
      )}
      {item.style === 'spacehat' && (
        <g>
          {/* Shisha gumbaz */}
          <ellipse cx="100" cy="36" rx="32" ry="26" fill={c} opacity="0.92" />
          <path d="M76 24 Q100 10 124 24" stroke="#fff" strokeWidth="4" fill="none" opacity="0.55" strokeLinecap="round" />
          {/* Antenna */}
          <path d="M100 14 L106 4" stroke={a} strokeWidth="3" strokeLinecap="round" />
          <circle cx="106" cy="3" r="3.4" fill="#ef4444" />
          {/* Bo'yin halqasi */}
          <rect x="64" y="48" width="72" height="11" rx="5" fill={a} />
          <rect x="60" y="57" width="80" height="7" rx="3.5" fill={c} />
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
    case 'visor':
      return (
        <g>
          <path d="M66 78 Q100 64 134 78 L134 94 Q100 108 66 94 Z" fill={c} opacity="0.85" />
          <path d="M78 86 Q100 92 122 86" stroke="#fff" strokeWidth="3" fill="none" opacity="0.5" />
          <path d="M66 80 Q100 66 134 80" stroke={a} strokeWidth="2.5" fill="none" opacity="0.6" />
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
          <rect x="90" y="146" width="20" height="13" rx="2" fill="#8b5cf6" />
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
          <circle cx="106" cy="162" r="3" fill="#8b5cf6" />
          <circle cx="100" cy="168" r="3" fill="#22c55e" />
        </g>
      );
      break;
    case 'spacesuit':
      details = (
        <g>
          <rect x="82" y="120" width="36" height="9" rx="4" fill={a} opacity="0.9" />
          <rect x="86" y="146" width="28" height="22" rx="4" fill="#cbd5e1" />
          <circle cx="94" cy="154" r="3" fill="#ef4444" />
          <circle cx="100" cy="160" r="3" fill="#8b5cf6" />
          <circle cx="106" cy="154" r="3" fill="#22c55e" />
          <rect x="72" y="168" width="56" height="7" rx="3" fill={a} />
          <circle cx="100" cy="171.5" r="2.5" fill="#8b5cf6" />
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

export default function HeroAvatar({ equipped = {}, size = 180, previewNote = null, animate = false }) {
  const bg = getShopItem(equipped.bg);
  const hat = getShopItem(equipped.hat);
  const outfit = getShopItem(equipped.outfit);
  const accessory = getShopItem(equipped.accessory);
  const pet = getShopItem(equipped.pet);

  return (
    <svg
      viewBox="0 0 200 270"
      width={size}
      height={size * 1.35}
      className={animate ? 'animate-float' : ''}
      role="img"
      aria-label="Qahramon avatari"
    >
      {/* Kosmik fon (space shop) */}
      <BgLayer item={bg} />

      {/* Tuproq tepalik */}
      <ellipse cx="100" cy="250" rx="62" ry="10" fill="#92400e" />
      <ellipse cx="100" cy="252" rx="46" ry="8" fill="#a16207" />
      <ellipse cx="66" cy="254" rx="7" ry="3.5" fill="#78350f" />
      <ellipse cx="138" cy="253" rx="5" ry="2.5" fill="#78350f" />
      {/* Oyog' ostidagi soya */}
      <ellipse cx="100" cy="243" rx="36" ry="6" fill="#78350f" opacity="0.35" />

      {/* Uy hayvoni (orqa tomonda, yonida) */}
      {pet && pet.style === 'pet' && (
        <text x="160" y="200" fontSize="42" textAnchor="middle">
          <animate attributeName="y" values="200;192;200" dur="2.6s" repeatCount="indefinite" />
          {pet.emoji}
        </text>
      )}

      {/* Etiklar (tan, bog'ichli) */}
      <rect x="64" y="216" width="30" height="18" rx="9" fill={BOOT} />
      <rect x="106" y="216" width="30" height="18" rx="9" fill={BOOT} />
      <rect x="62" y="230" width="34" height="7" rx="3" fill={BOOT_DARK} />
      <rect x="104" y="230" width="34" height="7" rx="3" fill={BOOT_DARK} />
      {/* Bog'ich */}
      <path d="M70 222 h8 M70 227 h8 M112 222 h8 M112 227 h8" stroke={BOOT_DARK} strokeWidth="1.6" opacity="0.85" strokeLinecap="round" />

      {/* Xaki yukxalta shim */}
      <rect x="70" y="180" width="24" height="42" rx="9" fill={PANTS} />
      <rect x="106" y="180" width="24" height="42" rx="9" fill={PANTS} />
      <rect x="64" y="192" width="12" height="15" rx="3" fill={PANTS_DARK} />
      <rect x="124" y="192" width="12" height="15" rx="3" fill={PANTS_DARK} />
      {/* Yong'oq cho'ntaklar */}
      <rect x="72" y="196" width="16" height="12" rx="2.5" fill={PANTS_DARK} />
      <rect x="112" y="196" width="16" height="12" rx="2.5" fill={PANTS_DARK} />
      <path d="M72 198 h16 M112 198 h16" stroke={BOOT} strokeWidth="1.4" opacity="0.5" />

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

      {/* Qalin qoshlar */}
      <path d="M78 70 Q88 63 98 70" stroke={EYE} strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <path d="M102 70 Q112 63 122 70" stroke={EYE} strokeWidth="5.5" fill="none" strokeLinecap="round" />

      {/* Yuz */}
      <circle cx="88" cy="84" r="4" fill={EYE} />
      <circle cx="112" cy="84" r="4" fill={EYE} />
      <circle cx="90.5" cy="82.5" r="1.3" fill="#fff" />
      <circle cx="114.5" cy="82.5" r="1.3" fill="#fff" />
      <path d="M92 100 Q100 108 108 100" fill="none" stroke={EYE} strokeWidth="3" strokeLinecap="round" />
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
