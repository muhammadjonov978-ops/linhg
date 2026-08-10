// POST /api/ai/chat — HAQIQIY AI til o'qituvchisi
// OpenAI API'ga so'rov yuboradi (kalit faqat serverda — OPENAI_API_KEY).
// Kalit sozlanmagan bo'lsa { ok:false, fallback:true } qaytadi va frontend
// eski tayyor javoblarga tushadi (sayt hech qachon buzilmaydi).
//
// Body: { messages: [{role, content}], language: "English", level: "beginner" }
// Javob: { ok:true, reply:"...", model:"gpt-4o-mini" }
//
// Xavfsizlik: har bir IP uchun 1 daqiqada 10 ta so'rov (Redis mavjud bo'lsa).
// Bu OpenAI xarajatini suiiste'mol qilishdan himoya qiladi.

import { redis } from '../lib/redis.js';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const RATE_LIMIT_WINDOW = 60;      // soniya
const RATE_LIMIT_MAX = 10;          // so'rov / daqiqa / IP

// Redis mavjud bo'lsa — IP asosidagi tezlik chegarasi
async function rateLimitOk(ip) {
  if (!redis || !ip) return true;
  try {
    const key = `ai_rate:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, RATE_LIMIT_WINDOW);
    return count <= RATE_LIMIT_MAX;
  } catch {
    return true; // Redis xatosi — bloklamaymiz (fail-open)
  }
}

// Qisqa, ishonchli, arzon model — shaxsiy o'qituvchi sifatida yetarli.
// Boshqa model ishlatmoqchi bo'lsangiz OPENAI_MODEL env o'zgaruvchisini qo'ying.
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY || '';
  if (!apiKey) {
    return res.status(200).json({ ok: false, fallback: true, error: 'OPENAI_API_KEY sozlanmagan' });
  }

  // IP asosidagi tezlik chegarasi
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress || 'unknown';
  const allowed = await rateLimitOk(ip);
  if (!allowed) {
    return res.status(429).json({ ok: false, error: 'Juda ko\'p so\'rov — birozdan keyin qayta urinib ko\'ring' });
  }

  let body;
  try {
    body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
  } catch {
    return res.status(400).json({ ok: false, error: 'Invalid JSON body' });
  }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  const language = String(body.language || 'English');
  const level = String(body.level || 'beginner');
  const uiLang = String(body.uiLang || 'uz');

  if (messages.length === 0) {
    return res.status(400).json({ ok: false, error: 'messages bo\'sh' });
  }

  // O'qituvchi shaxsi — til o'rganuvchiga moslashgan yordamchi
  const systemPrompt = `Sen Lingohub'ning sun'iy intellektli til o'qituvchisisiz.
O'quvchi hozir "${language}" tilini o'rganmoqda (daraja: ${level}).
Vazifang:
1. Har doim shu tilda javob ber — o'quvchi bilan "${language}" tilida muloqot qil.
2. Javoblarni qisqa va tushunarli qil (maksimal 3-4 gap).
3. O'quvchi xato qilsa — muloyimlik bilan tuzat, to'g'ri variantni ko'rsat va qisqacha izohla.
4. Yangi so'z yoki ibora bersa — ma'nosini, talaffuzini va bitta misol gapni yoz.
5. Grammatika savollariga sodda tilda javob ber.
6. Ruhlantirib tur — til o'rganish qiyin, lekin qiziqarli!
${uiLang === 'uz' ? 'O\'zbekcha tushuntirish ham kiritishing mumkin (qavs ichida), lekin asosiy matn o\'rganilayotgan tilda bo\'lsin.'
  : uiLang === 'ru' ? 'Можешь добавлять пояснения на русском (в скобках), но основной текст — на изучаемом языке.'
  : 'You may add short explanations in English in parentheses, but the main text should be in the target language.'}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 400,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('OpenAI error', response.status, errText.slice(0, 300));
      // 429 = limit, 401 = yaroqsiz kalit → frontend fallback'ga tushsin
      return res.status(200).json({ ok: false, fallback: true, error: `OpenAI xatosi: ${response.status}` });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return res.status(200).json({ ok: false, fallback: true, error: 'Bo\'sh javob' });
    }

    return res.status(200).json({ ok: true, reply, model: data.model || MODEL });
  } catch (e) {
    console.error('AI chat error:', e?.message);
    return res.status(200).json({ ok: false, fallback: true, error: e?.message || 'AI xatosi' });
  }
}
