'use client';

import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import { checkNewAchievements, calculateStats } from '../data/achievements';
import type { Achievement } from '../data/achievements';
import { isThemeId, DEFAULT_THEME } from '../data/themes';

// === TYPES ===

export interface ExerciseRecord {
  score: number;
  completed: boolean;
  timestamp: number;
}

export interface LevelProgress {
  exercises: Record<string, ExerciseRecord>;
  completed: boolean;
  bestScore: number;
}

export interface Progress {
  [key: string]: LevelProgress;
}

export interface TutorMessage {
  text: string;
  isAI: boolean;
  timestamp: number;
}

export interface DailyChallengeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  coinReward: number;
  completed?: boolean;
  check?: () => boolean;
}

export interface DailyChallengesData {
  date: string;
  challenges: DailyChallengeItem[];
}

export interface AppState {
  selectedLanguage: string | null;
  currentLevel: string | null;
  progress: Progress;
  tutorMessages: TutorMessage[];
  isTutorOpen: boolean;
  isPremium: boolean;
  unlockedLanguages: Record<string, boolean>;
  coins: number;
  streak: number;
  lastActive: number | null;
  achievements: Achievement[];
  dailyChallenges: DailyChallengesData | null;
  theme: string;
  mistakesReviewed: number;
  perfectWeeks: number;
}

type AppAction =
  | { type: 'SELECT_LANGUAGE'; payload: string | null }
  | { type: 'SET_CURRENT_LEVEL'; payload: string | null }
  | { type: 'COMPLETE_EXERCISE'; payload: { langId: string; levelId: string; skill: string; score: number } }
  | { type: 'UNLOCK_PREMIUM' }
  | { type: 'UNLOCK_LANGUAGE'; payload: string }
  | { type: 'ADD_TUTOR_MESSAGE'; payload: TutorMessage }
  | { type: 'TOGGLE_TUTOR' }
  | { type: 'ADD_COINS'; payload: number }
  | { type: 'UPDATE_DAILY_CHALLENGES'; payload: DailyChallengesData }
  | { type: 'SET_ACHIEVEMENTS'; payload: Achievement[] }
  | { type: 'CLAIM_ACHIEVEMENT_COINS'; payload: number }
  | { type: 'REMOVE_ACHIEVEMENT'; payload: string }
  | { type: 'MARK_MISTAKE_REVIEWED' }
  | { type: 'SET_THEME'; payload: string }
  | { type: 'TOGGLE_THEME' }
  | { type: 'RESET_PROGRESS' }
  | { type: 'RESET_STREAK' };

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  isLevelUnlocked: (langId: string, levelId: string) => boolean;
  isLevelAvailable: (levelId: string) => boolean;
  getLevelProgress: (langId: string, levelId: string) => LevelProgress;
}

// === CONTEXT ===

const AppContext = createContext<AppContextType | null>(null);

export const STORAGE_KEY = 'polyglotpro_data';

function loadInitialState(): AppState {
  try {
    if (typeof window !== 'undefined') {
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
          unlockedLanguages: parsed.unlockedLanguages || {},
          coins: parsed.coins ?? parsed.xp ?? 0, // migrate old xp field
          streak: parsed.streak || 0,
          lastActive: parsed.lastActive || null,
          achievements: (parsed.achievements || []).map((a: Achievement) => ({
            ...a,
            coinReward: a.coinReward ?? a.xpReward ?? 0,
          })),
          dailyChallenges: parsed.dailyChallenges || null,
          theme: parsed.theme || DEFAULT_THEME,
          mistakesReviewed: parsed.mistakesReviewed || 0,
          perfectWeeks: parsed.perfectWeeks || 0,
        };
      }
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

const initialState: AppState = loadInitialState();

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SELECT_LANGUAGE':
      return { ...state, selectedLanguage: action.payload, currentLevel: null };

    case 'SET_CURRENT_LEVEL':
      return { ...state, currentLevel: action.payload };

    case 'COMPLETE_EXERCISE': {
      const { langId, levelId, skill, score } = action.payload;
      const key = `${langId}-${levelId}`;
      const existing = state.progress[key] || { exercises: {}, completed: false, bestScore: 0 };
      const exKey = `skill-${skill}`;
      const prevScore = existing.exercises[exKey]?.score || 0;
      const bestScore = Math.max(existing.bestScore, score);
      const exercises = {
        ...existing.exercises,
        [exKey]: { score: Math.max(prevScore, score), completed: true, timestamp: Date.now() },
      };
      const requiredSkills = ['reading', 'listening', 'writing', 'speaking'];
      const completedSkills = requiredSkills.filter(s => exercises[`skill-${s}`]?.completed);
      const passedSkills = completedSkills.filter(s => exercises[`skill-${s}`]?.score >= 80);
      const allSkillsDone = completedSkills.length >= 4;
      const allPassed = passedSkills.length >= 4;
      const completed = allSkillsDone && allPassed;

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
        coins: state.coins + Math.floor(score / 10),
        streak: newStreak,
        lastActive: now,
        progress: {
          ...state.progress,
          [key]: { exercises, completed, bestScore },
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
      // Idempotent: streak allaqachon 0 bo'lsa, yangi state yaratilmaydi —
      // aks holda 48 soatlik streak tekshiruvli effect cheksiz takrorlanardi.
      if (state.streak === 0) return state;
      return { ...state, streak: 0 };

    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
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
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      }
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

    const stats = calculateStats(state);
    const newAchievements = checkNewAchievements(stats, state.achievements);
    if (newAchievements.length > 0) {
      // Auto-collect coin rewards immediately
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
    // Deps ataylab keng: checkNewAchievements allaqachon ochilgan yutuqlarni
    // filtrlab tashlaydi (takrorlanmaydi), RESET_STREAK esa idempotent.
  }, [state.progress, state.coins, state.streak, state.achievements, state.lastActive, state]);

  // Apply theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      html.setAttribute('data-theme', isThemeId(state.theme) ? state.theme : DEFAULT_THEME);
    }
  }, [state.theme]);

  const isLevelUnlocked = useCallback((langId: string, levelId: string): boolean => {
    const levelIndex = ['beginner', 'elementary', 'pre-intermediate', 'advanced'].indexOf(levelId);
    if (levelIndex === -1) return false;
    if (levelIndex === 0) return true;

    const prevLevelId = ['beginner', 'elementary', 'pre-intermediate', 'advanced'][levelIndex - 1];
    const prevKey = `${langId}-${prevLevelId}`;
    const prevProgress = state.progress[prevKey];
    return prevProgress?.completed === true;
  }, [state.progress]);

  const isLevelAvailable = useCallback((levelId: string): boolean => {
    if (levelId === 'advanced') {
      return state.isPremium;
    }
    return true;
  }, [state.isPremium]);

  const getLevelProgress = useCallback((langId: string, levelId: string): LevelProgress => {
    const key = `${langId}-${levelId}`;
    return state.progress[key] || { exercises: {}, completed: false, bestScore: 0 };
  }, [state.progress]);

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      isLevelUnlocked,
      isLevelAvailable,
      getLevelProgress,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
