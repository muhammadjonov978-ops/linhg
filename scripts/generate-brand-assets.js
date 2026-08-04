// Brand asset generator — lingohub.uz
// Usage: node scripts/generate-brand-assets.js <source-logo.png>
// Reads the official LINGOHUB.UZ logo and writes into 'public':
//   - logo.png            (1024x1024 copy, exact source)
//   - favicon-48x48.png   (48x48 downscaled)
//   - favicon-180x180.png (180x180 downscaled, opaque apple-touch icon)
//   - og-image.png        (1200x630 social share image with logo centered)
// Dependency-free: uses only Node built-ins (fs, path, zlib).

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createPNG } from './lib/png.js';

const OUT_DIR = path.join(process.cwd(), 'public');
const SRC = process.argv[2];

if (!SRC || !fs.existsSync(SRC)) {
  console.error('Usage: node scripts/generate-brand-assets.js <source-logo.png>');
  process.exit(1);
}

// ===== PNG DECODER (8-bit RGB/RGBA only, enough for our logo) =====

function decodePNG(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error('Not a PNG file');
  let offset = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0;
  const idatChunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  if (bitDepth !== 8) throw new Error(`Unsupported bit depth: ${bitDepth}`);
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 0 ? 1 : null;
  if (!channels) throw new Error(`Unsupported color type: ${colorType}`);

  const raw = zlib.inflateSync(Buffer.concat(idatChunks));
  const stride = width * channels;
  const pixels = Buffer.alloc(width * height * 4);

  const paeth = (a, b, c) => {
    const p = a + b - c;
    const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };

  let prevRow = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const recon = Buffer.alloc(stride);

    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? recon[x - channels] : 0;
      const b = prevRow[x];
      const c = x >= channels ? prevRow[x - channels] : 0;
      let val;
      switch (filter) {
        case 0: val = row[x]; break;
        case 1: val = row[x] + a; break;
        case 2: val = row[x] + b; break;
        case 3: val = row[x] + ((a + b) >> 1); break;
        case 4: val = row[x] + paeth(a, b, c); break;
        default: throw new Error(`Unknown filter: ${filter}`);
      }
      recon[x] = val & 0xff;
    }

    for (let x = 0; x < width; x++) {
      const si = x * channels;
      const di = (y * width + x) * 4;
      pixels[di] = recon[si];
      pixels[di + 1] = channels > 1 ? recon[si + 1] : recon[si];
      pixels[di + 2] = channels > 2 ? recon[si + 2] : recon[si];
      pixels[di + 3] = channels === 4 ? recon[si + 3] : 255;
    }
    prevRow = recon;
  }

  return { width, height, pixels };
}

// ===== BILINEAR RESIZE =====

function resize(src, srcW, srcH, dstW, dstH) {
  const out = Buffer.alloc(dstW * dstH * 4);
  const sx = srcW / dstW;
  const sy = srcH / dstH;

  for (let y = 0; y < dstH; y++) {
    const fy = (y + 0.5) * sy - 0.5;
    const y0 = Math.max(0, Math.floor(fy));
    const y1 = Math.min(srcH - 1, y0 + 1);
    const wy = fy - y0;

    for (let x = 0; x < dstW; x++) {
      const fx = (x + 0.5) * sx - 0.5;
      const x0 = Math.max(0, Math.floor(fx));
      const x1 = Math.min(srcW - 1, x0 + 1);
      const wx = fx - x0;

      for (let c = 0; c < 4; c++) {
        const i00 = (y0 * srcW + x0) * 4 + c;
        const i01 = (y0 * srcW + x1) * 4 + c;
        const i10 = (y1 * srcW + x0) * 4 + c;
        const i11 = (y1 * srcW + x1) * 4 + c;
        const top = src[i00] * (1 - wx) + src[i01] * wx;
        const bot = src[i10] * (1 - wx) + src[i11] * wx;
        out[(y * dstW + x) * 4 + c] = Math.round(top * (1 - wy) + bot * wy);
      }
    }
  }
  return out;
}

// ===== MAIN =====

const src = fs.readFileSync(SRC);
const { width: srcW, height: srcH, pixels: srcPx } = decodePNG(src);
console.log(`✓ Decoded source: ${srcW}x${srcH}`);

fs.mkdirSync(OUT_DIR, { recursive: true });

// 1) logo.png — exact copy of the official logo
fs.copyFileSync(SRC, path.join(OUT_DIR, 'logo.png'));
console.log(`✓ ${path.join(OUT_DIR, 'logo.png')} (exact copy)`);

// 2) favicons (downscaled)
const favicon48 = resize(srcPx, srcW, srcH, 48, 48);
fs.writeFileSync(path.join(OUT_DIR, 'favicon-48x48.png'), createPNG(48, 48, favicon48));
console.log(`✓ ${path.join(OUT_DIR, 'favicon-48x48.png')}`);

const favicon180 = resize(srcPx, srcW, srcH, 180, 180);
// Force opaque (apple-touch-icon must not be transparent)
for (let i = 3; i < favicon180.length; i += 4) favicon180[i] = 255;
fs.writeFileSync(path.join(OUT_DIR, 'favicon-180x180.png'), createPNG(180, 180, favicon180));
console.log(`✓ ${path.join(OUT_DIR, 'favicon-180x180.png')}`);

// 3) og-image.png — 1200x630 with logo centered on sampled background color
const OG_W = 1200, OG_H = 630;
// Sample the source background from a corner (dark blue) to blend seamlessly
const bg = [srcPx[0], srcPx[1], srcPx[2], srcPx[3]];
const og = Buffer.alloc(OG_W * OG_H * 4);
for (let i = 0; i < og.length; i += 4) {
  og[i] = bg[0]; og[i + 1] = bg[1]; og[i + 2] = bg[2]; og[i + 3] = 255;
}

// Fit logo into the canvas (keep aspect ratio, ~86% height)
const targetH = Math.round(OG_H * 0.86);
const targetW = Math.round(targetH * (srcW / srcH));
const logoResized = resize(srcPx, srcW, srcH, targetW, targetH);
const ox = Math.round((OG_W - targetW) / 2);
const oy = Math.round((OG_H - targetH) / 2);

for (let y = 0; y < targetH; y++) {
  for (let x = 0; x < targetW; x++) {
    const si = (y * targetW + x) * 4;
    const di = ((oy + y) * OG_W + (ox + x)) * 4;
    const a = logoResized[si + 3] / 255;
    if (a >= 1) {
      og[di] = logoResized[si];
      og[di + 1] = logoResized[si + 1];
      og[di + 2] = logoResized[si + 2];
      og[di + 3] = 255;
    } else if (a > 0) {
      og[di] = Math.round(logoResized[si] * a + bg[0] * (1 - a));
      og[di + 1] = Math.round(logoResized[si + 1] * a + bg[1] * (1 - a));
      og[di + 2] = Math.round(logoResized[si + 2] * a + bg[2] * (1 - a));
      og[di + 3] = 255;
    }
  }
}
fs.writeFileSync(path.join(OUT_DIR, 'og-image.png'), createPNG(OG_W, OG_H, og));
console.log(`✓ ${path.join(OUT_DIR, 'og-image.png')} (${OG_W}x${OG_H})`);
