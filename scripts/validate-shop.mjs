// Magazin ma'lumotlarini tekshiradi: har bir item.style HeroAvatar'da chiziladimi,
// default kiyimlar mavjudmi, kategoriyalar to'g'rimi.
// Ishga tushirish: node scripts/validate-shop.mjs
import { SHOP_ITEMS, SHOP_CATEGORIES, DEFAULT_EQUIPPED, DEFAULT_OWNED, getShopItem } from '../src/data/shop.js';

let errors = 0;
const err = (m) => { errors += 1; console.error('  ✗ ' + m); };

const SUPPORTED = {
  bg: ['none', 'night', 'mars', 'galaxy', 'sunset'],
  hat: ['none', 'cap', 'beanie', 'flower', 'cowboy', 'grad', 'tophat', 'viking', 'wizard', 'crown', 'spacehat'],
  outfit: ['tshirt', 'sweater', 'hoodie', 'lab', 'kimono', 'pirate', 'suit', 'astronaut', 'spacesuit', 'superhero', 'armor'],
  accessory: ['none', 'glasses', 'sunglasses', 'visor', 'bowtie', 'scarf', 'mask', 'headphones', 'chain', 'halo'],
  pet: ['none', 'pet'],
};

const catIds = new Set(SHOP_CATEGORIES.map((c) => c.id));
const seen = new Set();

console.log(`Jami itemlar: ${SHOP_ITEMS.length}`);
SHOP_ITEMS.forEach((it) => {
  if (seen.has(it.id)) err(`dublikat id: ${it.id}`);
  seen.add(it.id);
  if (!catIds.has(it.category)) err(`${it.id}: noma'lum kategoriya '${it.category}'`);
  const styles = SUPPORTED[it.category];
  if (styles && !styles.includes(it.style)) err(`${it.id}: qo'llab-quvvatlanmaydigan style '${it.style}' (${it.category})`);
  if (typeof it.price !== 'number' || it.price < 0) err(`${it.id}: price xato`);
  if (!it.emoji || !it.name) err(`${it.id}: name/emoji yo'q`);
});

// Default kiyimlar
Object.entries(DEFAULT_EQUIPPED).forEach(([cat, id]) => {
  const item = getShopItem(id);
  if (!item) err(`DEFAULT_EQUIPPED.${cat} = ${id} topilmadi`);
  else if (item.category !== cat) err(`DEFAULT_EQUIPPED.${cat} kategoriyasi mos emas (${item.category})`);
  else if (!DEFAULT_OWNED.includes(id)) err(`DEFAULT_EQUIPPED.${cat} (${id}) DEFAULT_OWNED'da yo'q`);
});

// Space shop itemlari
const spaceItems = SHOP_ITEMS.filter((i) => i.shop === 'space' || i.category === 'bg');
const heroItems = SHOP_ITEMS.filter((i) => i.shop !== 'space');
console.log(`  Hero Shop: ${heroItems.length} ta, Space Shop: ${spaceItems.length} ta`);
if (spaceItems.length === 0) err("Space Shop'da hech narsa yo'q");

if (errors === 0) console.log('\n✅ MAGAZIN MA\'LUMOTLARI TO\'G\'RI');
else { console.error(`\n❌ ${errors} ta xato`); process.exit(1); }
