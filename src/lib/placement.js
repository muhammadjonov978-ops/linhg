// ==== DARAJA TESTI (Placement Test) ====
// Foydalanuvchi birinchi kirganda 15 savollik testdan o'tadi:
// savollar til darslaridagi so'zlar boyligidan olinadi (har bir til uchun
// avtomatik), qiyinligi dars raqami ortishi bilan oshadi.
// Natija CEFR darajasiga (A1–C1) moslanadi va state.level da saqlanadi.

import { getLessons } from '../data/languages';

export const CEFR_LEVELS = [
  { id: 'A1', label: 'Boshlang\'ich', icon: '🌱', description: 'Siz oddiy so\'z va iboralarni bilasiz.' },
  { id: 'A2', label: 'Elementar', icon: '🌿', description: 'Kundalik mavzularda sodda gaplarni tushunasiz.' },
  { id: 'B1', label: 'O\'rta', icon: '🌳', description: 'Sayohat, ish va o\'qishda erkin gaplasha olasiz.' },
  { id: 'B2', label: 'O\'rta yuqori', icon: '🌲', description: 'Murakkab matnlarni tushunasiz va erkin fikr bildirasiz.' },
  { id: 'C1', label: 'Yuqori', icon: '🏆', description: 'Tilni deyarli erkin egalaysiz.' },
];

// Test uchun savollar yig'adi: 15 ta so'z, qiyinligi oshib boradi.
// Darslardagi so'zlar { q, o, c } formatida — turli darslardan tanlab olinadi.
export function buildPlacementQuestions(langId) {
  const lessons = getLessons(langId);
  // Faqat so'z savollari bo'lgan darslarni olamiz (alifbo emas)
  const wordLessons = lessons.filter((l) => l.type !== 'alphabet' && l.exercise && Array.isArray(l.exercise.options));

  if (wordLessons.length === 0) {
    return Array.from({ length: 15 }, (_, i) => ({
      index: i,
      lessonNum: 1,
      word: 'hello',
      options: ['Salom', 'Xayr', 'Rahmat', 'Iltimos'],
      correct: 0,
    }));
  }

  // Dars raqamlarini qiyinlik bo'yicha taqsimlaymiz: [1-15], [16-30], [31-50], [51+]
  const tiers = [
    wordLessons.filter((l) => l.number <= 15),
    wordLessons.filter((l) => l.number > 15 && l.number <= 30),
    wordLessons.filter((l) => l.number > 30 && l.number <= 50),
    wordLessons.filter((l) => l.number > 50),
  ];

  const pickFrom = (tier, count, seed) => {
    if (!tier.length) return [];
    const picked = [];
    const used = new Set();
    let attempts = 0;
    while (picked.length < count && attempts < tier.length * 3) {
      attempts++;
      const idx = (seed + picked.length * 13 + attempts * 7) % tier.length;
      if (used.has(idx)) continue;
      used.add(idx);
      const lesson = tier[idx];
      const ex = lesson.exercise;
      const word = ex.question.match(/"([^"]+)"/)?.[1] || '';
      if (!word) continue;
      picked.push({
        index: picked.length,
        lessonNum: lesson.number,
        word,
        options: [...ex.options],
        correct: ex.correctAnswer,
      });
    }
    return picked;
  };

  // Savollarni 4 bosqichga bo'lamiz: 4+4+4+3
  const seed = langId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return [
    ...pickFrom(tiers[0], 4, seed),
    ...pickFrom(tiers[1], 4, seed + 3),
    ...pickFrom(tiers[2], 4, seed + 6),
    ...pickFrom(tiers[3], 3, seed + 9),
  ].slice(0, 15);
}

// Javoblarni baholaydi → CEFR daraja
export function gradePlacement(answers) {
  const correct = answers.filter((a) => a.selected === a.correct).length;
  let level = 'A1';
  if (correct >= 14) level = 'C1';
  else if (correct >= 11) level = 'B2';
  else if (correct >= 8) level = 'B1';
  else if (correct >= 4) level = 'A2';
  return { correct, total: answers.length, level, percent: Math.round((correct / answers.length) * 100) };
}

export function getCefrInfo(levelId) {
  return CEFR_LEVELS.find((l) => l.id === levelId) || CEFR_LEVELS[0];
}
