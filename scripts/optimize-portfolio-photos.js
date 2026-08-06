// Portfolio rasmlarini edit qilish skripti
// Har bir rasm: avto-aylantirish (EXIF), kontrast/yorqinlik to'g'rilash, web uchun optimizatsiya
import sharp from 'sharp';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC_DIR = 'src/assets/portfolio/raw';
const OUT_DIR = 'src/assets/portfolio';

const files = readdirSync(SRC_DIR).filter((f) => /\.(png|jpe?g|webp|heic)$/i.test(f));

if (files.length === 0) {
  console.error('Rasmlar topilmadi. Rasmlarni src/assets/portfolio/raw papkasiga soling.');
  process.exit(1);
}

const results = [];

for (const file of files) {
  const input = join(SRC_DIR, file);
  const base = file.replace(/\.[^.]+$/, '');
  const output = join(OUT_DIR, `${base}.webp`);

  try {
    const { width, height } = await sharp(input).metadata();

    await sharp(input)
      .autoOrient()                    // EXIF bo'yicha aylantirish (notebook/telefon rasmlari uchun)
      .resize({ width: 800, withoutEnlargement: true })  // web uchun o'lcham cheklovi
      .modulate({ brightness: 1.06, saturation: 1.08 }) // yorqinlik + rang boyligi
      .normalize()                     // kontrastni avtomatik to'g'rilash
      .sharpen({ sigma: 0.9 })         // yengil aniqlik
      .webp({ quality: 84 })
      .toFile(output);

    results.push(`✓ ${file} (${width}x${height}) → ${base}.webp`);
  } catch (err) {
    results.push(`✗ ${file}: ${err.message}`);
  }
}

console.log(results.join('\n'));
