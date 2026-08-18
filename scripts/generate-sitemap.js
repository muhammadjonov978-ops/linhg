// sitemap.xml generator — lingohub.uz
// Usage: node scripts/generate-sitemap.js
// Builds sitemap.xml and saves it into the 'public' folder.
//
// ⚠️ MUHIM: Hozirgi deploy Vite SPA (hash-routing: #/portfolio, #/shop, ...).
// Bu SPA'da faqat bitta HAQIQIY sahifa bor — "/" (bosh sahifa). "/english",
// "/english/beginner" kabi yo'llar 404 qaytaradi (tekshirilgan: 2026-08-18),
// shuning uchun ularni sitemap'ga qo'shish Google uchun zararli — crawl
// byudjeti behuda sarflanadi va 404 sahifalar indekslanadi.
//
// Qachon til/daraja sahifalari qaytadan qo'shiladi? nextjs/ papkasidagi
// Next.js (SSR) versiyasi deploy qilinganda — uning o'z sitemap.ts bor va
// /english, /english/beginner kabi yo'llarni REAL kontent bilan xizmat
// qiladi. O'sha paytda bu scriptning o'zi kerak bo'lmaydi.

import fs from 'node:fs';
import path from 'node:path';

// ===== CONFIG =====
const DOMAIN = 'https://lingohub.uz';
const SITEMAP_NAME = 'sitemap.xml';

// ===== ROUTE BUILDING =====
// Faqat jonli saytda HAQIQATAN mavjud bo'lgan sahifalar.
function buildRoutes() {
  return [
    { loc: '/', priority: 1.0, changefreq: 'daily' },
  ];
}

// ===== XML BUILDING =====

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSitemap(routes) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = routes
    .map(({ loc, priority, changefreq }) => {
      const url = loc.startsWith('http') ? loc : DOMAIN + loc;
      return `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

// ===== MAIN =====

const routes = buildRoutes();
const xml = buildSitemap(routes);
const outDir = path.join(process.cwd(), 'public');
const outFile = path.join(outDir, SITEMAP_NAME);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, xml, 'utf8');

console.log(`✓ Sitemap generated: ${outFile} (${routes.length} URLs)`);
