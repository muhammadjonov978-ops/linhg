// ==== QAHRAMON MAGAZINI ====
// Hero uchun kiyimlar, aksessuarlar va uy hayvonlari — barchasi tanga (coin) bilan xarid qilinadi.
//
// Rarity: 'oddiy' | 'nodir' | 'afsonaviy'
// style: HeroAvatar komponentida shu style bo'yicha SVG chiziladi.

export const SHOP_CATEGORIES = [
  { id: 'hat', name: 'Bosh kiyimlar', icon: '🧢' },
  { id: 'outfit', name: 'Kiyimlar', icon: '👕' },
  { id: 'accessory', name: 'Aksessuarlar', icon: '🕶️' },
  { id: 'pet', name: 'Uy hayvonlari', icon: '🐾' },
];

export const RARITY_META = {
  oddiy: { name: 'Oddiy', badge: 'badge-ghost', ring: '', glow: '' },
  nodir: { name: 'Nodir', badge: 'badge-info', ring: 'ring-sky-400/40', glow: 'shadow-sky-500/20' },
  afsonaviy: { name: 'Afsonaviy', badge: 'badge-warning', ring: 'ring-amber-400/50', glow: 'shadow-amber-500/30' },
};

// ===================== BOSH KIYIMLAR =====================
const hats = [
  { id: 'hat_none', name: 'Bosh kiyimsiz', style: 'none', price: 0, rarity: 'oddiy', emoji: '🙂', color: '#64748b', accent: '#475569' },
  { id: 'hat_cap', name: 'Kepka', style: 'cap', price: 150, rarity: 'oddiy', emoji: '🧢', color: '#ef4444', accent: '#dc2626' },
  { id: 'hat_beanie', name: 'Shapka', style: 'beanie', price: 120, rarity: 'oddiy', emoji: '🧶', color: '#3b82f6', accent: '#facc15' },
  { id: 'hat_flower', name: 'Gul toji', style: 'flower', price: 180, rarity: 'oddiy', emoji: '🌸', color: '#ec4899', accent: '#fde047' },
  { id: 'hat_cowboy', name: "Kovboy shlyapasi", style: 'cowboy', price: 400, rarity: 'nodir', emoji: '🤠', color: '#92400e', accent: '#d97706' },
  { id: 'hat_grad', name: 'Bitiruv shlyapasi', style: 'grad', price: 500, rarity: 'nodir', emoji: '🎓', color: '#1e293b', accent: '#facc15' },
  { id: 'hat_tophat', name: 'Tsilindr', style: 'tophat', price: 350, rarity: 'nodir', emoji: '🎩', color: '#111827', accent: '#dc2626' },
  { id: 'hat_viking', name: "Viking dubulg'asi", style: 'viking', price: 700, rarity: 'nodir', emoji: '⛑️', color: '#94a3b8', accent: '#facc15' },
  { id: 'hat_wizard', name: 'Sehrgar shlyapasi', style: 'wizard', price: 1200, rarity: 'afsonaviy', emoji: '🧙', color: '#7c3aed', accent: '#c084fc' },
  { id: 'hat_crown', name: 'Oltin toj', style: 'crown', price: 2000, rarity: 'afsonaviy', emoji: '👑', color: '#fbbf24', accent: '#f59e0b' },
];

// ===================== KIYIMLAR =====================
const outfits = [
  { id: 'outfit_tshirt', name: 'Ko\'k futbolka', style: 'tshirt', price: 0, rarity: 'oddiy', emoji: '👕', color: '#38bdf8', accent: '#0ea5e9' },
  { id: 'outfit_sweater', name: 'Chiziqli sviter', style: 'sweater', price: 200, rarity: 'oddiy', emoji: '🧶', color: '#10b981', accent: '#a7f3d0' },
  { id: 'outfit_hoodie', name: 'Hudi', style: 'hoodie', price: 250, rarity: 'oddiy', emoji: '🧥', color: '#6b7280', accent: '#9ca3af' },
  { id: 'outfit_lab', name: 'Oq xalat', style: 'lab', price: 350, rarity: 'nodir', emoji: '🥼', color: '#f8fafc', accent: '#cbd5e1' },
  { id: 'outfit_kimono', name: 'Kimono', style: 'kimono', price: 600, rarity: 'nodir', emoji: '👘', color: '#ec4899', accent: '#fbcfe8' },
  { id: 'outfit_pirate', name: "Qaroqchi libosi", style: 'pirate', price: 650, rarity: 'nodir', emoji: '🏴‍☠️', color: '#78350f', accent: '#facc15' },
  { id: 'outfit_suit', name: 'Kostyum', style: 'suit', price: 800, rarity: 'nodir', emoji: '🤵', color: '#1e293b', accent: '#f8fafc' },
  { id: 'outfit_astronaut', name: 'Astronavt kostyumi', style: 'astronaut', price: 1000, rarity: 'afsonaviy', emoji: '🧑‍🚀', color: '#e2e8f0', accent: '#ef4444' },
  { id: 'outfit_superhero', name: 'Superqahramon libosi', style: 'superhero', price: 1500, rarity: 'afsonaviy', emoji: '🦸', color: '#ef4444', accent: '#facc15' },
  { id: 'outfit_armor', name: 'Rytsar zirhi', style: 'armor', price: 1800, rarity: 'afsonaviy', emoji: '🛡️', color: '#e2e8f0', accent: '#fbbf24' },
];

