// ============================================================
// server/dev.js — MAHALLIY API DEV SERVER (Vercel muhitini taqlid qiladi)
// ============================================================
// `api/index.js` — Vercel serverless funksiya (faqat Vercel'da ishlaydi).
// Shu fayl esa xuddi shu router'ni mahalliy kompyuterda 3000-portda
// ishga tushiradi — shunda `npm run dev` (Vite) da /api so'rovlari
// to'liq ishlaydi (vite.config.js dagi proxy → localhost:3000).
//
// Ishga tushirish:
//   npm run dev:api        (3000-port, .env faylini avtomatik o'qiydi)
//   PORT=4000 node server/dev.js   (boshqa port)
//
// Taqlid qilingan Vercel xususiyatlari:
//   - req.query   — URL query (obyekt)
//   - req.body    — JSON / form-data body (obyekt, parserlangan)
//   - req.url     — ASL yo'l (masalan "/api/leaderboard?x=1")
//   - res.status(n).json(obj) — javob yozish
//   - x-forwarded-for sarlavhasi — IP asosidagi rate-limit'lar ishlaydi
// ============================================================
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import apiHandler from '../api/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

// ---------- .env faylini yuklash (dotenv qo'shilmagan — o'zimiz o'qiymiz) ----------
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#') || !line.includes('=')) continue;
      const eq = line.indexOf('=');
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      // Qo'shtirnoqlarni tozalash
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      // Vercel env'larini `--from-env` formatda ham yozish mumkin: KEY=value
      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    /* .env bo'lmasa ham ishlayveradi (faqat tashqi xizmatlar o'chadi) */
  }
}
loadEnvFile();

// ---------- Vercel'ga o'xshash req/res adapter ----------
function createServer() {
  return http.createServer(async (req, res) => {
    const startedAt = Date.now();

    // 1) Body o'qish (JSON + x-www-form-urlencoded)
    let body = undefined;
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const raw = Buffer.concat(chunks).toString('utf8');
      const contentType = String(req.headers['content-type'] || '').toLowerCase();
      if (raw) {
        if (contentType.includes('application/json')) {
          body = JSON.parse(raw);
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          body = Object.fromEntries(new URLSearchParams(raw));
        } else {
          // Vercel ham body'ni obyekt deb qabul qiladi; xom matnni ham saqlaymiz
          try { body = JSON.parse(raw); } catch { body = raw; }
        }
      }
    } catch {
      body = {};
    }

    // 2) Query parse
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const query = Object.fromEntries(parsedUrl.searchParams);

    // 3) Vercel-style request obyekti
    const vreq = {
      method: req.method,
      url: req.url,                       // ASL yo'l: "/api/leaderboard?x=1"
      headers: req.headers,
      query,
      body,
      socket: { remoteAddress: req.socket?.remoteAddress || '127.0.0.1' },
    };

    // 4) Vercel-style response obyekti
    const vres = {
      statusCode: 200,
      headers: {},
      status(code) {
        this.statusCode = code;
        return this;
      },
      setHeader(name, value) {
        this.headers[String(name).toLowerCase()] = String(value);
        return this;
      },
      json(data) {
        const payload = JSON.stringify(data);
        this.headers['content-type'] = this.headers['content-type'] || 'application/json';
        this.headers['content-length'] = Buffer.byteLength(payload);
        res.writeHead(this.statusCode, this.headers);
        res.end(payload);
      },
      end(data) {
        if (data) this.headers['content-length'] = Buffer.byteLength(String(data));
        res.writeHead(this.statusCode, this.headers);
        res.end(data || '');
      },
    };

    try {
      await apiHandler(vreq, vres);
    } catch (err) {
      console.error(`[dev:api] XATO ${req.method} ${req.url}:`, err);
      if (!res.writableEnded) {
        res.writeHead(500, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: `Server xatosi: ${err?.message || 'unknown'}` }));
      }
    } finally {
      const ms = Date.now() - startedAt;
      const status = res.statusCode || 200;
      const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
      console.log(`${color}[dev:api]\x1b[0m ${req.method} ${req.url} → ${status} (${ms}ms)`);
    }
  });
}

const server = createServer();
server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log('');
  console.log('  ┌──────────────────────────────────────────────┐');
  console.log('  │   🚀 Lingohub API (mahalliy dev server)     │');
  console.log(`  │   ${url.padEnd(44)}│`);
  console.log('  │   Vite proxy: /api → shu server              │');
  console.log('  └──────────────────────────────────────────────┘');
  console.log('');
  console.log('  Endpointlar sinash uchun:');
  console.log('    curl ' + url + '/api/health');
  console.log('');
});
