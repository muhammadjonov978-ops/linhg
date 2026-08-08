// sitemap.xml generator — lingohub.uz
// Usage: node scripts/generate-sitemap.js
// Builds sitemap.xml with all language pages + 4 level pages per language
// and saves it into the 'public' folder.

import fs from 'node:fs';
import path from 'node:path';

// ===== CONFIG =====
const DOMAIN = 'https://lingohub.uz';
const SITEMAP_NAME = 'sitemap.xml';

// 4 levels per language
const LEVELS = ['beginner', 'elementary', 'pre-intermediate', 'advanced'];

// ===== LANGUAGE DISCOVERY =====
// Read src/data/languages.js and extract language ids from the `languages` array,
// so the sitemap never drifts from the app's real data.
function discoverLanguages() {
  const file = path.join(process.cwd(), 'src', 'data', 'languages.js');
  if (!fs.existsSync(file)) {
    console.error('src/data/languages.js topilmadi!');
    process.exit(1);
  }
  const source = fs.readFileSync(file, 'utf8');
  const start = source.indexOf('export const languages = [');
  const end = source.indexOf('];', start);
  if (start === -1 || end === -1) {
    console.error('languages array topilmadi!');
    process.exit(1);
  }
  const block = source.slice(start, end + 2);
  const ids = [...block.matchAll(/id:\s*'([a-z0-9-]+)'/g)].map((m) => m[1]);
  if (ids.length === 0) {
    console.error('language id\'lari topilmadi!');
    process.exit(1);
  }
  return ids;
}

// Priority per page type (see sitemaps.org spec)
const PRIORITY = {
  home: 1.0,
  language: 0.9,
  level: 0.7,
};
const CHANGEFREQ = {
  home: 'daily',
  language: 'weekly',
  level: 'monthly',
};

// ===== ROUTE BUILDING =====

function buildRoutes() {
  const LANGUAGES = discoverLanguages();

  const routes = [
    { loc: '/', priority: PRIORITY.home, changefreq: CHANGEFREQ.home },
  ];

  for (const lang of LANGUAGES) {
    routes.push({
      loc: `/${lang}`,
      priority: PRIORITY.language,
      changefreq: CHANGEFREQ.language,
    });
  }

  for (const lang of LANGUAGES) {
    for (const level of LEVELS) {
      routes.push({
        loc: `/${lang}/${level}`,
        priority: PRIORITY.level,
        changefreq: CHANGEFREQ.level,
      });
    }
  }

  return routes;
}

// ===== XML BUILDING =====

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
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
