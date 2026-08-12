// ============================================================
// GET /api/daily/content?lang=english&level=beginner&uiLang=uz
// ============================================================
// "Kun so'zi" + kichik viktorina — OpenAI yordamida SERVERDA yaratiladi.
//
// - Har til va kun uchun BIR marta generatsiya qilinadi, Redis'da saqlanadi
//   (kun bo'yi hammaga bir xil so'z — adolatli va arzon).
// - OPENAI_API_KEY sozlanmagan bo'lsa — tayyor bazadan deterministik
//   tanlash ishlaydi (sayt hech qachon buzilmaydi).
//
// Javob: { ok, source: 'ai'|'fallback', word, meaning, example,
//          level, tip, quiz: { question, options[], answerIndex } }
import { redis } from '../lib/redis.js';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const RATE_LIMIT_WINDOW = 60; // soniya
const RATE_LIMIT_MAX = 20;    // so'rov / daqiqa / IP (ai-chat dan yumshoqroq)

// IP asosidagi tezlik chegarasi — OpenAI xarajatini suiiste'moldan himoya
async function rateLimitOk(ip) {
  if (!redis || !ip) return true;
  try {
    const key = `daily_rate:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, RATE_LIMIT_WINDOW);
    return count <= RATE_LIMIT_MAX;
  } catch {
    return true; // fail-open
  }
}

// ---------- FALLBACK SO'ZLAR BAZASI (har til uchun 8 ta) ----------
const FALLBACK_WORDS = {
  english: [
    { word: 'Serendipity', meaning: 'Kutilmagan baxtli hodisa', example: 'Finding that book was pure serendipity.', level: 'advanced', tip: 'Tasodifan kashf etilgan yaxshi narsa.' },
    { word: 'Resilient', meaning: 'Chidamli, tez tiklanuvchi', example: 'Children are remarkably resilient.', level: 'pre-intermediate', tip: 'Qiyinchilikdan keyin tez o\'rnidan turadi.' },
    { word: 'Curious', meaning: 'Qiziquvchan', example: 'I am curious about different cultures.', level: 'beginner', tip: 'Bilishni xohlaydigan odam.' },
    { word: 'Brilliant', meaning: 'Zo\'r, ajoyib, yorqin', example: 'That is a brilliant idea!', level: 'elementary', tip: 'Juda yaxshi, porloq g\'oya.' },
    { word: 'Harmony', meaning: 'Uyg\'unlik, ahillik', example: 'They live in harmony with nature.', level: 'pre-intermediate', tip: 'Tinchlik va kelishuv holati.' },
    { word: 'Generous', meaning: 'Saxiy, qo\'li ochiq', example: 'She is very generous with her time.', level: 'elementary', tip: 'Boshqalarga ko\'p beradigan.' },
    { word: 'Adventure', meaning: 'Sarguzasht', example: 'Life is an amazing adventure.', level: 'beginner', tip: 'Qiziqarli va xavfli sayohat.' },
    { word: 'Phenomenon', meaning: 'Hodisa, fenomen', example: 'The northern lights are a natural phenomenon.', level: 'advanced', tip: 'G\'ayrioddiy kuzatiladigan narsa.' },
  ],
  spanish: [
    { word: 'Aventura', meaning: 'Sarguzasht', example: 'La vida es una gran aventura.', level: 'beginner', tip: 'Hayot — bu katta sarguzasht.' },
    { word: 'Agradecido', meaning: 'Minnatdor', example: 'Estoy muy agradecido por tu ayuda.', level: 'pre-intermediate', tip: 'Rahmat aytadigan odam.' },
    { word: 'Esperanza', meaning: 'Umid', example: 'Nunca pierdas la esperanza.', level: 'elementary', tip: 'Yaxshilikka ishonish.' },
    { word: 'Sabiduría', meaning: 'Donolik', example: 'La sabiduría viene con la experiencia.', level: 'advanced', tip: 'Tajriba bilan keladigan bilim.' },
    { word: 'Hermoso', meaning: 'Go\'zal', example: 'El atardecer es muy hermoso.', level: 'elementary', tip: 'Juda chiroyli.' },
    { word: 'Felicidad', meaning: 'Baxt', example: 'La felicidad está en las cosas simples.', level: 'elementary', tip: 'Sodda narsalarda baxt bor.' },
    { word: 'Amistad', meaning: 'Do\'stlik', example: 'La amistad es un tesoro.', level: 'pre-intermediate', tip: 'Do\'stlik — xazina.' },
    { word: 'Sueño', meaning: 'Orzu / Tush', example: 'Sigue tus sueños.', level: 'beginner', tip: 'Orzuingga ergash.' },
  ],
  french: [
    { word: 'Bonheur', meaning: 'Baxt', example: 'Le bonheur est dans les petites choses.', level: 'elementary', tip: 'Baxt kichik narsalarda.' },
    { word: 'Liberté', meaning: 'Erkinlik', example: 'La liberté est précieuse.', level: 'pre-intermediate', tip: 'Erkinlik qadrlidir.' },
    { word: 'Aventure', meaning: 'Sarguzasht', example: 'La vie est une aventure.', level: 'beginner', tip: 'Hayot — sarguzasht.' },
    { word: 'Sagesse', meaning: 'Donolik', example: 'La sagesse vient avec l\'âge.', level: 'advanced', tip: 'Donolik yosh bilan keladi.' },
    { word: 'Amour', meaning: 'Sevgi', example: 'L\'amour est partout.', level: 'beginner', tip: 'Sevgi hamma joyda.' },
    { word: 'Élégance', meaning: 'Nafislik', example: 'Elle danse avec élégance.', level: 'advanced', tip: 'Nafis harakat.' },
    { word: 'Chance', meaning: 'Omad', example: 'Bonne chance !', level: 'elementary', tip: 'Omad tilayman!' },
    { word: 'Rêve', meaning: 'Orzu', example: 'Poursuis tes rêves.', level: 'pre-intermediate', tip: 'Orzularingga intil.' },
  ],
  german: [
    { word: 'Freiheit', meaning: 'Erkinlik', example: 'Freiheit ist ein Grundrecht.', level: 'pre-intermediate', tip: 'Erkinlik — asosiy huquq.' },
    { word: 'Glück', meaning: 'Baxt', example: 'Glück ist, was man teilt.', level: 'elementary', tip: 'Baxt — bo\'lishishdir.' },
    { word: 'Abenteuer', meaning: 'Sarguzasht', example: 'Das Leben ist ein Abenteuer.', level: 'beginner', tip: 'Hayot — sarguzasht.' },
    { word: 'Freundschaft', meaning: 'Do\'stlik', example: 'Freundschaft ist wichtig.', level: 'elementary', tip: 'Do\'stlik muhim.' },
    { word: 'Hoffnung', meaning: 'Umid', example: 'Die Hoffnung stirbt zuletzt.', level: 'pre-intermediate', tip: 'Umid oxirgi o\'ladi.' },
    { word: 'Weisheit', meaning: 'Donolik', example: 'Weisheit kommt mit Erfahrung.', level: 'advanced', tip: 'Donolik tajriba bilan keladi.' },
    { word: 'Träume', meaning: 'Orzular', example: 'Folge deinen Träumen.', level: 'elementary', tip: 'Orzularingga ergash.' },
    { word: 'Mut', meaning: 'Jasorat', example: 'Mut ist, Angst zu überwinden.', level: 'pre-intermediate', tip: 'Jasorat — qo\'rquvni yengish.' },
  ],
  italian: [
    { word: 'Amicizia', meaning: 'Do\'stlik', example: 'L\'amicizia è un tesoro.', level: 'elementary', tip: 'Do\'stlik — xazina.' },
    { word: 'Avventura', meaning: 'Sarguzasht', example: 'La vita è un\'avventura.', level: 'beginner', tip: 'Hayot — sarguzasht.' },
    { word: 'Bellezza', meaning: 'Go\'zallik', example: 'La bellezza è ovunque.', level: 'pre-intermediate', tip: 'Go\'zallik hamma joyda.' },
    { word: 'Speranza', meaning: 'Umid', example: 'Non perdere mai la speranza.', level: 'pre-intermediate', tip: 'Hech qachon umidni yo\'qotma.' },
    { word: 'Saggezza', meaning: 'Donolik', example: 'La saggezza viene con l\'età.', level: 'advanced', tip: 'Donolik yosh bilan keladi.' },
    { word: 'Amore', meaning: 'Sevgi', example: 'L\'amore vince tutto.', level: 'beginner', tip: 'Sevgi hamma narsani yengadi.' },
    { word: 'Felicità', meaning: 'Baxt', example: 'La felicità è semplice.', level: 'elementary', tip: 'Baxt — sodda narsa.' },
    { word: 'Sogno', meaning: 'Orzu', example: 'Segui i tuoi sogni.', level: 'beginner', tip: 'Orzularingga ergash.' },
  ],
  portuguese: [
    { word: 'Amizade', meaning: 'Do\'stlik', example: 'A amizade é um presente.', level: 'elementary', tip: 'Do\'stlik — sovg\'a.' },
    { word: 'Aventura', meaning: 'Sarguzasht', example: 'A vida é uma aventura.', level: 'beginner', tip: 'Hayot — sarguzasht.' },
    { word: 'Beleza', meaning: 'Go\'zallik', example: 'A beleza está nos olhos de quem vê.', level: 'pre-intermediate', tip: 'Go\'zallik ko\'ruvchining ko\'zida.' },
    { word: 'Esperança', meaning: 'Umid', example: 'A esperança é a última que morre.', level: 'elementary', tip: 'Umid oxirgi o\'ladi.' },
    { word: 'Conhecimento', meaning: 'Bilim', example: 'O conhecimento liberta.', level: 'advanced', tip: 'Bilim ozod qiladi.' },
    { word: 'Sonho', meaning: 'Orzu', example: 'Siga os seus sonhos.', level: 'beginner', tip: 'Orzularingga ergash.' },
    { word: 'Felicidade', meaning: 'Baxt', example: 'A felicidade está nas pequenas coisas.', level: 'elementary', tip: 'Baxt kichik narsalarda.' },
    { word: 'Coragem', meaning: 'Jasorat', example: 'A coragem move montanhas.', level: 'pre-intermediate', tip: 'Jasorat tog\'larni ko\'chiradi.' },
  ],
  russian: [
    { word: 'Дружба', meaning: 'Do\'stlik', example: 'Дружба — это великая сила.', level: 'elementary', tip: 'Do\'stlik — buyuk kuch.' },
    { word: 'Приключение', meaning: 'Sarguzasht', example: 'Жизнь — это приключение.', level: 'beginner', tip: 'Hayot — sarguzasht.' },
    { word: 'Красота', meaning: 'Go\'zallik', example: 'Красота спасёт мир.', level: 'pre-intermediate', tip: 'Go\'zallik dunyoni qutqaradi.' },
    { word: 'Надежда', meaning: 'Umid', example: 'Никогда не теряй надежду.', level: 'elementary', tip: 'Hech qachon umidni yo\'qotma.' },
    { word: 'Мудрость', meaning: 'Donolik', example: 'Мудрость приходит с опытом.', level: 'advanced', tip: 'Donolik tajriba bilan keladi.' },
    { word: 'Любовь', meaning: 'Sevgi', example: 'Любовь побеждает всё.', level: 'beginner', tip: 'Sevgi hammasini yengadi.' },
    { word: 'Счастье', meaning: 'Baxt', example: 'Счастье — в простых вещах.', level: 'elementary', tip: 'Baxt sodda narsalarda.' },
    { word: 'Мечта', meaning: 'Orzu', example: 'Следуй за своей мечтой.', level: 'beginner', tip: 'Orzuingga ergash.' },
  ],
};

// Barcha tillar uchun umumiy fallback (mavjud bo'lmagan tillarda)
const FALLBACK_GENERIC = FALLBACK_WORDS.english;

// Deterministik tanlash: sana + til asosida
function pickFallback(lang, today) {
  const list = FALLBACK_WORDS[lang] || FALLBACK_GENERIC;
  const seed = (today + lang).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return list[Math.abs(seed) % list.length];
}

// OpenAI orqali so'z + viktorina yaratish
async function generateWithAI(lang, level, uiLang) {
  const apiKey = process.env.OPENAI_API_KEY || '';
  if (!apiKey) return null;

  const langName = lang === 'english' ? 'English' : lang === 'spanish' ? 'Spanish' : lang === 'french' ? 'French'
    : lang === 'german' ? 'German' : lang === 'italian' ? 'Italian' : lang === 'portuguese' ? 'Portuguese'
    : lang === 'russian' ? 'Russian' : lang;

  const explainLang = uiLang === 'uz' ? "o'zbekcha" : uiLang === 'ru' ? 'na russkom' : 'in English';

  const prompt = `Berilgan til uchun "kun so'zi" yarat. Til: ${langName}. Daraja: ${level || 'beginner'}.

FAQAT quyidagi JSON formatda javob ber (boshqa matn yo'q):
{
  "word": "so'z",
  "meaning": "ma'nosi (${explainLang})",
  "example": "shu so'z ishtirokida bitta misol gap",
  "level": "daraja (beginner/elementary/pre-intermediate/advanced)",
  "tip": "qisqa foydali maslahat (${explainLang})",
  "quiz": {
    "question": "so'z ma'nosi haqida savol (${explainLang})",
    "options": ["3 ta variant + 1 to'g'ri, jami 4 ta"],
    "answerIndex": 0
  }
}
So'z o'rganilayotgan tilda bo'lsin, izohlar ${explainLang}. So'z 8 dan ortiq harf bo'lmasin, kundalik hayotda foydali bo'lsin.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: prompt }],
        max_tokens: 400,
        temperature: 0.9,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) return null;

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) return null;
    const parsed = JSON.parse(content);

    // Sanitize: quiz 4 variant va answerIndex bo'lishi shart
    const options = Array.isArray(parsed.quiz?.options) ? parsed.quiz.options.slice(0, 4) : [];
    if (options.length < 2) return null;
    let answerIndex = Number(parsed.quiz?.answerIndex);
    if (!Number.isFinite(answerIndex) || answerIndex < 0 || answerIndex >= options.length) answerIndex = 0;

    return {
      word: String(parsed.word || '').slice(0, 40),
      meaning: String(parsed.meaning || '').slice(0, 120),
      example: String(parsed.example || '').slice(0, 200),
      level: String(parsed.level || level || 'beginner'),
      tip: String(parsed.tip || '').slice(0, 200),
      quiz: { question: String(parsed.quiz?.question || '').slice(0, 200), options, answerIndex },
    };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const lang = String(req.query?.lang || 'english').slice(0, 20);
  const level = String(req.query?.level || 'beginner').slice(0, 20);
  const uiLang = String(req.query?.uiLang || 'uz').slice(0, 2);
  const today = new Date().toISOString().slice(0, 10);
  // uiLang kesh kalitida — turli tildagi izohlar aralashib ketmasligi uchun
  const cacheKey = `lh:daily:${today}:${lang}:${level}:${uiLang}`;

  // IP tezlik chegarasi
  const ip = String(req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const allowed = await rateLimitOk(ip);
  if (!allowed) {
    return res.status(429).json({ ok: false, fallback: true, error: "Juda ko'p so'rov — birozdan keyin qayta urinib ko'ring" });
  }

  // 1) Keshdan o'qish (kun bo'yi hammaga bir xil)
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        return res.status(200).json({ ok: true, source: parsed.source || 'cache', ...parsed });
      }
    } catch { /* noop */ }
  }

  // 2) AI yordamida yaratish (muvaffaqiyatli bo'lsa — keshlaymiz)
  const ai = await generateWithAI(lang, level, uiLang);
  if (ai) {
    const payload = { ...ai, source: 'ai' };
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(payload), { ex: 60 * 60 * 26 }).catch(() => {});
    }
    return res.status(200).json({ ok: true, ...payload });
  }

  // 3) Fallback: tayyor bazadan — viktorina variantlari ham bazadan olinadi
  const fb = pickFallback(lang, today);
  const list = FALLBACK_WORDS[lang] || FALLBACK_GENERIC;
  // To'g'ri javob + shu tildagi boshqa so'zlarning ma'nolari (turlicha bo'lishi kerak)
  const others = list
    .filter((w) => w.word !== fb.word && w.meaning !== fb.meaning)
    .map((w) => w.meaning);
  const options = [fb.meaning, ...others].slice(0, 4);
  // Aralashtirish — to'g'ri javob pozitsiyasi deterministik (sana asosida)
  const seed = (today + lang).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const answerIndex = Math.abs(seed) % options.length;
  const shuffled = [...options];
  const correct = shuffled[0];
  shuffled[0] = shuffled[answerIndex];
  shuffled[answerIndex] = correct;
  const quiz = {
    question: `"${fb.word}" so'zi nimani anglatadi?`,
    options: shuffled,
    answerIndex,
  };
  return res.status(200).json({ ok: true, source: 'fallback', ...fb, quiz });
}
