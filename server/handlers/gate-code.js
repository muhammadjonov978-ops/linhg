// ============================================================
// server/handlers/gate-code.js — Instagram story-kod shlyuzi
// ============================================================
// Saytga kirish shlyuzida Instagram kanallari uchun "story-kod" usuli:
// egasi kunlik maxfiy kodni Instagram'da e'lon qiladi, foydalanuvchi
// shu kodni kiritishi shart — kanalga haqiqiy bog'langanini bilvosita
// tasdiqlaydi. Kod SERVER'da saqlanadi (Redis, bo'lmasa xotira) —
// brauzerga hech qachon chiqmaydi.
//
// Endpoint'lar (api/index.js router orqali):
//   GET  /api/gate/code/status   → { ok, hasCode }
//   POST /api/gate/code/check    → { code } → { ok, valid }
//   POST /api/gate/code/set      → { code, Authorization: Bearer <admin token> }
import { redis } from '../lib/redis.js';
import { verifyToken } from '../lib/adminAuth.js';

const IG_CODE_KEY = 'gate:ig:code';
const TTL_MS = 48 * 60 * 60 * 1000; // 48 soat — egasi yangi kod qo'yganida almashadi

// Xotirada (serverless instansiya bo'yicha) + Redis'da (barcha instansiyalar)
let memoryCode = null; // { code, setAt }

function normalize(code) {
  return String(code || '').trim().toLowerCase().replace(/\s+/g, '');
}

async function readStored() {
  if (memoryCode && Date.now() - memoryCode.setAt <= TTL_MS) return memoryCode;
  if (redis) {
    try {
      const raw = await redis.get(IG_CODE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.code) {
          if (Date.now() - (parsed.setAt || 0) <= TTL_MS) {
            memoryCode = parsed;
            return parsed;
          }
        }
      }
    } catch {
      /* noop */
    }
  }
  return null;
}

async function writeStored(payload) {
  memoryCode = payload;
  if (redis) {
    try {
      await redis.set(IG_CODE_KEY, JSON.stringify(payload), { ex: Math.ceil(TTL_MS / 1000) });
    } catch {
      /* noop */
    }
  }
}

export default async function handler(req, res) {
  const pathname = String(req.url || '/').split('?')[0].replace(/\/+$/, '');

  // GET /api/gate/code/status — kod e'lon qilinganmi?
  if (req.method === 'GET' && pathname.endsWith('/status')) {
    const stored = await readStored();
    return res.status(200).json({ ok: true, hasCode: Boolean(stored && stored.code) });
  }

  // POST /api/gate/code/check — foydalanuvchi kiritgan kodni tekshirish
  if (req.method === 'POST' && pathname.endsWith('/check')) {
    const code = normalize(req.body?.code || '');
    const stored = await readStored();
    if (!stored || !stored.code) {
      return res.status(200).json({ ok: true, valid: false, missing: true });
    }
    const valid = code.length > 0 && code === normalize(stored.code);
    return res.status(200).json({ ok: true, valid });
  }

  // POST /api/gate/code/set — admin yangi kod o'rnatadi (faqat token bilan)
  if (req.method === 'POST' && pathname.endsWith('/set')) {
    const auth = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const admin = verifyToken(auth);
    if (!admin) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
    const code = String(req.body?.code || '').trim();
    if (code.length < 3) {
      return res.status(400).json({ ok: false, error: 'Kod kamida 3 belgidan iborat bo\u2018lishi kerak' });
    }
    await writeStored({ code, setAt: Date.now() });
    return res.status(200).json({ ok: true });
  }

  return res.status(404).json({ ok: false, error: 'Not found' });
}
