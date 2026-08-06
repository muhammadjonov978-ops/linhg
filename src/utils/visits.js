// ==== LIVE VISIT STATISTICS ENGINE ====
// Tracks cumulative visit ("tashrif") stats for the admin panel:
//   total  — jami tashrif (barcha vaqt)
//   today  — bugungi tashriflar
//   last7d — oxirgi 7 kun ichidagi tashriflar
//   unique — unikal tashrifchilar (turli qurilmalar)
//
// Dual-mode (same pattern as presence.js):
//   FIREBASE mode — real cross-device aggregation via Realtime Database.
//     Each visit atomically increments `visits/{deviceId}/count` and the
//     per-day counter `visits/{deviceId}/days/{YYYYMMDD}`. The admin panel
//     listens to the whole `visits` node and re-aggregates live.
//   LOCAL mode (fallback) — same-browser demo using localStorage +
//     BroadcastChannel (works across tabs of the same browser).
//
// Usage:
//   startVisitsTracking()          — begin recording visits (call once)
//   subscribeVisits(cb) -> unsub   — get live { total, today, last7d, unique, mode }
//   refreshVisits()                — force re-aggregate (the "Yangilash" button)

import { ref, runTransaction, onValue, get } from 'firebase/database';
import { db, HAS_FIREBASE } from '../firebase';

const LOCAL_KEY = 'lingohub_visits';
const CHANNEL_NAME = 'lingohub-visits';
const SESSION_KEY = 'lingohub_presence_session'; // reuse same device id as presence
const DEBOUNCE_MS = 30000; // bitta qurilma 30 soniyada ko'pi bilan 1 tashrif
const KEEP_DAYS = 30;      // localStorage'da shuncha kunlik tarix saqlanadi
const MAX_EVENTS = 5000;   // localStorage'da maksimal hodisalar soni
const DAY_MS = 86400000;

const listeners = new Set();
let deviceId = null;
let started = false;
let lastRecordTs = 0;
let unsubFirebase = null;
let channel = null;
let refreshTimer = null;
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

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// Local-timezone day key, e.g. "20260806"
function dayKey(ts = Date.now()) {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}${m}${day}`;
}

// ---------- FIREBASE MODE ----------

function firebaseRecord() {
  const uid = getDeviceId();
  runTransaction(ref(db, `visits/${uid}/days/${dayKey()}`), (c) => (typeof c === 'number' ? c + 1 : 1));
  runTransaction(ref(db, `visits/${uid}/count`), (c) => (typeof c === 'number' ? c + 1 : 1));
}

function firebaseAggregate(snapshot) {
  const data = snapshot.val() || {};
  const todayKey = dayKey();
  const dayKeys = new Set();
  for (let i = 0; i < 7; i++) {
    dayKeys.add(dayKey(Date.now() - i * DAY_MS));
  }
  let total = 0;
  let today = 0;
  let last7d = 0;
  let unique = 0;
  Object.values(data).forEach((node) => {
    if (!node) return;
    const count = typeof node.count === 'number' ? node.count : 0;
    const days = node.days || {};
    if (count > 0 || Object.keys(days).length > 0) unique += 1;
    total += count;
    Object.entries(days).forEach(([k, v]) => {
      if (typeof v !== 'number') return;
      if (dayKeys.has(k)) last7d += v;
      if (k === todayKey) today += v;
    });
  });
  lastState = { total, today, last7d, unique, mode: 'firebase' };
  emit();
}

function startFirebase() {
  unsubFirebase = onValue(ref(db, 'visits'), firebaseAggregate);
  firebaseRecord();
}

// ---------- LOCAL (fallback) MODE ----------

function readLocalLog() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{"events":[]}');
  } catch {
    return { events: [] };
  }
}

function writeLocalLog(log) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(log));
  } catch {
    /* storage full / private mode */
  }
}

function localRecord() {
  const log = readLocalLog();
  log.events = log.events || [];
  log.events.push({ t: Date.now(), u: getDeviceId() });
  // Prune: faqat so'nggi KEEP_DAYS kun va MAX_EVENTS ta hodisa saqlanadi
  const cutoff = Date.now() - KEEP_DAYS * DAY_MS;
  log.events = log.events.filter((e) => e && typeof e.t === 'number' && e.t >= cutoff).slice(-MAX_EVENTS);
  writeLocalLog(log);
  try {
    channel?.postMessage({ type: 'visit' });
  } catch {
    /* noop */
  }
}

function localCount() {
  const events = (readLocalLog().events || []).filter((e) => e && typeof e.t === 'number');
  const todayStart = startOfToday();
  const weekStart = todayStart - 6 * DAY_MS; // bugun + oldingi 6 kun
  let today = 0;
  let last7d = 0;
  const seen = new Set();
  events.forEach((e) => {
    seen.add(e.u);
    if (e.t >= todayStart) today += 1;
    if (e.t >= weekStart) last7d += 1;
  });
  lastState = {
    total: events.length,
    today,
    last7d,
    unique: seen.size,
    mode: 'local',
  };
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
  refreshTimer = setInterval(localCount, 5000);
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
