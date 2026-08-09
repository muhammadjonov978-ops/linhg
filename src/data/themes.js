// ==== THEMES ====
// All 35 built-in daisyUI v5 themes with Uzbek display names.

export const THEMES = [
  { id: 'lingohub', name: "Lingohub Ko'k", category: 'dark' },
  { id: 'light', name: "Yorug'", category: 'light' },
  { id: 'dark', name: "Qorong'i", category: 'dark' },
  { id: 'cupcake', name: 'Kapkeyk', category: 'light' },
  { id: 'bumblebee', name: 'Asalari', category: 'light' },
  { id: 'emerald', name: 'Zumrad', category: 'light' },
  { id: 'corporate', name: 'Korporativ', category: 'light' },
  { id: 'synthwave', name: 'Sintveyv', category: 'dark' },
  { id: 'retro', name: 'Retro', category: 'light' },
  { id: 'cyberpunk', name: 'Kiberpank', category: 'dark' },
  { id: 'valentine', name: 'Sevgi', category: 'light' },
  { id: 'halloween', name: 'Xellouin', category: 'dark' },
  { id: 'garden', name: "Bog'", category: 'light' },
  { id: 'forest', name: "O'rmon", category: 'dark' },
  { id: 'aqua', name: 'Akva', category: 'light' },
  { id: 'lofi', name: 'Lofi', category: 'light' },
  { id: 'pastel', name: 'Pastel', category: 'light' },
  { id: 'fantasy', name: 'Fantaziya', category: 'light' },
  { id: 'wireframe', name: 'Wireframe', category: 'light' },
  { id: 'black', name: 'Qora', category: 'dark' },
  { id: 'luxury', name: 'Hashamat', category: 'dark' },
  { id: 'dracula', name: 'Drakula', category: 'dark' },
  { id: 'cmyk', name: 'CMYK', category: 'light' },
  { id: 'autumn', name: 'Kuz', category: 'light' },
  { id: 'business', name: 'Biznes', category: 'dark' },
  { id: 'acid', name: 'Kislota', category: 'light' },
  { id: 'lemonade', name: 'Limonad', category: 'light' },
  { id: 'night', name: 'Tun', category: 'dark' },
  { id: 'coffee', name: 'Qahva', category: 'dark' },
  { id: 'winter', name: 'Qish', category: 'light' },
  { id: 'dim', name: 'Xira', category: 'dark' },
  { id: 'nord', name: 'Nord', category: 'light' },
  { id: 'sunset', name: 'Quyosh botishi', category: 'dark' },
  { id: 'caramellatte', name: 'Karamel latte', category: 'light' },
  { id: 'abyss', name: 'Tub', category: 'dark' },
  { id: 'silk', name: 'Ipak', category: 'light' },
];

export const isThemeId = (id) => THEMES.some(t => t.id === id);

export const DEFAULT_THEME = 'lingohub';
