import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { checkNewAchievements, calculateStats } from '../data/achievements';

const AppContext = createContext();

const STORAGE_KEY = 'alpomish_data';

function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        selectedLanguage: null,
        currentLevel: null,
        progress: parsed.progress || {},
        tutorMessages: parsed.tutorMessages || [],
        isTutorOpen: parsed.isTutorOpen || false,
        isPremium: parsed.isPremium || false,
        xp: parsed.xp || 0,
        streak: parsed.streak || 0,
        lastActive: parsed.lastActive || null,
        achievements: parsed.achievements || [],
        dailyChallenges: parsed.dailyChallenges || null,
        theme: parsed.theme || 'light',
        mistakesReviewed: parsed.mistakesReviewed || 0,
        perfectWeeks: parsed.perfectWeeks || 0,
      };
    }
  } catch (e) {
    console.warn('Failed to load saved data:', e);
  }
  return {
    selectedLanguage: null,
    currentLevel: null,
    progress: {},
    tutorMessages: [],
    isTutorOpen: false,
    isPremium: false,
    xp: 0,
    streak: 0,
    lastActive: null,
    achievements: [],
    dailyChallenges: null,
    theme: 'light',
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

      return {
        ...state,
        xp: state.xp + Math.floor(score / 5),
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

    case 'ADD_TUTOR_MESSAGE':
      return {
        ...state,
        tutorMessages: [...state.tutorMessages, action.payload],
      };

    case 'TOGGLE_TUTOR':
      return { ...state, isTutorOpen: !state.isTutorOpen };

    case 'ADD_XP':
      return { ...state, xp: state.xp + action.payload };

    case 'UPDATE_DAILY_CHALLENGES':
      return { ...state, dailyChallenges: action.payload };

    case 'SET_ACHIEVEMENTS':
      return { ...state, achievements: action.payload };

    case 'CLAIM_ACHIEVEMENT_XP':
      return { ...state, xp: state.xp + action.payload };

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
        xp: 0,
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
        xp: state.xp,
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
    state.isPremium, state.xp, state.streak, state.lastActive,
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

    // Check for new achievements
    const stats = calculateStats(state);
    const newAchievements = checkNewAchievements(stats, state.achievements);
    if (newAchievements.length > 0) {
      // Add new achievements with justUnlocked flag
      const updatedAchievements = [
        ...state.achievements,
        ...newAchievements.map(a => ({ ...a, justUnlocked: true })),
      ];
      dispatch({ type: 'SET_ACHIEVEMENTS', payload: updatedAchievements });
    }
  }, [state.progress, state.xp, state.streak]);

  // Apply theme
  useEffect(() => {
    const html = document.documentElement;
    if (state.theme === 'dark') {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.setAttribute('data-theme', 'light');
    }
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
