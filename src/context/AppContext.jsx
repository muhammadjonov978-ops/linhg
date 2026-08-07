import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { checkNewAchievements, calculateStats } from '../data/achievements';
import { isThemeId, DEFAULT_THEME } from '../data/themes';
import { getShopItem, DEFAULT_OWNED, DEFAULT_EQUIPPED, SHOP_ITEMS } from '../data/shop';
import { languages } from '../data/languages';
import { verifyAdminSession, ADMIN_SESSION_KEY } from '../data/adminUsers';

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
    } catch {
      /* ignore */
    }
    return data;
  } catch (e) {
    console.warn('Failed to migrate legacy data:', e);
    return null;
  }
}

// Shop xaridlari: eski foydalanuvchilarda bo'lmasa bepul boshlang'ich to'plam beriladi
function migrateShop(parsed) {
  // Bepul boshlang'ich to'plam har doim qo'shiladi — bo'sh/buzilgan saqlangan
  // inventarda ham qahramon hech bo'lmaganda asosiy kiyimlarga ega bo'ladi.
  const owned = Array.from(new Set([
    ...DEFAULT_OWNED,
    ...(Array.isArray(parsed.inventory) ? parsed.inventory : []),
  ]));
  const equipped = parsed.equipped && typeof parsed.equipped === 'object'
    ? { ...DEFAULT_EQUIPPED, ...parsed.equipped }
    : DEFAULT_EQUIPPED;
  // Faqat mavjud itemlar saqlanadi — sotib olinmagan narsa kiyib bo'lmaydi
  const validEquipped = {};
  ['hat', 'outfit', 'accessory', 'pet'].forEach(cat => {
    const id = equipped[cat];
    const item = getShopItem(id);
    validEquipped[cat] = item && item.category === cat && owned.includes(id) ? id : DEFAULT_EQUIPPED[cat];
  });
  return { inventory: owned, equipped: validEquipped };
}

// Migrate old XP-based saved data to coins
function migrateSaved(parsed) {
  const shop = migrateShop(parsed);
  return {
    isAdmin: false, // adminlik server'da tekshiriladi — localStorage'da saqlanmaydi
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
    courseRewards: parsed.courseRewards || {},
    inventory: shop.inventory,
    equipped: shop.equipped,
    energy: typeof parsed.energy === 'number' ? parsed.energy : MAX_ENERGY,
  };
}

