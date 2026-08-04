import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { checkNewAchievements, calculateStats } from '../data/achievements';
import { isThemeId, DEFAULT_THEME } from '../data/themes';

const AppContext = createContext();

export const STORAGE_KEY = 'lingohub_data';

// Legacy key used by the old app version — migrate only safe fields,
// and NEVER carry over dailyChallenges (their check functions were stripped
// by JSON, which caused the "check is not a function" crash).
const LEGACY_STORAGE_KEY = 'alpomish_data';

function loadLegacyData() {
  try {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacy) return null;
    const parsed = JSON.parse(legacy);
    const data = {
      progress: parsed.progress || {},
      coins: parsed.coins ?? parsed.xp ?? 0,
      streak: parsed.streak || 0,
      lastActive: parsed.lastActive || null,
      isPremium: parsed.isPremium || false,
      unlockedLanguages: parsed.unlockedLanguages || {},
      theme: isThemeId(parsed.theme) ? parsed.theme : DEFAULT_THEME,
      achievements: (parsed.achievements || []).map(a => ({
        ...a,
        coinReward: a.coinReward ?? a.xpReward ?? 0,
      })),
    };
    // Legacy data fully consumed — remove it to avoid confusion / future re-reads
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
    return data;
  } catch (e) {
    console.warn('Failed to migrate legacy data:', e);
    return null;
  }
}

// Migrate old XP-based saved data to coins
function migrateSaved(parsed) {
  return {
    selectedLanguage: null,
    currentLevel: null,
    progress: parsed.progress || {},
    tutorMessages: parsed.tutorMessages || [],
    isTutorOpen: parsed.isTutorOpen || false,
    isPremium: parsed.isPremium || false,
    unlockedLanguages: parsed.unlockedLanguages || {},
    coins: parsed.coins ?? parsed.xp ?? 0, // old "xp" field becomes "coins"
    streak: parsed.streak || 0,
    lastActive: parsed.lastActive || null,
    achievements: (parsed.achievements || []).map(a => ({
      ...a,
      // migrate old reward field name
      coinReward: a.coinReward ?? a.xpReward ?? 0,
    })),
    dailyChallenges: parsed.dailyChallenges || null,
    theme: parsed.theme || DEFAULT_THEME,
    mistakesReviewed: parsed.mistakesReviewed || 0,
    perfectWeeks: parsed.perfectWeeks || 0,
  };
}

function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return migrateSaved(JSON.parse(saved));
    }
  } catch (e) {
    console.warn('Failed to load saved data:', e);
  }

  // No new-key data: try migrating safe fields from the legacy key
  const legacy = loadLegacyData();
  if (legacy) {
    return {
      selectedLanguage: null,
      currentLevel: null,
      progress: legacy.progress,
      tutorMessages: [],
      isTutorOpen: false,
      isPremium: legacy.isPremium,
      unlockedLanguages: legacy.unlockedLanguages,
      coins: legacy.coins,
      streak: legacy.streak,
      lastActive: legacy.lastActive,
      achievements: legacy.achievements,
      dailyChallenges: null, // deliberately dropped — functions lost in JSON
      theme: legacy.theme,
      mistakesReviewed: 0,
      perfectWeeks: 0,
    };
  }

  return {
    selectedLanguage: null,
    currentLevel: null,
    progress: {},
    tutorMessages: [],
    isTutorOpen: false,
    isPremium: false,
    unlockedLanguages: {},
    coins: 0,
    streak: 0,
    lastActive: null,
    achievements: [],
    dailyChallenges: null,
    theme: DEFAULT_THEME,
    mistakesReviewed: 0,
    perfectWeeks: 0,
  };
}

const initialState = loadInitialState();

