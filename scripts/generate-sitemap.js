// sitemap.xml generator — lingohub.uz
// Usage: node scripts/generate-sitemap.js
// Scans a directory (optional) and/or uses a static route list,
// builds sitemap.xml and saves it into the 'public' folder.

import fs from 'node:fs';
import path from 'node:path';

// ===== CONFIG =====
const DOMAIN = 'https://lingohub.uz';
const SITEMAP_NAME = 'sitemap.xml';

// Static routes (add/remove freely). Leading '/' required.
const STATIC_ROUTES = [
  '/',
  '/english',
  '/spanish',
  '/french',
  '/german',
  '/italian',
  '/portuguese',
  '/russian',
  '/korean',
  '/japanese',
  '/chinese',
  '/arabic',
  '/hindi',
  '/turkish',
  '/dutch',
  '/polish',
  '/swedish',
  '/norwegian',
  '/danish',
  '/finnish',
  '/greek',
  '/hebrew',
  '/thai',
  '/vietnamese',
  '/indonesian',
  '/romanian',
  '/czech',
  '/ukrainian',
];

// Optional: directory to scan for page files (e.g. 'src/pages').
// Set to null to skip scanning and use STATIC_ROUTES only.
const SCAN_DIR = null; // e.g. path.join(process.cwd(), 'src', 'pages')

// Priority per route (fallback used for routes not in this map).
const PRIORITIES = { '/': 1.0, '/english': 0.9, '/spanish': 0.9, '/french': 0.9 };
const DEFAULT_PRIORITY = 0.8;
const CHANGEFREQ = 'weekly';

// ===== ROUTE DISCOVERY =====

// Convert 'HomePage.jsx' -> '/home-page', 'level/[id].jsx' -> '/level/[id]'
function fileToRoute(file) {
  return file
    .replace(/\.(jsx|tsx|js|ts)$/, '')
    .replace(/\/index$/, '')
    .split('/')
    .map(part => part.replace(/^\[(.*)\]$/, ':$1'))
    .join('/')
    .replace(/[A-Z]/g, c => '-' + c.toLowerCase())
    .replace(/^-/, '')
    .replace(/^/, '/');
}

function scanDirectory(dir) {
  if (!dir || !fs.existsSync(dir)) return [];
  const routes = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(jsx|tsx|js|ts)$/.test(entry.name)) {
        const rel = path.relative(dir, full).split(path.sep).join('/');
        const route = fileToRoute(rel);
        // Skip dynamic segments like ':langId' — they aren't crawlable URLs
        if (!route.includes(':')) routes.push(route);
      }
    }
  };
  walk(dir);
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
  const unique = [...new Set(routes)];
  const urls = unique
    .map((route) => {
      const loc = route.startsWith('http') ? route : DOMAIN + route.replace(/^\/?/, '/');
      const priority = PRIORITIES[route] ?? DEFAULT_PRIORITY;
      return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${CHANGEFREQ}</changefreq>
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

const routes = [...scanDirectory(SCAN_DIR), ...STATIC_ROUTES];
if (routes.length === 0) {
  console.error('Hech qanday route topilmadi. STATIC_ROUTES ni to\'ldiring.');
  process.exit(1);
}

const xml = buildSitemap(routes);
const urlCount = [...new Set(routes)].length;
const outDir = path.join(process.cwd(), 'public');
const outFile = path.join(outDir, SITEMAP_NAME);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, xml, 'utf8');

console.log(`✓ Sitemap generated: ${outFile} (${urlCount} URLs)`);
