// ==== SERTIFIKAT YUTISH LOGIKASI ====
// Foydalanuvchi holatidan (state) qaysi sertifikatlar yutilganini hisoblaydi.
// Har bir sertifikat: { id, type, title, subtitle, icon, color, lang?, percent?, level?, date }

import { languages, getLanguageStats } from '../data/languages';
import { CERT_TYPES, CEFR_CERTS, MILESTONES, STREAK_CERTS } from '../data/certificates';

function langProgress(langId, progress) {
  return getLanguageStats(langId, progress);
}

// Til uchun oxirgi faol dars sanasi
function lastLessonDate(langId, progress) {
  let max = 0;
  Object.entries(progress).forEach(([key, p]) => {
    if (key.startsWith(`${langId}-lesson-`) && p?.timestamp) max = Math.max(max, p.timestamp);
  });
  return max || null;
}

export function getEarnedCertificates(state) {
  const earned = [];
  const progress = state.progress || {};

  // 1. Kursni 100% tugatish
  languages.forEach((lang) => {
    const stats = langProgress(lang.id, progress);
    if (stats.percentage >= 100) {
      earned.push({
        id: `course-${lang.id}`,
        type: 'course',
        title: `${lang.flag} ${lang.name} — to'liq kurs`,
        subtitle: 'Tilni 100% natija bilan tugatdi',
        icon: CERT_TYPES.course.icon,
        color: CERT_TYPES.course.color,
        lang: lang.id,
        langName: lang.name,
        langFlag: lang.flag,
        percent: 100,
        date: lastLessonDate(lang.id, progress) || state.lastActive || Date.now(),
      });
    }
  });

  // 2. Kurs bosqichlari (100% dan past bo'lgan tillar uchun)
  languages.forEach((lang) => {
    const stats = langProgress(lang.id, progress);
    MILESTONES.forEach((m) => {
      if (stats.percentage >= m && stats.percentage < 100) {
        earned.push({
          id: `milestone-${lang.id}-${m}`,
          type: 'milestone',
          title: `${lang.flag} ${lang.name} — ${m}% bosqich`,
          subtitle: `Kursning ${m}% qismini yakunladi`,
          icon: CERT_TYPES.milestone.icon,
          color: CERT_TYPES.milestone.color,
          lang: lang.id,
          langName: lang.name,
          langFlag: lang.flag,
          percent: m,
          date: lastLessonDate(lang.id, progress) || state.lastActive || Date.now(),
        });
      }
    });
  });

  // 3. CEFR daraja sertifikatlari
  if (state.level) {
    const cefr = CEFR_CERTS.find((c) => c.level === state.level) || CEFR_CERTS[0];
    earned.push({
      id: `cefr-${state.level}`,
      type: 'cefr',
      title: `${state.level} daraja — ${cefr.label}`,
      subtitle: 'Daraja testini muvaffaqiyatli topshirdi',
      icon: cefr.icon,
      color: CERT_TYPES.cefr.color,
      level: state.level,
      date: state.lastActive || Date.now(),
    });
  }

  // 4. Streak sertifikatlari
  STREAK_CERTS.forEach((days) => {
    if ((state.streak || 0) >= days) {
      earned.push({
        id: `streak-${days}`,
        type: 'streak',
        title: `${days} kunlik streak`,
        subtitle: `${days} kun ketma-ket dars qildi`,
        icon: CERT_TYPES.streak.icon,
        color: CERT_TYPES.streak.color,
        days,
        date: state.lastActive || Date.now(),
      });
    }
  });

  return earned.sort((a, b) => b.date - a.date);
}

// Keyingi maqsadlar (hali yutilmagan) + progress
export function getCertGoals(state) {
  const progress = state.progress || {};
  const goals = [];

  // Eng yuqori til progressi
  let bestLang = null;
  let bestPercent = 0;
  languages.forEach((lang) => {
    const stats = langProgress(lang.id, progress);
    if (stats.percentage > bestPercent && stats.percentage < 100) {
      bestPercent = stats.percentage;
      bestLang = lang;
    }
  });

  if (bestLang) {
    MILESTONES.forEach((m) => {
      if (bestPercent < m) {
        goals.push({
          id: `goal-milestone-${bestLang.id}-${m}`,
          title: `${bestLang.flag} ${bestLang.name} — ${m}% bosqich`,
          progress: Math.min(100, Math.round((bestPercent / m) * 100)),
          current: `${bestPercent}%`,
          target: `${m}%`,
          icon: CERT_TYPES.milestone.icon,
          color: CERT_TYPES.milestone.color,
        });
      }
    });
    goals.push({
      id: `goal-course-${bestLang.id}`,
      title: `${bestLang.flag} ${bestLang.name} — to'liq kurs (100%)`,
      progress: bestPercent,
      current: `${bestPercent}%`,
      target: '100%',
      icon: CERT_TYPES.course.icon,
      color: CERT_TYPES.course.color,
    });
  }

  // Streak maqsadlari
  STREAK_CERTS.forEach((days) => {
    if ((state.streak || 0) < days) {
      goals.push({
        id: `goal-streak-${days}`,
        title: `${days} kunlik streak`,
        progress: Math.min(100, Math.round(((state.streak || 0) / days) * 100)),
        current: `${state.streak || 0} kun`,
        target: `${days} kun`,
        icon: CERT_TYPES.streak.icon,
        color: CERT_TYPES.streak.color,
      });
    }
  });

  // CEFR maqsadlari
  const levels = CEFR_CERTS.map((c) => c.level);
  const curIdx = state.level ? levels.indexOf(state.level) : -1;
  const next = levels[curIdx + 1];
  if (next) {
    const info = CEFR_CERTS.find((c) => c.level === next);
    goals.push({
      id: `goal-cefr-${next}`,
      title: `${next} daraja — ${info.label}`,
      progress: curIdx >= 0 ? 60 : 15,
      current: state.level || 'Test topshirmagan',
      target: next,
      icon: info.icon,
      color: CERT_TYPES.cefr.color,
    });
  } else if (state.level) {
    goals.push({
      id: 'goal-cefr-max',
      title: `B2 — eng yuqori daraja erishildi!`,
      progress: 100,
      current: state.level,
      target: 'B2',
      icon: '🏆',
      color: CERT_TYPES.cefr.color,
    });
  }

  return goals;
}
