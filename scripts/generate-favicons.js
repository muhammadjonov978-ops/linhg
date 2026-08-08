// favicon generator — lingohub.uz
// Usage: node scripts/generate-favicons.js
// Brend logosi (public/logo.png) dan to'liq, zamonaviy favicon to'plamini
// yaratadi: 16/32/48/180/192/512 PNG + favicon.ico (16,32,48) + yengil favicon.svg.
//
// NIMA UCHUN KERAK:
//  - favicon.ico — Google qidiruv crawleri /favicon.ico ni alohida izlaydi va
//    eski faviconni yangilash uchun aynan shu fayl + <link rel="icon"> muhim.
//  - apple-touch-icon (180) — iOS brauzeri uchun (shaffofsiz bo'lishi shart).
//  - favicon.svg — yengil va mustaqil (avvalgi 70KB'lik blob o'rniga).
//  - favicon-192/512 — PWA / Android "Add to home screen" uchun (manifest).
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.join(process.cwd(), 'public');
const SRC = path.join(OUT_DIR, 'logo.png');
// Brend fon rangi (index.html dagi theme-color bilan bir xil)
const BG = '#0d0d10';

const SIZES = [16, 32, 48, 180, 192, 512];
// Shaffofsiz (to'liq fon) bo'lishi kerak bo'lgan o'lchamlar:
//  - apple-touch-icon (iOS) — iOS shaffoflikni qabul qilmaydi
//  - manifest ikonkalari (192/512) — Android dark fon talab qilmaydi, lekin
//    to'liq rangli kvadratcha yaxshiroq ko'rinadi
const OPAQUE = new Set([180, 192, 512]);

// ---- ICO konteyner (PNG-payload, Vista+ barcha brauzerlar tushunadi) ----
function createIco(images) {
  const count = images.length;
  const headerSize = 6;
  const entrySize = 16;
  const offset = headerSize + entrySize * count;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);
  const chunks = [header];
  let dataOffset = offset;
  for (const img of images) {
    const entry = Buffer.alloc(entrySize);
    entry[0] = img.size >= 256 ? 0 : img.size; // width (0 = 256)
    entry[1] = img.size >= 256 ? 0 : img.size; // height
    entry[2] = 0; // color count
    entry[3] = 0; // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.png.length, 8); // payload size
    entry.writeUInt32LE(dataOffset, 12); // payload offset
    chunks.push(entry);
    dataOffset += img.png.length;
  }
  for (const img of images) chunks.push(img.png);
  return Buffer.concat(chunks);
}

async function main() {
  const meta = await sharp(SRC).metadata();
  if (!meta.width || !meta.height) {
    throw new Error(`logo.png o'qilmadi: ${SRC}`);
  }
  console.log(`Manba: ${SRC} (${meta.width}x${meta.height})\n`);

  // 1) PNG o'lchamlar
  for (const size of SIZES) {
    let pipe = sharp(SRC).resize(size, size, { fit: 'contain' });
    if (OPAQUE.has(size)) pipe = pipe.flatten({ background: BG });
    const file = path.join(OUT_DIR, `favicon-${size}x${size}.png`);
    await pipe.png().toFile(file);
    console.log(`✓ favicon-${size}x${size}.png (${(fs.statSync(file).size / 1024).toFixed(1)}KB)`);
  }

  // 2) favicon.ico — 16/32/48 (PNG-embedded, barcha zamonaviy brauzerlar)
  const icoImages = [];
  for (const size of [16, 32, 48]) {
    const png = await sharp(SRC)
      .resize(size, size, { fit: 'contain' })
      .png()
      .toBuffer();
    icoImages.push({ size, png });
  }
  const icoFile = path.join(OUT_DIR, 'favicon.ico');
  fs.writeFileSync(icoFile, createIco(icoImages));
  console.log(`✓ favicon.ico (${icoImages.length} o'lcham, ${(fs.statSync(icoFile).size / 1024).toFixed(1)}KB)`);

  // 3) Yengil favicon.svg — 64x64 rasmni ichiga joylaymiz (70KB blob o'rniga)
  const small = await sharp(SRC).resize(64, 64, { fit: 'contain' }).png().toBuffer();
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">' +
    `<image width="64" height="64" href="data:image/png;base64,${small.toString('base64')}"/>` +
    '</svg>';
  const svgFile = path.join(OUT_DIR, 'favicon.svg');
  fs.writeFileSync(svgFile, svg);
  console.log(`✓ favicon.svg (yengil, ${(fs.statSync(svgFile).size / 1024).toFixed(1)}KB)`);

  console.log('\nTayyor! Barcha faviconlar public/ papkasida.');
}

main().catch((e) => {
  console.error('XATO:', e.message);
  process.exit(1);
});
