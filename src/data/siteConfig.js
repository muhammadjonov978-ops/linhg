// ==== ADMIN-EDITABLE SITE CONFIG ====
// Admin panel orqali o'zgartiriladigan sozlamalar (localStorage'da saqlanadi):
//  - accounts: admin hisoblar ro'yxati
//  - texts:    sayt matnlari
import { useSyncExternalStore } from 'react';

const CONFIG_KEY = 'lingohub_admin_config';
const listeners = new Set();

// DIQQAT: bu yerda hech qachon PAROL saqlanmaydi! Login/parol faqat
// server'da tekshiriladi (api/admin/login → ADMIN_PASSWORD env o'zgaruvchisi).
// localStorage'dagi accounts ro'yxati faqat panel ichida ko'rsatish uchun.
export const DEFAULT_CONFIG = {
  accounts: [
    { username: 'shxsh', name: 'Shox', role: 'owner' },
  ],
  texts: {
    heroBadge: 'Interaktiv til o\u2018rganish',
    heroTitle: '130+ Tilda Erkin Gaplashing',
    heroSubtitle: "Reading, Listening, Writing va Speaking \u2014 4 ta asosiy ko'nikmani interaktiv mashqlar orqali rivojlantiring",
    featureTitle: "5 ta Asosiy Bo'lim",
    featureDesc: "Mashqlarni bajarib, yutuqlarni oching, tanga yig'ing va boshqa o'quvchilar bilan raqobatlashing!",
    footerText: "130+ tilda interaktiv o'rganish platformasi. Reading, Listening, Writing, Speaking.",
  },
};

export function loadConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Eski 'shox' egasi hisobini 'shxsh' ga ko'chiramiz (login o'zgargan)
      // — dublikat "Shox" qatori chiqmasligi uchun.
      if (Array.isArray(parsed.accounts) && !parsed.accounts.some((a) => a.username === 'shxsh')) {
        const legacyOwner = parsed.accounts.find((a) => a.username === 'shox' && a.role === 'owner');
        if (legacyOwner) {
          parsed.accounts = [
            { ...legacyOwner, username: 'shxsh' },
            ...parsed.accounts.filter((a) => a !== legacyOwner),
          ];
        }
      }
      // Faqat to'g'ri tuzilgan hisoblar saqlanadi — eski/buzilgan (masalan,
      // username o'rnida string yoki maydonlari yo'q) yozuvlar panelni qulatmasligi
      // uchun tashlab yuboriladi. Parollar hech qachon localStorage'ga yozilmaydi.
      const accounts = Array.isArray(parsed.accounts)
        ? parsed.accounts
            .filter((a) => a && typeof a === 'object' && typeof a.username === 'string' && a.username.trim())
            .map((a) => ({ username: a.username.trim(), name: a.name || a.username, role: a.role || 'admin' }))
        : [];
      const result = {
        accounts: accounts.length ? accounts : DEFAULT_CONFIG.accounts,
        texts: { ...DEFAULT_CONFIG.texts, ...(parsed.texts || {}) },
      };
      // Eski/buzilgan konfiguratsiya (masalan parol saqlangan yoki "xato loginlar"
      // kiritilgan) bo'lsa — tozalangan versiyani localStorage'ga ham YOZIB QO'YAMIZ.
      // Shunda 'shxsh1010' kabi parollar foydalanuvchi brauzeridan butunlay yo'qoladi.
      try {
        const oldAccounts = JSON.stringify(parsed.accounts || null);
        if (oldAccounts !== JSON.stringify(result.accounts)) {
          localStorage.setItem(CONFIG_KEY, JSON.stringify(result));
        }
      } catch {
        /* ignore */
      }
      return result;
    }
  } catch {
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

export function getSiteText(config, key, fallback = '') {
  const v = config?.texts?.[key];
  return typeof v === 'string' && v.trim() !== '' ? v : fallback;
}