// ===================== AKSESSUARLAR =====================
const accessories = [
  { id: 'accessory_none', name: 'Aksessuarsiz', style: 'none', price: 0, rarity: 'oddiy', emoji: '🙂', color: '#64748b', accent: '#475569' },
  { id: 'accessory_glasses', name: "Ko'zoynak", style: 'glasses', price: 150, rarity: 'oddiy', emoji: '👓', color: '#334155', accent: '#94a3b8' },
  { id: 'accessory_sunglasses', name: 'Quyosh ko\'zoynagi', style: 'sunglasses', price: 220, rarity: 'oddiy', emoji: '🕶️', color: '#0f172a', accent: '#334155' },
  { id: 'accessory_bowtie', name: 'Galstuk-babochka', style: 'bowtie', price: 180, rarity: 'oddiy', emoji: '🎀', color: '#dc2626', accent: '#991b1b' },
  { id: 'accessory_scarf', name: 'Sharf', style: 'scarf', price: 200, rarity: 'oddiy', emoji: '🧣', color: '#f97316', accent: '#ea580c' },
  { id: 'accessory_mask', name: 'Super niqob', style: 'mask', price: 450, rarity: 'nodir', emoji: '🎭', color: '#16a34a', accent: '#14532d' },
  { id: 'accessory_headphones', name: 'Naushniklar', style: 'headphones', price: 500, rarity: 'nodir', emoji: '🎧', color: '#8b5cf6', accent: '#7c3aed' },
  { id: 'accessory_chain', name: 'Oltin zanjir', style: 'chain', price: 900, rarity: 'nodir', emoji: '📿', color: '#fbbf24', accent: '#f59e0b' },
  { id: 'accessory_halo', name: 'Farishta halosi', style: 'halo', price: 1300, rarity: 'afsonaviy', emoji: '😇', color: '#fde047', accent: '#facc15' },
];

// ===================== UY HAYVONLARI =====================
const pets = [
  { id: 'pet_none', name: 'Uy hayvonisiz', style: 'none', price: 0, rarity: 'oddiy', emoji: '🙂', color: '#64748b', accent: '#475569' },
  { id: 'pet_cat', name: 'Mushuk', style: 'pet', price: 400, rarity: 'oddiy', emoji: '🐱', color: '#f59e0b', accent: '#78350f' },
  { id: 'pet_dog', name: 'Kuchuk', style: 'pet', price: 450, rarity: 'oddiy', emoji: '🐶', color: '#b45309', accent: '#78350f' },
  { id: 'pet_parrot', name: 'To\'tiqush', style: 'pet', price: 500, rarity: 'nodir', emoji: '🦜', color: '#10b981', accent: '#dc2626' },
  { id: 'pet_fox', name: 'Tulki', style: 'pet', price: 550, rarity: 'nodir', emoji: '🦊', color: '#f97316', accent: '#7c2d12' },
  { id: 'pet_owl', name: "Boyo'g'li", style: 'pet', price: 600, rarity: 'nodir', emoji: '🦉', color: '#8b5cf6', accent: '#4c1d95' },
  { id: 'pet_penguin', name: 'Pingvin', style: 'pet', price: 650, rarity: 'nodir', emoji: '🐧', color: '#0ea5e9', accent: '#f8fafc' },
  { id: 'pet_panda', name: 'Panda', style: 'pet', price: 800, rarity: 'afsonaviy', emoji: '🐼', color: '#64748b', accent: '#0f172a' },
  { id: 'pet_dragon', name: 'Ajdaho', style: 'pet', price: 1500, rarity: 'afsonaviy', emoji: '🐲', color: '#16a34a', accent: '#fbbf24' },
];

export const SHOP_ITEMS = [...hats, ...outfits, ...accessories, ...pets];

// Boshlang'ich (bepul) to'plam — har bir yangi foydalanuvchida mavjud
export const DEFAULT_OWNED = ['hat_none', 'outfit_tshirt', 'accessory_none', 'pet_none'];

export const DEFAULT_EQUIPPED = {
  hat: 'hat_none',
  outfit: 'outfit_tshirt',
  accessory: 'accessory_none',
  pet: 'pet_none',
};

export const getShopItem = (id) => SHOP_ITEMS.find(i => i.id === id) || null;
