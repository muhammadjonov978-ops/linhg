// ==== LIVE VISIT STATISTICS ENGINE ====
// Tracks cumulative visit ("tashrif") stats for the admin panel:
//   total  — jami tashrif kunlari (barcha vaqt) — device-day hisobida
//   today  — bugungi tashriflar (turli qurilmalar)
//   last7d — oxirgi 7 kun ichidagi faol kunlar
//   unique — unikal qurilmalar
//
// IMPORTANT: har bir qurilma kuniga BIR MARTA hisoblanadi (idempotent).
// Sahifani qayta yangilash tashrif sonini OSHIRMAYDI — "har yangilashda
// son oshib ketyapti" degan bug shu bilan tuzatilgan.
//
// Dual-mode (same pattern as presence.js):
//   FIREBASE mode — real cross-device aggregation via Realtime Database.
//     Har qurilma o'z `visits/{uid}` tuguniga kunlik bayroq yozadi.
//     Admin panel butun `visits` tuguniga quloq solib, jonli agregatsiya qiladi.
//   LOCAL mode (fallback) — same-browser demo using localStorage +
//     BroadcastChannel (works across tabs of the same browser).
//
// Usage:
//   startVisitsTracking()          — begin recording visits (call once)
//   subscribeVisits(cb) -> unsub   — get live { total, today, last7d, unique, mode }
//   refreshVisits()                — force re-aggregate (the "Yangilash" button)

import { ref, runTransaction, onValue, get, serverTimestamp } from 'firebase/database';
import { db, HAS_FIREBASE } from '../firebase';

const LOCAL_KEY = 'lingohub_visits';
const CHANNEL_NAME = 'lingohub-visits';
const SESSION_KEY = 'lingohub_presence_session'; // reuse same device id as presence
const KEEP_DAYS = 60;       // necha kunlik tarix saqlanadi
const DAY_MS = 86400000;

const listeners = new Set();
let deviceId = null;
let started = false;
let _unsubFirebase = null;
let channel = null;
let _refreshTimer = null;
let lastState = { total: 0, today: 0, last7d: 0, unique: 0, mode: HAS_FIREBASE ? 'firebase' : 'local' };

function getDeviceId() {
  if (deviceId) return deviceId;
  try {
    deviceId = localStorage.getItem(SESSION_KEY);
    if (!deviceId) {
      deviceId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(SESSION_KEY, deviceId);
    }
  } catch {
    deviceId = `tmp-${Math.random().toString(36).slice(2, 10)}`;
  }
  return deviceId;
}

function emit() {
  listeners.forEach((cb) => {
    try {
      cb({ ...lastState });
    } catch {
      /* ignore listener errors */
    }
  });
}

export function subscribeVisits(cb) {
  listeners.add(cb);
  cb({ ...lastState });
  return () => listeners.delete(cb);
}

// Local-timezone day key, e.g. "20260806"
function dayKey(ts = Date.now()) {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}${m}${day}`;
}

// Agregatsiya: { total, today, last7d, unique } — node ma'lumotidan hisoblaydi.
// Node formati: { count, days: { YYYYMMDD: 1, ... } }
function aggregateNodes(nodes) {
  const todayKey = dayKey();
  const dayKeys = new Set();
  for (let i = 0; i < 7; i++) {
    dayKeys.add(dayKey(Date.now() - i * DAY_MS));
  }
  let total = 0;
  let today = 0;
  let last7d = 0;
  let unique = 0;
  Object.values(nodes).forEach((node) => {
    if (!node) return;
    const days = node.days || {};
    const dayList = Object.keys(days);
    if (dayList.length > 0) unique += 1;
    total += typeof node.count === 'number' ? node.count : dayList.length;
    dayList.forEach((k) => {
      if (dayKeys.has(k)) last7d += 1;
      if (k === todayKey) today += 1;
    });
  });
  return { total, today, last7d, unique };
}

// ---------- FIREBASE MODE ----------

function firebaseRecord() {
  const uid = getDeviceId();
  const today = dayKey();
  const entryRef = ref(db, `visits/${uid}`);
  runTransaction(entryRef, (node) => {
    if (node === null) node = {};
    const days = node.days || {};
    // Bugun allaqachon hisoblangan bo'lsa — o'zgartirmaymiz (idempotent)
    if (days[today]) return node;
    days[today] = 1;
    return {
      ...node,
      days,
      count: Object.keys(days).length,
      firstSeen: node.firstSeen || serverTimestamp(),
      lastSeen: serverTimestamp(),
    };
  });
}

function firebaseAggregate(snapshot) {
  const data = snapshot.val() || {};
  lastState = { ...aggregateNodes(data), mode: 'firebase' };
  emit();
}

function startFirebase() {
  _unsubFirebase = onValue(ref(db, 'visits'), firebaseAggregate);
  firebaseRecord();
}

// ---------- LOCAL (fallback) MODE ----------

function readLocalMap() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeLocalMap(map) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
  } catch {
    /* storage full / private mode */
  }
}

function localRecord() {
  const map = readLocalMap();
  const uid = getDeviceId();
  const today = dayKey();
  const entry = map[uid] || { days: {} };
  if (entry.days[today]) return; // idempotent — yangilash sonni oshirmaydi

  entry.days[today] = 1;
  // Eski kunlarni tozalab, xotira o'sishini cheklaymiz
  const cutoff = dayKey(Date.now() - KEEP_DAYS * DAY_MS);
  entry.days = Object.fromEntries(
    Object.entries(entry.days).filter(([k]) => k >= cutoff)
  );
  entry.count = Object.keys(entry.days).length;
  map[uid] = entry;
  writeLocalMap(map);
  try {
    channel?.postMessage({ type: 'visit' });
  } catch {
    /* noop */
  }
}

function localCount() {
  const map = readLocalMap();
  lastState = { ...aggregateNodes(map), mode: 'local' };
  emit();
}

function startLocal() {
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (e) => {
      if (e.data?.type === 'visit') localCount();
    };
  } catch {
    channel = null;
  }
  localRecord();
  localCount();
  window.addEventListener('storage', localCount);
  _refreshTimer = setInterval(localCount, 5000);
}

// ---------- PUBLIC API ----------

export function startVisitsTracking() {
  if (started) return;
  started = true;
  if (HAS_FIREBASE) {
    startFirebase();
  } else {
    startLocal();
  }
}

// "Yangilash" tugmasi / 30s interval — ma'lumotni qayta o'qib chiqadi
export async function refreshVisits() {
  if (!started) return;
  if (HAS_FIREBASE) {
    try {
      const snap = await get(ref(db, 'visits'));
      firebaseAggregate(snap);
    } catch {
      /* network hiccup — keyingi onValue yangilaydi */
    }
  } else {
    localCount();
  }
}
