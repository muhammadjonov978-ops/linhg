// ==== FLASHCARD SRS (Spaced Repetition) ====
// Kartalar til darslaridan avtomatik yaratiladi (alifbo harflari + so'zlar).
// Leitner box usuli: har bir karta qutida turadi, muvaffaqiyatga qarab
// keyingi qutiga o'tadi (takrorlash oralig'i oshadi).
//
//  Box | Takrorlash oralig'i
//   0  | yangi / bugun (yana)
//   1  | 1 kun
//   2  | 2 kun
//   3  | 4 kun
//   4  | 7 kun
//   5  | 15 kun

import { getLessons } from '../data/languages';

const STORAGE_PREFIX = 'lingohub_flashcards_';

// Leitner qutilaridagi kun oralig'lari (box indeksi bo'yicha)
export const BOX_INTERVALS = [0, 1, 2, 4, 7, 15];
export const MAX_BOX = BOX_INTERVALS.length - 1;

export const RATINGS = {
  again: { label: 'Yana', interval: 0, boxDelta: -1, emoji: '🔁' },
  hard: { label: 'Qiyin', interval: 0.5, boxDelta: 0, emoji: '😅' },
  good: { label: 'Bilaman', interval: 1, boxDelta: 1, emoji: '👍' },
  easy: { label: 'Oson', interval: 1.5, boxDelta: 2, emoji: '🚀' },
};

// Bir til uchun karta to'plamini darslardan yig'adi.
// Alifbo harflari (letter → example) va so'z darslari (word → ma'no).
export function buildDeck(langId) {
  const lessons = getLessons(langId);
  const seen = new Set();
  const cards = [];

  lessons.forEach((lesson) => {
    if (lesson.type === 'alphabet' && lesson.content?.letters?.length) {
      lesson.content.letters.forEach((l) => {
        const front = l.letter;
        const key = `a:${front}`;
        if (seen.has(key)) return;
        seen.add(key);
        cards.push({
          id: key,
          front,
          back: l.example,
          backUz: l.exampleUz || '',
          pronunciation: l.pronunciation || '',
          kind: 'letter',
        });
      });
      return;
    }
    // Oddiy darslar: "word" so'zining ma'nosi nima? → options[correctAnswer]
    const ex = lesson.exercise;
    if (!ex || !Array.isArray(ex.options)) return;
    const m = String(ex.question || '').match(/"([^"]+)"/);
    const front = m ? m[1] : null;
    const back = ex.options[ex.correctAnswer];
    if (!front || !back) return;
    const key = `w:${front.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    cards.push({ id: key, front, back, backUz: '', pronunciation: '', kind: 'word' });
  });

  return cards;
}

// ===== localStorage SRS holati =====
function storageKey(langId) {
  return `${STORAGE_PREFIX}${langId}`;
}

export function loadSrs(langId) {
  try {
    const raw = localStorage.getItem(storageKey(langId));
    if (!raw) return { cards: {}, updatedAt: Date.now() };
    const parsed = JSON.parse(raw);
    return {
      cards: parsed.cards || {},
      updatedAt: parsed.updatedAt || Date.now(),
    };
  } catch {
    return { cards: {}, updatedAt: Date.now() };
  }
}

export function saveSrs(langId, srs) {
  try {
    localStorage.setItem(storageKey(langId), JSON.stringify({ ...srs, updatedAt: Date.now() }));
  } catch {
    /* ignore */
  }
}

// SRS ma'lumotini yangi kartalar bilan to'ldiradi (darslar o'zgarsa ham ishlaydi)
export function mergeDeckInto(srs, deck) {
  const cards = { ...(srs.cards || {}) };
  let changed = false;
  deck.forEach((card) => {
    if (!cards[card.id]) {
      cards[card.id] = { box: 0, due: 0, lapses: 0, reviews: 0, lastReviewed: null };
      changed = true;
    }
  });
  return changed ? { ...srs, cards } : srs;
}

// Bugungi sana (kun boshida) — ms
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// Takrorlanishi kerak bo'lgan kartalar (due <= hozir), box bo'yicha tartiblangan
export function getDueCards(deck, srs) {
  const now = Date.now();
  return deck
    .map((card) => ({ card, meta: srs.cards[card.id] }))
    .filter(({ meta }) => !meta || meta.due <= now)
    .sort((a, b) => (a.meta?.box || 0) - (b.meta?.box || 0));
}

// Karta baholandi — keyingi quti va muddatini hisoblaydi
export function rateCard(srs, cardId, rating) {
  const ratingMeta = RATINGS[rating] || RATINGS.good;
  const old = srs.cards[cardId] || { box: 0, due: 0, lapses: 0, reviews: 0, lastReviewed: null };
  const now = Date.now();

  let box = old.box + ratingMeta.boxDelta;
  if (box < 0) box = 0;
  if (box > MAX_BOX) box = MAX_BOX;

  const intervalDays = rating === 'again' ? 0 : BOX_INTERVALS[box];
  const due = now + intervalDays * 24 * 60 * 60 * 1000;
  const lapses = old.lapses + (rating === 'again' ? 1 : 0);

  return {
    ...srs,
    cards: {
      ...srs.cards,
      [cardId]: {
        box,
        due,
        lapses,
        reviews: old.reviews + 1,
        lastReviewed: now,
      },
    },
  };
}

// Statistikalar
export function getSrsStats(deck, srs) {
  const cards = srs.cards || {};
  const known = deck.filter((c) => {
    const m = cards[c.id];
    return m && m.box >= 2;
  }).length;
  const learning = deck.filter((c) => {
    const m = cards[c.id];
    return m && m.box === 1;
  }).length;
  const newCards = deck.filter((c) => !cards[c.id] || cards[c.id].box === 0).length;
  const due = getDueCards(deck, srs).length;
  const today = startOfToday();
  const reviewedToday = Object.values(cards).filter((m) => m.lastReviewed >= today).length;
  return {
    total: deck.length,
    known,
    learning,
    newCards,
    due,
    reviewedToday,
    boxes: BOX_INTERVALS.map((_, i) => deck.filter((c) => (cards[c.id]?.box || 0) === i).length),
  };
}

export function resetSrs(langId) {
  try {
    localStorage.removeItem(storageKey(langId));
  } catch {
    /* ignore */
  }
}