// Kunlik energiya — 2-rasmdagi kabi navbar'da ⚡ sifatida ko'rsatiladi.
// Har kuni 440 gacha to'ldiriladi (dars qilinganda yangilanadi).
export const MAX_ENERGY = 440;

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
    const shop = migrateShop(legacy);
    return {
      isAdmin: false,
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
      courseRewards: {},
      inventory: shop.inventory,
      equipped: shop.equipped,
      energy: MAX_ENERGY,
    };
  }

  return {
    isAdmin: false,
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
    courseRewards: {},
    inventory: DEFAULT_OWNED,
    equipped: DEFAULT_EQUIPPED,
    energy: MAX_ENERGY,
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
      let newEnergy = state.energy;
      if (lastActive) {
        const diffHours = (now - lastActive) / (1000 * 60 * 60);
        if (diffHours > 48) {
          newStreak = 1;
        } else if (diffHours > 24) {
          newStreak = state.streak + 1;
        }
        // Energeya har kuni qayta to'ldiriladi
        if (diffHours > 24) {
          newEnergy = MAX_ENERGY;
        }
      } else {
        newStreak = 1;
        newEnergy = MAX_ENERGY;
      }

      // Tanga dars ichida berilmaydi — +15 faqat oddiy darslarda to'g'ri javob uchun
      // LevelPage tomonidan ADD_COINS orqali beriladi. Bu yerda faqat progress saqlanadi.
      const next = {
        ...state,
        streak: newStreak,
        lastActive: now,
        energy: newEnergy,
        progress: {
          ...state.progress,
          [key]: { score: bestScore, completed, timestamp: now },
        },
      };
      return next;
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

    // Admin rejimi — server'da tasdiqlangan admin uchun hamma narsa tekin:
    // barcha tillar + premium + magazindagi barcha narsalar
    case 'SET_ADMIN': {
      const allUnlocked = {};
      languages.forEach((l) => { allUnlocked[l.id] = true; });
      return {
        ...state,
        isAdmin: true,
        isPremium: true,
        unlockedLanguages: allUnlocked,
        inventory: Array.from(new Set([
          ...(state.inventory || []),
          ...SHOP_ITEMS.map((i) => i.id),
        ])),
      };
    }

    case 'ADD_TUTOR_MESSAGE':
      return {
        ...state,
        tutorMessages: [...state.tutorMessages, action.payload],
      };

    case 'TOGGLE_TUTOR':
      return { ...state, isTutorOpen: !state.isTutorOpen };

    case 'ADD_COINS':
      return { ...state, coins: state.coins + action.payload };

    case 'BUY_SHOP_ITEM': {
      const item = getShopItem(action.payload);
      if (!item || item.price <= 0) return state;
      if (state.inventory.includes(item.id)) return state; // allaqachon xarid qilingan
      // Admin uchun hamma narsa TEKIN — tanga sarflanmaydi
      if (!state.isAdmin && state.coins < item.price) return state; // yetarli tanga yo'q
      return {
        ...state,
        coins: state.isAdmin ? state.coins : state.coins - item.price,
        inventory: [...state.inventory, item.id],
      };
    }

    case 'EQUIP_SHOP_ITEM': {
      const item = getShopItem(action.payload);
      if (!item || !state.inventory.includes(item.id)) return state;
      return {
        ...state,
        equipped: { ...state.equipped, [item.category]: item.id },
      };
    }
    case 'UPDATE_DAILY_CHALLENGES':
      return { ...state, dailyChallenges: action.payload };

    case 'SET_ACHIEVEMENTS':
      return { ...state, achievements: action.payload };

    case 'CLAIM_ACHIEVEMENT_COINS':
      return { ...state, coins: state.coins + action.payload };

    case 'CLAIM_ACHIEVEMENT':
      return {
        ...state,
        coins: state.coins + (action.payload.coinReward || 0),
        achievements: (state.achievements || []).map(a =>
          a.id === action.payload.id ? { ...a, claimed: true } : a
        ),
      };

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
        inventory: DEFAULT_OWNED,
        equipped: DEFAULT_EQUIPPED,
        energy: MAX_ENERGY,
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

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Admin sessiyasi bo'lsa — server'da tekshiramiz. Tasdiqlangan taqdirda
  // barcha tillar/premium/magazin narsalari bepul ochiladi (SET_ADMIN).
  // Soxtalashtirilgan sessiya serverda rad etiladi — imtiyoz berilmaydi.
  useEffect(() => {
    let cancelled = false;
    let token = null;
    try {
      token = JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY) || 'null')?.token;
    } catch {
      /* ignore */
    }
    if (!token) return undefined;
    (async () => {
      const res = await verifyAdminSession(token);
      if (cancelled) return;
      if (res.ok) dispatch({ type: 'SET_ADMIN' });
    })();
    return () => { cancelled = true; };
  }, []);

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
        courseRewards: state.courseRewards || {},
        inventory: state.inventory,
        equipped: state.equipped,
        energy: state.energy,
      };
      if (state.isAdmin) {
        // Admin imtiyozlari (barcha tillar/premium/magazin narsalari) localStorage'ga
        // YOZILMAYDI — faqat joriy sessiyada amal qiladi. Har ochilishda server qayta
        // tekshiradi (SET_ADMIN). Shunday qilib, brauzerni bo'lishgan oddiy foydalanuvchi
        // admin imtiyozlarini meros qilib olmaydi.
        toSave.unlockedLanguages = {};
        toSave.isPremium = false;
        toSave.inventory = DEFAULT_OWNED;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save data:', e);
    }
  }, [
    state.progress, state.tutorMessages, state.isTutorOpen,
    state.isPremium, state.unlockedLanguages, state.coins, state.streak, state.lastActive,
    state.achievements, state.dailyChallenges, state.theme,
    state.mistakesReviewed, state.perfectWeeks, state.courseRewards,
    state.inventory, state.equipped, state.energy, state.isAdmin,
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

    // Check for new achievements — coins are NOT auto-collected anymore.
    // The student claims the coin reward manually from the achievements panel.
    const stats = calculateStats(state);
    const newAchievements = checkNewAchievements(stats, state.achievements);
    if (newAchievements.length > 0) {
      const updatedAchievements = [
        ...state.achievements,
        ...newAchievements.map(a => ({ ...a, justUnlocked: true, claimed: false })),
      ];
      dispatch({ type: 'SET_ACHIEVEMENTS', payload: updatedAchievements });
    }
    // Deps ataylab keng: checkNewAchievements allaqachon ochilgan yutuqlarni
    // filtrlab tashlaydi (takrorlanmaydi), RESET_STREAK esa idempotent.
  }, [state.progress, state.coins, state.streak, state.dailyChallenges, state.mistakesReviewed, state.achievements, state.lastActive, state]);

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
