// ==== ADMIN COIN WALLET (Firebase realtime + localStorage fallback) ====
// Admin panelda adminlar bir-biriga BEPUL coin bera oladi — bitta berishda
// ko'pi bilan MAX_GIFT (100 000) tanga. Adminlar orasida sovg'a qilish
// cheklovi shu yerda ham, panel UI'da ham qo'llaniladi.
//
// Ikkita rejim:
//  1) FIREBASE — balanslar Firebase Realtime Database'da saqlanadi
//     (`adminCoins/{username}` = son), shuning uchun istalgan qurilmada
//     ko'rinadi va bir admin bergan coin boshqa qurilmadagi admin balansida
//     darhol yangilanadi. Firebase .env sozlamalari kiritilgan bo'lsa ishlaydi.
//  2) LOCAL — Firebase sozlanmagan bo'lsa localStorage (shu brauzer) ishlatiladi.
//
// Log (`adminCoinLog`) har bir berishni saqlaydi: kim, kimga, qancha, qachon.

import { db, HAS_FIREBASE, ensureFirebaseInit } from '../firebase';

// firebase/database moduli lazy yuklanadi — faqat Firebase sozlangan bo'lsa
let dbModCache = null;
async function fdb() {
  if (!dbModCache) {
    await ensureFirebaseInit();
    dbModCache = await import('firebase/database');
  }
  return dbModCache;
}

const COINS_PATH = 'adminCoins';
const LOG_PATH = 'adminCoinLog';
const LOCAL_COINS_KEY = 'lingohub_admin_coins';
const LOCAL_LOG_KEY = 'lingohub_admin_coin_log';
export const MAX_LOG = 50;

// Bitta berishda eng ko'p 100 000 tanga — adminlar orasidagi bepul sovg'a limiti
export const MAX_GIFT = Infinity;

const listeners = new Set();
let started = false;
let lastState = {
  balances: {},   // { username: balance }
  log: [],        // [{ from, to, amount, time }] — yangilari oldinda
  mode: HAS_FIREBASE ? 'firebase' : 'local',
};

function emit() {
  const snapshot = {
    balances: { ...lastState.balances },
    log: [...lastState.log],
    mode: lastState.mode,
  };
  listeners.forEach((cb) => {
    try {
      cb(snapshot);
    } catch {
      /* listener xatosini e'tiborsiz qoldiramiz */
    }
  });
}

export function subscribeAdminCoins(cb) {
  listeners.add(cb);
  if (!started) start().catch(() => startLocal());
  cb({ balances: { ...lastState.balances }, log: [...lastState.log], mode: lastState.mode });
  return () => listeners.delete(cb);
}

// ---------- LOCAL (fallback) ----------

function readLocalCoins() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_COINS_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeLocalCoins(map) {
  try {
    localStorage.setItem(LOCAL_COINS_KEY, JSON.stringify(map));
  } catch {
    /* storage to'la / private rejim */
  }
}

function readLocalLog() {
  try {
    const arr = JSON.parse(localStorage.getItem(LOCAL_LOG_KEY) || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeLocalLog(arr) {
  try {
    localStorage.setItem(LOCAL_LOG_KEY, JSON.stringify(arr.slice(0, MAX_LOG)));
  } catch {
    /* noop */
  }
}

function onStorageEvent(e) {
  if (e.key === LOCAL_COINS_KEY || e.key === LOCAL_LOG_KEY) {
    lastState.balances = readLocalCoins();
    lastState.log = readLocalLog();
    emit();
  }
}

function startLocal() {
  lastState.balances = readLocalCoins();
  lastState.log = readLocalLog();
  window.addEventListener('storage', onStorageEvent);
}

// ---------- FIREBASE ----------

async function startFirebase() {
  const { ref, onValue, limitToLast, query } = await fdb();
  // Balanslar — jonli yangilanadi
  onValue(ref(db, COINS_PATH), (snap) => {
    lastState.balances = snap.val() || {};
    emit();
  });
  // Log — oxirgi 50 ta yozuv
  onValue(query(ref(db, LOG_PATH), limitToLast(MAX_LOG)), (snap) => {
    const data = snap.val() || {};
    lastState.log = Object.values(data)
      .sort((a, b) => (b?.time || 0) - (a?.time || 0))
      .slice(0, MAX_LOG);
    emit();
  });
}

async function start() {
  started = true;
  try {
    if (HAS_FIREBASE) {
      await startFirebase();
      return;
    }
  } catch {
    /* firebase xatosi — lokal rejimga tushamiz */
  }
  startLocal();
}

// ---------- PUBLIC API ----------

// Adminga bepul coin berish. fromUsername — kim berayotgani (session),
// toUsername — kimga, amount — qancha (maksimal MAX_GIFT = 100 000).
export async function giveAdminCoins(fromUsername, toUsername, amount) {
  const amt = Math.floor(Number(amount));
  if (!Number.isFinite(amt) || amt <= 0) {
    return { ok: false, error: "Miqdor noto'g'ri — musbat butun son kiriting" };
  }
  // Cheksiz — adminlar istalgancha tanga bera oladi
  if (!toUsername) {
    return { ok: false, error: 'Kimga berishni tanlang' };
  }

  if (HAS_FIREBASE) {
    try {
      const { ref, runTransaction, push } = await fdb();
      const balanceRef = ref(db, `${COINS_PATH}/${toUsername}`);
      let finalBalance = 0;
      // runTransaction — bir vaqtda ko'p berish bo'lsa ham balans to'g'ri qo'shiladi
      await runTransaction(balanceRef, (current) => {
        const base = typeof current === 'number' ? current : 0;
        finalBalance = base + amt;
        return finalBalance;
      });
      await push(ref(db, LOG_PATH), {
        from: fromUsername,
        to: toUsername,
        amount: amt,
        time: Date.now(),
      });
      return { ok: true, balance: finalBalance };
    } catch (e) {
      return { ok: false, error: e?.message || 'Xato yuz berdi' };
    }
  }

  // LOCAL fallback
  const map = readLocalCoins();
  map[toUsername] = (map[toUsername] || 0) + amt;
  writeLocalCoins(map);
  const log = readLocalLog();
  log.unshift({ from: fromUsername, to: toUsername, amount: amt, time: Date.now() });
  writeLocalLog(log);
  lastState.balances = map;
  lastState.log = log.slice(0, MAX_LOG);
  emit();
  return { ok: true, balance: map[toUsername] };
}
