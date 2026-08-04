// ==== ADMIN-EDITABLE SITE CONFIG ====
// Admin panel orqali o'zgartiriladigan sozlamalar (localStorage'da saqlanadi):
//  - accounts: admin hisoblar ro'yxati
//  - prices:   tillar narxlari (so'm)
//  - texts:    sayt matnlari
import { useSyncExternalStore } from 'react';

const CONFIG_KEY = 'lingohub_admin_config';
const listeners = new Set();

export const DEFAULT_CONFIG = {
  accounts: [
    { username: 'shox', password: 'shox1010', name: 'Shox', role: 'owner' },
  ],
  prices: {
    korean: 20000,
    japanese: 20000,
    chinese: 20000,
    arabic: 20000,
    hindi: 20000,
    hebrew: 20000,
  },
  texts: {
    heroBadge: 'Interaktiv til o\u2018rganish',
    heroTitle: '27 Tilda Erkin Gaplashing',
    heroSubtitle: "Reading, Listening, Writing va Speaking \u2014 4 ta asosiy ko'nikmani interaktiv mashqlar orqali rivojlantiring",
    featureTitle: "5 ta Asosiy Bo'lim",
    featureDesc: "Mashqlarni bajarib, yutuqlarni oching, tanga yig'ing va boshqa o'quvchilar bilan raqobatlashing!",
    footerText: "27 tilda interaktiv o'rganish platformasi. Reading, Listening, Writing, Speaking.",
  },
};

export function loadConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        accounts: Array.isArray(parsed.accounts) && parsed.accounts.length ? parsed.accounts : DEFAULT_CONFIG.accounts,
        prices: { ...DEFAULT_CONFIG.prices, ...(parsed.prices || {}) },
        texts: { ...DEFAULT_CONFIG.texts, ...(parsed.texts || {}) },
      };
    }
  } catch (e) {
    /* ignore */
  }
  return DEFAULT_CONFIG;
}

// Keshli snapshot — useSyncExternalStore har chaqiruvda bir xil obyektni oladi,
// aks holda cheksiz qayta render yuz beradi (React error #185).
let cachedConfig = loadConfig();

export function getSnapshot() {
  return cachedConfig;
}

export function subscribeConfig(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function saveConfig(cfg) {
  cachedConfig = cfg;
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
  } catch (e) {
    console.warn('Failed to save config:', e);
  }
  listeners.forEach((l) => l());
}

// Boshqa oynadan saqlangan o'zgarishlarni qabul qilish
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === CONFIG_KEY) {
      cachedConfig = loadConfig();
      listeners.forEach((l) => l());
    }
  });
}

export function useSiteConfig() {
  return useSyncExternalStore(subscribeConfig, getSnapshot);
}

// Til narxi: admin sozlagan bo'lsa o'sha, aks holda dastlabki narx
export function getLangPrice(config, lang) {
  const p = config?.prices?.[lang?.id];
  return typeof p === 'number' ? p : (lang?.price ?? 0);
}

export function getSiteText(config, key, fallback = '') {
  const v = config?.texts?.[key];
  return typeof v === 'string' && v.trim() !== '' ? v : fallback;
}
