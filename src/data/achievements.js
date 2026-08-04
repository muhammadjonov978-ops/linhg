export const achievements = [
  {
    id: 'first_lesson',
    name: 'Birinchi Qadam',
    description: 'Birinchi darsni tugating',
    icon: '🌱',
    coinReward: 50,
    condition: (stats) => stats.completedLessons >= 1,
  },
  {
    id: 'perfect_score',
    name: 'Mukammal Natija',
    description: 'Har qanday darsdan 100% oling',
    icon: '💎',
    coinReward: 100,
    condition: (stats) => stats.perfectScores >= 1,
  },
  {
    id: 'streak_3',
    name: 'Izchillik',
    description: "3 kun ketma-ket o'qing",
    icon: '🔥',
    coinReward: 150,
    condition: (stats) => stats.streak >= 3,
  },
  {
    id: 'streak_7',
    name: "Hafta Qahramoni",
    description: "7 kun ketma-ket o'qing",
    icon: '⭐',
    coinReward: 300,
    condition: (stats) => stats.streak >= 7,
  },
  {
    id: 'alphabet_done',
    name: 'Alifbo Ustasi',
    description: 'Barcha alifbo darslarini tugating',
    icon: '🔤',
    coinReward: 150,
    condition: (stats) => stats.alphabetCompleted >= 10,
  },
  {
    id: 'lessons_10',
    name: 'O\'rganuvchi',
    description: '10 ta darsni tugating',
    icon: '📚',
    coinReward: 100,
    condition: (stats) => stats.completedLessons >= 10,
  },
  {
    id: 'lessons_25',
    name: 'Bilimdon',
    description: '25 ta darsni tugating',
    icon: '🧠',
    coinReward: 200,
    condition: (stats) => stats.completedLessons >= 25,
  },
  {
    id: 'lessons_50',
    name: 'Tilshunos',
    description: '50 ta darsni tugating',
    icon: '🎓',
    coinReward: 350,
    condition: (stats) => stats.completedLessons >= 50,
  },
  {
    id: 'lessons_75',
    name: 'Poliglot',
    description: '75 ta darsni tugating',
    icon: '👑',
    coinReward: 500,
    condition: (stats) => stats.completedLessons >= 75,
  },
  {
    id: 'lessons_100',
    name: 'Til Ustasi',
    description: 'Barcha 100 ta darsni tugating!',
    icon: '🏆',
    coinReward: 1000,
    condition: (stats) => stats.completedLessons >= 100,
  },
  {
    id: 'xp_500',
    name: "Tanga Yig'uvchi",
    description: '500 tanga to\'plang',
    icon: '💰',
    coinReward: 200,
    condition: (stats) => stats.totalCoins >= 500,
  },
  {
    id: 'xp_1000',
    name: 'Tanga Ustasi',
    description: '1000 tanga to\'plang',
    icon: '💫',
    coinReward: 400,
    condition: (stats) => stats.totalCoins >= 1000,
  },
  {
    id: 'xp_5000',
    name: 'Tanga Legendasi',
    description: '5000 tanga to\'plang',
    icon: '🏆',
    coinReward: 1000,
    condition: (stats) => stats.totalCoins >= 5000,
  },
  {
    id: 'daily_7',
    name: 'Haftalik Qahramon',
    description: "7 ta kunlik topshiriqni bajaring",
    icon: '📅',
    coinReward: 200,
    condition: (stats) => stats.dailyChallengesDone >= 7,
  },
  {
    id: 'perfect_week',
    name: 'Mukammal Hafta',
    description: 'Bir haftada barcha kunlik topshiriqlarni bajaring',
    icon: '🌟',
    coinReward: 500,
    condition: (stats) => stats.perfectWeeks >= 1,
  },
  {
    id: 'mistakes_review',
    name: "Xatolardan O'rganuvchi",
    description: '10 ta xatoni ko\'rib chiqing',
    icon: '🔄',
    coinReward: 100,
    condition: (stats) => stats.mistakesReviewed >= 10,
  },
  {
    id: 'all_languages',
    name: 'Poliglot Master',
    description: 'Barcha 7 tildan dars qiling',
    icon: '🌍',
    coinReward: 500,
    condition: (stats) => stats.languagesStudied >= 7,
  },
];

export function checkNewAchievements(stats, currentAchievements) {
  const newAchievements = [];
  const unlockedIds = new Set(currentAchievements.filter(a => a.unlocked).map(a => a.id));

  achievements.forEach(achievement => {
    if (!unlockedIds.has(achievement.id) && achievement.condition(stats)) {
      newAchievements.push({
        ...achievement,
        unlocked: true,
        unlockedAt: Date.now(),
      });
    }
  });

  return newAchievements;
}

export function calculateStats(state) {
  let completedLessons = 0;
  let perfectScores = 0;
  let totalCoins = state.coins ?? state.xp ?? 0; // old 'xp' field fallback
  let alphabetCompleted = 0;
  let languagesStudied = new Set();

  Object.entries(state.progress).forEach(([key, prog]) => {
    if (!prog.completed) return;
    const langId = key.split('-')[0];
    const isLesson = key.includes('-lesson-');
    if (!isLesson) return;

    completedLessons++;
    languagesStudied.add(langId);

    // Check if alphabet lesson (lesson number <= 10)
    const lessonNum = parseInt(key.split('-lesson-')[1]);
    if (lessonNum <= 10) alphabetCompleted++;

    if (prog.score === 100) perfectScores++;
  });

  return {
    completedLessons,
    perfectScores,
    totalCoins,
    streak: state.streak || 0,
    alphabetCompleted,
    languagesStudied: languagesStudied.size,
    dailyChallengesDone: state.dailyChallenges?.challenges?.filter(c => c.completed).length || 0,
    perfectWeeks: state.perfectWeeks || 0,
    mistakesReviewed: state.mistakesReviewed || 0,
  };
}
