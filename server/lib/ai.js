// ==== AI USTOZ — umumiy yordamchi (server-side) ====
// Telegram bot (telegram-webhook) va sayt (ai-chat) uchun bitta manba.
//
// Imkoniyatlar:
//   - askAI()      — OpenAI chaqiruvi (kalit yo'q bo'lsa null qaytadi)
//   - Xotira       — har bir chat uchun suhbat tarixi (Redis + xotira fallback)
//   - Mashq tili   — foydalanuvchi qaysi tilda o'rganayotganini eslab qoladi
//   - Quiz holati  — /test savol-javob holati
//   - Rate limit   — chat bo'yicha so'rov cheklovi (OpenAI xarajatidan himoya)
//   - teacherFallback() — OpenAI sozlanmagan bo'lsa tayyor "ustoz" javoblari
import { redis } from './redis.js';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const HISTORY_LIMIT = 12;   // har bir chatda saqlanadigan xabarlar soni

export function aiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

// ---------- OpenAI chaqiruvi ----------
// messages: [{role:'user'|'assistant', content}]  ·  systemPrompt: ustoz shaxsi
export async function askAI(messages, systemPrompt, maxTokens = 500) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !Array.isArray(messages) || messages.length === 0) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-HISTORY_LIMIT)],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

// ---------- Chat xotirasi (Redis + xotira) ----------
const memoryHistory = new Map(); // chatId -> [{role, content}]

function historyKey(chatId) {
  return `tg:ai:history:${chatId}`;
}

export async function getHistory(chatId) {
  const id = String(chatId);
  const mem = memoryHistory.get(id);
  if (Array.isArray(mem)) return mem;
  if (redis) {
    try {
      const raw = await redis.get(historyKey(id));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          memoryHistory.set(id, parsed);
          return parsed;
        }
      }
    } catch { /* noop */ }
  }
  return [];
}

export async function pushHistory(chatId, role, content) {
  const id = String(chatId);
  const history = await getHistory(id);
  history.push({ role, content });
  const trimmed = history.slice(-HISTORY_LIMIT);
  memoryHistory.set(id, trimmed);
  if (redis) {
    try {
      await redis.set(historyKey(id), JSON.stringify(trimmed), { ex: 3600 });
    } catch { /* noop */ }
  }
}

export async function resetHistory(chatId) {
  const id = String(chatId);
  memoryHistory.delete(id);
  if (redis) {
    try {
      await redis.del(historyKey(id));
    } catch { /* noop */ }
  }
}

// ---------- Mashq tili ----------
const memoryLangs = new Map(); // chatId -> til nomi

function langKey(chatId) {
  return `tg:ai:lang:${chatId}`;
}

export async function getPracticeLang(chatId) {
  const id = String(chatId);
  const mem = memoryLangs.get(id);
  if (mem) return mem;
  if (redis) {
    try {
      const saved = await redis.get(langKey(id));
      if (saved) {
        memoryLangs.set(id, saved);
        return saved;
      }
    } catch { /* noop */ }
  }
  return 'English';
}

export async function setPracticeLang(chatId, lang) {
  const id = String(chatId);
  memoryLangs.set(id, lang);
  if (redis) {
    try {
      await redis.set(langKey(id), lang, { ex: 86400 * 30 });
    } catch { /* noop */ }
  }
}

// ---------- Rejim (chat / translate) ----------
const memoryModes = new Map(); // chatId -> 'chat' | 'translate'

function modeKey(chatId) {
  return `tg:ai:mode:${chatId}`;
}

export async function getMode(chatId) {
  const id = String(chatId);
  if (memoryModes.has(id)) return memoryModes.get(id);
  if (redis) {
    try {
      const saved = await redis.get(modeKey(id));
      if (saved) {
        memoryModes.set(id, saved);
        return saved;
      }
    } catch { /* noop */ }
  }
  return 'chat';
}

export async function setMode(chatId, mode) {
  const id = String(chatId);
  memoryModes.set(id, mode);
  if (redis) {
    try {
      await redis.set(modeKey(id), mode, { ex: 3600 });
    } catch { /* noop */ }
  }
}

// ---------- Quiz holati (test savoli + to'g'ri javob) ----------
const memoryQuizzes = new Map(); // chatId -> { question, answer, options }

function quizKey(chatId) {
  return `tg:ai:quiz:${chatId}`;
}

export async function getQuiz(chatId) {
  const id = String(chatId);
  const mem = memoryQuizzes.get(id);
  if (mem) return mem;
  if (redis) {
    try {
      const raw = await redis.get(quizKey(id));
      if (raw) {
        const parsed = JSON.parse(raw);
        memoryQuizzes.set(id, parsed);
        return parsed;
      }
    } catch { /* noop */ }
  }
  return null;
}

export async function setQuiz(chatId, quiz) {
  const id = String(chatId);
  memoryQuizzes.set(id, quiz);
  if (redis) {
    try {
      await redis.set(quizKey(id), JSON.stringify(quiz), { ex: 1800 });
    } catch { /* noop */ }
  }
}

// ---------- Rate limit (chat bo'yicha) ----------
const memoryRates = new Map(); // chatId -> { count, at }
const RATE_LIMIT_WINDOW = 60;  // soniya
const RATE_LIMIT_MAX = 20;     // xabar / daqiqa / chat

