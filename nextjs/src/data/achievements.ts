import type { AppState } from '../context/AppContext';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  coinReward: number;
  xpReward?: number; // legacy field
  condition: (stats: Stats) => boolean;
  unlocked?: boolean;
  justUnlocked?: boolean;
  unlockedAt?: number;
}

export interface Stats {
  totalExercises: number;
  perfectScores: number;
  completedLevels: number;
  totalCoins: number;
  streak: number;
  skillsMastered: number;
  readingCount: number;
  listeningCount: number;
  writingCount: number;
  speakingCount: number;
  languagesStudied: number;
  dailyChallengesDone: number;
  perfectWeeks: number;
  mistakesReviewed: number;
}

export const achievements: Achievement[] = [
  {
    id: 'first_exercise',
    name: 'Birinchi Qadam',
    description: 'Birinchi mashqni bajaring',
    icon: '🌱',
    coinReward: 50,
    condition: (stats) => stats.totalExercises >= 1,
  },
  {
    id: 'perfect_score',
    name: 'Mukammal Natija',
    description: "Har qanday mashqdan 100% oling",
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
    name: 'Hafta Qahramoni',
    description: "7 kun ketma-ket o'qing",
    icon: '⭐',
    coinReward: 300,
    condition: (stats) => stats.streak >= 7,
  },
  {
    id: 'level_beginner',
    name: 'Boshlovchi',
    description: 'Beginner darajasini tugating',
    icon: '🎯',
    coinReward: 100,
    condition: (stats) => stats.completedLevels >= 1,
  },
  {
    id: 'level_elementary',
    name: "O'rganuvchi",
    description: 'Elementary darajasini tugating',
    icon: '📚',
    coinReward: 200,
    condition: (stats) => stats.completedLevels >= 2,
  },
  {
    id: 'level_intermediate',
    name: 'Bilimdon',
    description: 'Pre-Intermediate darajasini tugating',
    icon: '🧠',
    coinReward: 300,
    condition: (stats) => stats.completedLevels >= 3,
  },
  {
    id: 'level_advanced',
    name: 'Poliglot',
    description: 'Advanced darajasini tugating',
    icon: '👑',
    coinReward: 500,
    condition: (stats) => stats.completedLevels >= 4,
  },
  {
    id: 'skills_master',
    name: "Ko'nikma Ustasi",
    description: 'Barcha 4 ko\'nikmadan 80%+ oling',
    icon: '🎭',
    coinReward: 250,
    condition: (stats) => stats.skillsMastered >= 4,
  },
  {
    id: 'xp_500',
    name: 'XP Yig\'uvchi',
    description: '500 XP to\'plang',
    icon: '💰',
    coinReward: 200,
    condition: (stats) => stats.totalCoins >= 500,
  },
  {
    id: 'xp_1000',
    name: 'XP Ustasi',
    description: '1000 XP to\'plang',
    icon: '💫',
    coinReward: 400,
    condition: (stats) => stats.totalCoins >= 1000,
  },
  {
    id: 'xp_5000',
    name: 'XP Legendasi',
    description: '5000 XP to\'plang',
    icon: '🏆',
    coinReward: 1000,
    condition: (stats) => stats.totalCoins >= 5000,
  },
  {
    id: 'reading_10',
    name: 'Kitobxon',
    description: '10 ta reading mashqini bajaring',
    icon: '📖',
    coinReward: 150,
    condition: (stats) => stats.readingCount >= 10,
  },
  {
    id: 'listening_10',
    name: 'Tinglovchi',
    description: '10 ta listening mashqini bajaring',
    icon: '🎧',
    coinReward: 150,
    condition: (stats) => stats.listeningCount >= 10,
  },
  {
    id: 'writing_10',
    name: 'Yozuvchi',
    description: '10 ta writing mashqini bajaring',
    icon: '✍️',
    coinReward: 150,
    condition: (stats) => stats.writingCount >= 10,
  },
  {
    id: 'speaking_10',
    name: 'Notiq',
    description: '10 ta speaking mashqini bajaring',
    icon: '🎤',
    coinReward: 150,
    condition: (stats) => stats.speakingCount >= 10,
  },
  {
    id: 'all_languages',
    name: 'Poliglot Master',
    description: 'Barcha 7 tildan mashq qiling',
    icon: '🌍',
    coinReward: 500,
    condition: (stats) => stats.languagesStudied >= 7,
  },
  {
    id: 'daily_7',
    name: 'Haftalik Qahramon',
    description: '7 ta kunlik topshiriqni bajaring',
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
    name: 'Xatolardan O\'rganuvchi',
    description: '10 ta xatoni ko\'rib chiqing',
    icon: '🔄',
    coinReward: 100,
    condition: (stats) => stats.mistakesReviewed >= 10,
  },
];

export function checkNewAchievements(stats: Stats, currentAchievements: Achievement[]): Achievement[] {
  const newAchievements: Achievement[] = [];
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

export function calculateStats(state: AppState): Stats {
  const progressValues = Object.values(state.progress);
  let totalExercises = 0;
  let perfectScores = 0;
  let completedLevels = 0;
  let readingCount = 0;
  let listeningCount = 0;
  let writingCount = 0;
  let speakingCount = 0;
  const skillsMastered = new Set<string>();
  const languagesStudied = new Set<string>();

  progressValues.forEach(prog => {
    if (!prog.exercises) return;
    Object.entries(prog.exercises).forEach(([key, ex]) => {
      totalExercises++;
      if (ex.score === 100) perfectScores++;
      if (key.startsWith('skill-reading')) readingCount++;
      if (key.startsWith('skill-listening')) listeningCount++;
      if (key.startsWith('skill-writing')) writingCount++;
      if (key.startsWith('skill-speaking')) {
        speakingCount++;
        if (ex.score >= 80) skillsMastered.add('speaking');
      }
      if (ex.score >= 80) {
        if (key.startsWith('skill-reading')) skillsMastered.add('reading');
        if (key.startsWith('skill-listening')) skillsMastered.add('listening');
        if (key.startsWith('skill-writing')) skillsMastered.add('writing');
      }
    });
    if (prog.completed) completedLevels++;
  });

  Object.keys(state.progress).forEach(key => {
    const langId = key.split('-')[0];
    languagesStudied.add(langId);
  });

  return {
    totalExercises,
    perfectScores,
    completedLevels,
    totalCoins: state.coins,
    streak: state.streak,
    skillsMastered: skillsMastered.size,
    readingCount,
    listeningCount,
    writingCount,
    speakingCount,
    languagesStudied: languagesStudied.size,
    dailyChallengesDone: state.dailyChallenges?.challenges?.filter(c => c.completed).length || 0,
    perfectWeeks: state.perfectWeeks || 0,
    mistakesReviewed: state.mistakesReviewed || 0,
  };
}
