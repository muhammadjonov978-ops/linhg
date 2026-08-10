// ==== KUNLIK VA HAFTALIK MISSIYALAR ====
// check(state) funksiyalari hozirgi holatga qarab bajarilganlikni tekshiradi.
// Natijalar localStorage'da (lingohub_missions_) saqlanadi.

import { loadSrs } from '../lib/flashcards';

const DAY_MS = 86400000;

function completedToday(state) {
  const now = Date.now();
  return Object.values(state.progress).some(
    (p) => p.timestamp && now - p.timestamp < DAY_MS && p.completed
  );
}

function lessonsTotal(state) {
  return Object.values(state.progress).filter((p) => p.completed).length;
}

function perfectScores(state) {
  return Object.values(state.progress).filter((p) => p.score >= 90).length;
}

function cardsReviewedToday(langId) {
  try {
    if (!langId) return 0;
    const srs = loadSrs(langId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Object.values(srs.cards || {}).filter((m) => m.lastReviewed >= today.getTime()).length;
  } catch {
    return 0;
  }
}

// Kunlik missiyalar ro'yxati
export const DAILY_MISSIONS = [
  {
    id: 'd-lessons-3',
    icon: '📝',
    title: 'Faol o\'quvchi',
    desc: 'Bugun 3 ta darsni tugating',
    reward: 40,
    check: (state) => {
      const now = Date.now();
      return Object.values(state.progress).filter(
        (p) => p.completed && p.timestamp && now - p.timestamp < DAY_MS
      ).length >= 3;
    },
  },
  {
    id: 'd-perfect',
    icon: '🎯',
    title: 'Aniqlik',
    desc: 'Har qanday darsdan 90%+ natija oling',
    reward: 50,
    check: (state) => Object.values(state.progress).some((p) => p.score >= 90),
  },
  {
    id: 'd-flashcards',
    icon: '🧠',
    title: 'Flashcard ustasi',
    desc: 'Bugun 10 ta kartani takrorlang',
    reward: 45,
    check: (state) => cardsReviewedToday(state.selectedLanguage) >= 10,
  },
  {
    id: 'd-tutor',
    icon: '🤖',
    title: 'AI bilan suhbat',
    desc: 'AI Tutor bilan kamida 3 xabar almashing',
    reward: 35,
    check: (state) => state.tutorMessages.length >= 3,
  },
  {
    id: 'd-streak',
    icon: '🔥',
    title: 'Streak saqlash',
    desc: 'Bugun kamida 1 ta dars bajaring',
    reward: 25,
    check: (state) => completedToday(state),
  },
  {
    id: 'd-mistakes',
    icon: '🔁',
    title: 'Xatolardan o\'rganish',
    desc: 'Xatolarni qayta ko\'rib chiqing',
    reward: 30,
    check: (state) => (state.mistakesReviewed || 0) >= 1,
  },
];

// Haftalik missiyalar
export const WEEKLY_MISSIONS = [
  {
    id: 'w-lessons-15',
    icon: '🚀',
    title: 'Hafta marafoni',
    desc: 'Haftada 15 ta dars tugating',
    reward: 150,
    check: (state) => lessonsTotal(state) >= 15,
  },
  {
    id: 'w-perfect-3',
    icon: '🏅',
    title: 'Uch karra a\'lo',
    desc: '3 ta darsdan 90%+ natija oling',
    reward: 100,
    check: (state) => perfectScores(state) >= 3,
  },
  {
    id: 'w-all-types',
    icon: '🎼',
    title: 'Ko\'nikma kengligi',
    desc: 'Haftada 8 ta dars tugating',
    reward: 120,
    check: (state) => {
      const now = Date.now();
      return Object.values(state.progress).filter(
        (p) => p.completed && p.timestamp && now - p.timestamp < 7 * DAY_MS
      ).length >= 8;
    },
  },
  {
    id: 'w-flashcards-50',
    icon: '🗂️',
    title: 'Karta kolleksiyasi',
    desc: 'Haftada 50 ta kartani takrorlang',
    reward: 130,
    check: (state) => {
      try {
        if (!state.selectedLanguage) return false;
        const srs = loadSrs(state.selectedLanguage);
        const weekAgo = Date.now() - 7 * DAY_MS;
        return Object.values(srs.cards || {}).filter((m) => m.lastReviewed >= weekAgo).length >= 50;
      } catch {
        return false;
      }
    },
  },
  {
    id: 'w-grammar',
    icon: '📐',
    title: 'Grammatika muxlisi',
    desc: '2 ta grammatika darsini o\'zlashtiring',
    reward: 110,
    check: (state) =>
      Object.entries(state.progress).filter(([k, p]) => k.includes('-grammar-') && p.completed).length >= 2,
  },
  {
    id: 'w-gift',
    icon: '🎁',
    title: 'Mehmondo\'st',
    desc: 'Do\'stingizga saytni taklif qiling',
    reward: 60,
    check: () => {
      try {
        return JSON.parse(localStorage.getItem('lingohub_ref_invites') || '0') >= 1;
      } catch {
        return false;
      }
    },
  },
];

