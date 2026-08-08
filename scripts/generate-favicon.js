// ⚠️ ESKI (deprecated) skript — ishlatilmaydi!
// Yangi va to'liq generator: node scripts/generate-favicons.js
// (bu skript 'L' harfli gradient favicon yaratadi, lekin sayt hozir
//  brend logosi logo.png dan yaratilgan faviconlarni ishlatadi).
//
// favicon PNG generator — lingohub.uz
// Usage: node scripts/generate-favicon.js
// Generates branded PNG favicons (48x48 + 180x180) into the 'public' folder.
// Dependency-free: uses only Node built-ins (fs, path, zlib).

import fs from 'node:fs';
import path from 'node:path';
import { createPNG } from './lib/png.js';

// ===== CONFIG =====
const OUT_DIR = path.join(process.cwd(), 'public');
const SIZES = [
  // Regular favicon: rounded corners (transparent outside)
  { name: 'favicon-48x48.png', size: 48, rounded: true },
  // Apple touch icon: must be fully opaque square (no transparency on iOS)
  { name: 'favicon-180x180.png', size: 180, rounded: false },
];

// Brand colors (matches site gradient: #6366f1 -> #a855f7)
const COLOR_START = [99, 102, 241];   // #6366f1 indigo
const COLOR_END = [168, 85, 247];     // #a855f7 purple
const CORNER_RADIUS = 0.22;           // rounded corner radius as fraction of size

// ===== FAVICON RENDERING =====

function renderFavicon(size, rounded) {
  const pixels = Buffer.alloc(size * size * 4);
  const r = size * CORNER_RADIUS;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;

      // Rounded-corner mask (skip for opaque apple-touch-icon)
      if (rounded) {
        const cx = x + 0.5;
        const cy = y + 0.5;
        const dx = Math.max(r - cx, cx - (size - r), 0);
        const dy = Math.max(r - cy, cy - (size - r), 0);
        const inside = dx * dx + dy * dy <= r * r;

        if (!inside) {
          pixels[i] = 0;
          pixels[i + 1] = 0;
          pixels[i + 2] = 0;
          pixels[i + 3] = 0;
          continue;
        }
      }

      // Diagonal gradient
      const t = (x + y) / (2 * (size - 1));
      pixels[i] = Math.round(COLOR_START[0] + (COLOR_END[0] - COLOR_START[0]) * t);
      pixels[i + 1] = Math.round(COLOR_START[1] + (COLOR_END[1] - COLOR_START[1]) * t);
      pixels[i + 2] = Math.round(COLOR_START[2] + (COLOR_END[2] - COLOR_START[2]) * t);
      pixels[i + 3] = 255;

      // "L" letter in white (fractions of size)
      const fx = x / size;
      const fy = y / size;
      const inL =
        (fx >= 0.32 && fx <= 0.46 && fy >= 0.22 && fy <= 0.78) || // vertical bar
        (fx >= 0.32 && fx <= 0.68 && fy >= 0.64 && fy <= 0.78);   // horizontal bar
      if (inL) {
        pixels[i] = 255;
        pixels[i + 1] = 255;
        pixels[i + 2] = 255;
      }
    }
  }
  return pixels;
}

// ===== MAIN =====

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const { name, size, rounded } of SIZES) {
  const pixels = renderFavicon(size, rounded);
  const png = createPNG(size, size, pixels);
  const file = path.join(OUT_DIR, name);
  fs.writeFileSync(file, png);
  console.log(`✓ ${file} (${size}x${size}, ${png.length} bytes)`);
}
