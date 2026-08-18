// Open Graph image generator — lingohub.uz
// Usage: node scripts/generate-og-image.js
// Generates a branded 1200x630 OG share image into the 'public' folder.
// Dependency-free: uses only Node built-ins (fs, path, zlib).

import fs from 'node:fs';
import path from 'node:path';
import { createPNG } from './lib/png.js';

// ===== CONFIG =====
const OUT_DIR = path.join(process.cwd(), 'public');
const WIDTH = 1200;
const HEIGHT = 630;

// Brand colors (matches site gradient: #6366f1 -> #a855f7)
const COLOR_START = [99, 102, 241];   // #6366f1 indigo
const COLOR_END = [168, 85, 247];     // #a855f7 purple

// ===== RENDERING =====

// Gradient background with a large "L" brand mark
function renderOgImage() {
  const pixels = Buffer.alloc(WIDTH * HEIGHT * 4);

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const i = (y * WIDTH + x) * 4;

      // Diagonal gradient
      const t = (x + y) / (WIDTH + HEIGHT);
      pixels[i] = Math.round(COLOR_START[0] + (COLOR_END[0] - COLOR_START[0]) * t);
      pixels[i + 1] = Math.round(COLOR_START[1] + (COLOR_END[1] - COLOR_START[1]) * t);
      pixels[i + 2] = Math.round(COLOR_START[2] + (COLOR_END[2] - COLOR_START[2]) * t);
      pixels[i + 3] = 255;
    }
  }

  // Large "L" brand mark (centered, white)
  const markW = 260;
  const markH = 300;
  const startX = Math.round((WIDTH - markW) / 2);
  const startY = Math.round((HEIGHT - markH) / 2);

  // Vertical bar: x in [0, 0.45], y in [0, 1]
  // Horizontal bar: x in [0, 1], y in [0.72, 1]
  const vx1 = startX;
  const vx2 = startX + Math.round(markW * 0.45);
  const hy2 = startY + markH;
  const hy1 = startY + Math.round(markH * 0.72);

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const inVertical = x >= vx1 && x <= vx2 && y >= startY && y <= hy2;
      const inHorizontal = x >= vx1 && x <= startX + markW && y >= hy1 && y <= hy2;
      if (inVertical || inHorizontal) {
        const i = (y * WIDTH + x) * 4;
        pixels[i] = 255;
        pixels[i + 1] = 255;
        pixels[i + 2] = 255;
        pixels[i + 3] = 255;
      }
    }
  }

  return pixels;
}

// ===== MAIN =====

fs.mkdirSync(OUT_DIR, { recursive: true });

const pixels = renderOgImage();
const png = createPNG(WIDTH, HEIGHT, pixels);
const pngFile = path.join(OUT_DIR, 'og-image.png');
fs.writeFileSync(pngFile, png);
console.log(`✓ ${pngFile} (${WIDTH}x${HEIGHT}, ${png.length} bytes)`);

// Sayt index.html'dagi og:image / twitter:image / JSON-LD manzillari
// og-image.jpg ga qaraydi (308 KB png o'rniga ~30 KB jpg — tezroq yuklanadi).
// Sharp mavjud bo'lsa jpg ham yaratamiz (devDependencies).
try {
  const sharp = (await import('sharp')).default;
  await sharp(pngFile)
    .flatten({ background: '#0d0d10' })
    .jpeg({ quality: 82 })
    .toFile(path.join(OUT_DIR, 'og-image.jpg'));
  console.log(`✓ ${path.join(OUT_DIR, 'og-image.jpg')} (~30 KB)`);
} catch {
  console.warn('⚠️ sharp topilmadi — og-image.jpg yaratilmadi. npm i -D sharp ishga tushiring.');
}