export async function chatRateOk(chatId) {
  const id = String(chatId);
  const now = Date.now();
  const mem = memoryRates.get(id);
  if (!mem || now - mem.at > RATE_LIMIT_WINDOW * 1000) {
    memoryRates.set(id, { count: 1, at: now });
  } else {
    mem.count += 1;
    memoryRates.set(id, mem);
  }
  if (memoryRates.get(id).count > RATE_LIMIT_MAX) {
    return false;
  }
  if (redis) {
    try {
      const key = `tg:ai:rate:${id}`;
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, RATE_LIMIT_WINDOW);
      if (count > RATE_LIMIT_MAX) return false;
    } catch { /* fail-open */ }
  }
  return true;
}

// ---------- Ustoz shaxsi (system prompt) ----------
export function teacherSystemPrompt(langName, mode = 'chat') {
  if (mode === 'translate') {
    return `Sen Lingohub'ning tarjimon AI ustozisiz.
Foydalanuvchi matnni "${langName}" tiliga (yoki aksincha, kontekstdan aniqlab) tarjima qilishni so'raydi.
Vazifang:
1. Avval tarjimani yoz.
2. Keyin qisqacha (1-2 gap) izoh ber: kerakli so'zlar, talaffuz yoki grammatika.
3. Javobni tushunarli va qisqa qil.`;
  }
  return `Sen Lingohub'ning sun'iy intellektli til o'qituvchisisiz (AI ustoz).
O'quvchi "${langName}" tilini o'rganmoqda.
Vazifang:
1. Asosiy javobni "${langName}" tilida yoz — o'quvchi shu tilda mashq qiladi.
2. Javoblarni qisqa va tushunarli qil (maksimal 3-4 gap).
3. O'quvchi xato qilsa — muloyimlik bilan tuzat, to'g'ri variantni ko'rsat va qisqacha izohla.
4. Yangi so'z yoki ibora bersa — ma'nosini, talaffuzini va bitta misol gapni yoz.
5. Grammatika savollariga sodda tilda javob ber.
6. Ruhlantirib tur — til o'rganish qiyin, lekin qiziqarli!
O'zbekcha qisqa izoh (qavs ichida) qo'shishing mumkin, lekin asosiy matn o'rganilayotgan tilda bo'lsin.`;
}

// ---------- Fallback: OpenAI sozlanmagan bo'lsa ----------
// Oddiy, lekin foydali "ustoz" javoblari — sayt hech qachon "buzilmaydi".
export function teacherFallback(text, langName) {
  const msg = String(text || '').toLowerCase();
  const lang = langName || 'English';

  if (msg.includes('salom') || msg.includes('hello') || msg.includes('hi') || msg.includes('assalomu')) {
    return `Assalomu alaykum! 👋 Men sizning AI ustozingizman.\n\nKeling, ${lang} tilida mashq qilaylik! Savol berishingiz, so'z so'rashingiz yoki shunchaki suhbatlashishingiz mumkin. Nima bilan boshlaymiz?`;
  }
  if (msg.includes('tarjima') || msg.includes('translate')) {
    return `📝 Tarjima uchun: /tarjima so'z yoki gap — deb yozing.\n\nMasalan: /tarjima salom\n\n(Haqiqiy AI tarjimasi uchun serverda OPENAI_API_KEY sozlanishi kerak.)`;
  }
  if (msg.includes('dars') || msg.includes('lesson')) {
    return `📖 Dars olish uchun /dars buyrug'ini yuboring — ${lang} tilida qisqa dars olasiz.`;
  }
  if (msg.includes('test') || msg.includes('savol')) {
    return `✍️ Test qilish uchun /test buyrug'ini yuboring — ${lang} tilida savol beraman.`;
  }
  if (msg.includes('rahmat') || msg.includes('thank')) {
    return "Arzimaydi! 😊 Yana savolingiz bo'lsa, bemalol yozing. Muntazam mashq qilish — muvaffaqiyat kaliti! 🔥";
  }
  if (msg.includes('qanday') || msg.includes('how')) {
    return `Til o'rganishda eng muhimi — muntazamlik! 📅\n\n1️⃣ Har kuni kamida 10-15 daqiqa mashq qiling\n2️⃣ Yangi so'zlarni yozib boring\n3️⃣ ${lang} tilida ovoz chiqarib gapiring\n4️⃣ Xatolardan qo'rqmang — xato qilgan kishi o'rganadi!\n\nQaysi mavzudan boshlaymiz?`;
  }
  if (msg.includes('nima') || msg.includes('what')) {
    return `Men sizning AI til ustozingizman 🎓\n\nQila olaman:\n• ${lang} tilida suhbatlashish\n• Xatolaringizni tuzatish\n• So'z va iboralarni tushuntirish\n• Tarjima qilish (/tarjima)\n• Dars berish (/dars)\n• Test qilish (/test)\n\nQaysi birini sinab ko'ramiz?`;
  }

  const starters = [
    `Yaxshi savol! 💬 ${lang} tilida shunday deyiladi... Keling, birga o'rganamiz. Menga bir gap yozing — men tuzataman!`,
    `Ajoyib! ${lang} tilida ko'proq mashq qilaylik. "Mening oilam" mavzusida 2-3 gap yozib ko'ring.`,
    `Qiziqarli! ${lang} tilida buni ifodalash uchun quyidagi iborani ishlatishingiz mumkin. Yana bir misol keltiray: ... Endi siz yozib ko'ring!`,
    `Barakalla, davom eting! 💪 ${lang} tilida suhbatni davom ettiramiz. Bugungi mavzu: salomlashish va tanishish.`,
  ];
  return starters[Math.floor(Math.random() * starters.length)];
}