function appReducer(state, action) {
  switch (action.type) {
    case 'SELECT_LANGUAGE':
      return { ...state, selectedLanguage: action.payload };

    case 'SET_CURRENT_LEVEL':
      return { ...state, currentLevel: action.payload };

    case 'COMPLETE_LESSON': {
      const { langId, lessonNumber, score } = action.payload;
      const key = `${langId}-lesson-${lessonNumber}`;
      const existing = state.progress[key] || {};
      const bestScore = Math.max(existing.score || 0, score);
      const completed = score >= 50;

      // Update streak on lesson completion
      const now = Date.now();
      const lastActive = state.lastActive;
      let newStreak = state.streak;
      if (lastActive) {
        const diffHours = (now - lastActive) / (1000 * 60 * 60);
        if (diffHours > 48) {
          newStreak = 1;
        } else if (diffHours > 24) {
          newStreak = state.streak + 1;
        }
      } else {
        newStreak = 1;
      }

      // NOTE: coins are auto-awarded in LevelPage.handleAnswer — do NOT double-award here
      return {
        ...state,
        streak: newStreak,
        lastActive: now,
        progress: {
          ...state.progress,
          [key]: { score: bestScore, completed, timestamp: now },
        },
      };
    }

    case 'UNLOCK_PREMIUM':
      return { ...state, isPremium: true };

    case 'UNLOCK_LANGUAGE':
      return {
        ...state,
        unlockedLanguages: {
          ...(state.unlockedLanguages || {}),
          [action.payload]: true,
        },
      };

    case 'ADD_TUTOR_MESSAGE':
      return {
        ...state,
        tutorMessages: [...state.tutorMessages, action.payload],
      };

    case 'TOGGLE_TUTOR':
      return { ...state, isTutorOpen: !state.isTutorOpen };

    case 'ADD_COINS':
      return { ...state, coins: state.coins + action.payload };

    case 'UPDATE_DAILY_CHALLENGES':
      return { ...state, dailyChallenges: action.payload };

    case 'SET_ACHIEVEMENTS':
      return { ...state, achievements: action.payload };

    case 'CLAIM_ACHIEVEMENT_COINS':
      return { ...state, coins: state.coins + action.payload };

    case 'REMOVE_ACHIEVEMENT':
      return { ...state, achievements: state.achievements.filter(a => a.id !== action.payload) };

    case 'MARK_MISTAKE_REVIEWED':
      return { ...state, mistakesReviewed: (state.mistakesReviewed || 0) + 1 };

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };

    case 'RESET_PROGRESS':
      return {
        ...state,
        progress: {},
        coins: 0,
        streak: 0,
        tutorMessages: [],
        achievements: [],
        dailyChallenges: null,
        mistakesReviewed: 0,
        perfectWeeks: 0,
      };

    case 'RESET_STREAK':
      return { ...state, streak: 0 };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      const toSave = {
        progress: state.progress,
        tutorMessages: state.tutorMessages,
        isTutorOpen: state.isTutorOpen,
        isPremium: state.isPremium,
        unlockedLanguages: state.unlockedLanguages || {},
        coins: state.coins,
        streak: state.streak,
        lastActive: state.lastActive,
        achievements: state.achievements,
        dailyChallenges: state.dailyChallenges,
        theme: state.theme,
        mistakesReviewed: state.mistakesReviewed,
        perfectWeeks: state.perfectWeeks,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save data:', e);
    }
  }, [
    state.progress, state.tutorMessages, state.isTutorOpen,
    state.isPremium, state.unlockedLanguages, state.coins, state.streak, state.lastActive,
    state.achievements, state.dailyChallenges, state.theme,
    state.mistakesReviewed, state.perfectWeeks,
  ]);

  // Check streak and update achievements
  useEffect(() => {
    if (state.lastActive) {
      const now = Date.now();
      const diff = now - state.lastActive;
      const hoursDiff = diff / (1000 * 60 * 60);
      if (hoursDiff > 48) {
        dispatch({ type: 'RESET_STREAK' });
      }
    }

    // Check for new achievements — rewards are AUTO-COLLECTED as coins
    const stats = calculateStats(state);
    const newAchievements = checkNewAchievements(stats, state.achievements);
    if (newAchievements.length > 0) {
      // Auto-claim coin rewards immediately
      const totalCoins = newAchievements.reduce((sum, a) => sum + (a.coinReward || 0), 0);
      if (totalCoins > 0) {
        dispatch({ type: 'ADD_COINS', payload: totalCoins });
      }

      const updatedAchievements = [
        ...state.achievements,
        ...newAchievements.map(a => ({ ...a, justUnlocked: true })),
      ];
      dispatch({ type: 'SET_ACHIEVEMENTS', payload: updatedAchievements });
    }
  }, [state.progress, state.coins, state.streak]);

  // Apply theme
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-theme', isThemeId(state.theme) ? state.theme : DEFAULT_THEME);
  }, [state.theme]);

  const getLessonProgress = useCallback((langId, lessonNumber) => {
    const key = `${langId}-lesson-${lessonNumber}`;
    return state.progress[key] || { score: 0, completed: false, timestamp: null };
  }, [state.progress]);

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      getLessonProgress,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
