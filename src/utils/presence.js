// ==== LIVE VISITOR PRESENCE ENGINE ====
// Tracks how many people are viewing the site / admin panel RIGHT NOW.
//
// Two modes:
//  1) FIREBASE mode  — real cross-device counting (any phone / laptop).
//     Each visitor heartbeats to `presence/{sessionId}` every 20s; the count
//     is derived from entries with a heartbeat within the last 45s.
//  2) LOCAL mode (fallback) — same-browser demo mode using localStorage +
//     BroadcastChannel (works across tabs of the same browser). Used when
//     Firebase env vars are not configured yet.
//
// Usage:
//   startPresence('site')                 — begin heartbeats
//   setPresenceLocation('admin')          — switch current visitor's location
//   subscribePresence(cb) -> unsubscribe — get live { total, site, admin, mode }
//   stopPresence()                        — stop + remove own entry

import { ref, set, onValue, onDisconnect, serverTimestamp, remove } from 'firebase/database';
import { db, HAS_FIREBASE } from '../firebase';

const HEARTBEAT_MS = 20000; // write heartbeat every 20s
const STALE_MS = 45000;     // an entry older than 45s is considered offline
const LOCAL_KEY = 'lingohub_presence';
const CHANNEL_NAME = 'lingohub-presence';
const SESSION_KEY = 'lingohub_presence_session';

const listeners = new Set();
let sessionId = null;
let currentLocation = 'site';
let heartbeatTimer = null;
let pruneTimer = null;
let unsubFirebase = null;
let channel = null;
let started = false;
let lastState = { total: 0, site: 0, admin: 0, mode: HAS_FIREBASE ? 'firebase' : 'local' };

function getSessionId() {
  if (sessionId) return sessionId;
  try {
    sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(SESSION_KEY, sessionId);
    }
  } catch {
    sessionId = `tmp-${Math.random().toString(36).slice(2, 10)}`;
  }
  return sessionId;
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

export function subscribePresence(cb) {
  listeners.add(cb);
  cb({ ...lastState });
  return () => listeners.delete(cb);
}

// ---------- FIREBASE MODE ----------

function firebaseWrite() {
  const entryRef = ref(db, `presence/${getSessionId()}`);
  set(entryRef, {
    location: currentLocation,
    lastSeen: serverTimestamp(),
  }).catch(() => {});
}

function firebaseCount(snapshot) {
  const data = snapshot.val() || {};
  const now = Date.now();
  let total = 0;
  let site = 0;
  let admin = 0;
  Object.values(data).forEach((entry) => {
    if (!entry || typeof entry.lastSeen !== 'number') return;
    if (now - entry.lastSeen <= STALE_MS) {
      total += 1;
      if (entry.location === 'admin') admin += 1;
      else site += 1;
    }
  });
  lastState = { total, site, admin, mode: 'firebase' };
  emit();
}

function startFirebase() {
  const entryRef = ref(db, `presence/${getSessionId()}`);
  // Remove own entry when the client disconnects abruptly
  onDisconnect(entryRef).remove();
  // Listen for live count changes
  unsubFirebase = onValue(ref(db, 'presence'), firebaseCount);
  // First write + periodic heartbeat
  firebaseWrite();
  heartbeatTimer = setInterval(firebaseWrite, HEARTBEAT_MS);
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

function localWrite() {
  const map = readLocalMap();
  map[getSessionId()] = { location: currentLocation, lastSeen: Date.now() };
  writeLocalMap(map);
  try {
    channel?.postMessage({ type: 'heartbeat', sessionId: getSessionId() });
  } catch {
    /* noop */
  }
}

function localCount() {
  const map = readLocalMap();
  const now = Date.now();
  let total = 0;
  let site = 0;
  let admin = 0;
  Object.entries(map).forEach(([, entry]) => {
    if (!entry || typeof entry.lastSeen !== 'number') return;
    if (now - entry.lastSeen <= STALE_MS) {
      total += 1;
      if (entry.location === 'admin') admin += 1;
      else site += 1;
    }
  });
  // Prune stale entries so the map doesn't grow forever
  const pruned = Object.fromEntries(
    Object.entries(map).filter(([, e]) => now - (e?.lastSeen || 0) <= STALE_MS * 3)
  );
  writeLocalMap(pruned);
  lastState = { total, site, admin, mode: 'local' };
  emit();
}

function startLocal() {
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (e) => {
      if (e.data?.type === 'heartbeat') localCount();
    };
  } catch {
    channel = null;
  }
  localWrite();
  localCount();
  heartbeatTimer = setInterval(localWrite, HEARTBEAT_MS);
  pruneTimer = setInterval(localCount, 5000);
  window.addEventListener('storage', localCount);
}

// ---------- PUBLIC API ----------

export function startPresence(location = 'site') {
  // Idempotent: if already running, just move the visitor between site/admin
  if (started) {
    setPresenceLocation(location);
    return;
  }
  started = true;
  currentLocation = location;
  if (HAS_FIREBASE) {
    startFirebase();
  } else {
    startLocal();
  }
}

export function setPresenceLocation(location) {
  if (!started) return; // presence not running — nothing to update
  currentLocation = location;
  if (HAS_FIREBASE) {
    firebaseWrite();
  } else {
    localWrite();
    localCount();
  }
}

export function stopPresence() {
  started = false;
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  if (pruneTimer) clearInterval(pruneTimer);
  heartbeatTimer = null;
  pruneTimer = null;
  if (unsubFirebase) {
    unsubFirebase();
    unsubFirebase = null;
  }
  if (channel) {
    try {
      channel.close();
    } catch {
      /* noop */
    }
    channel = null;
  }
  window.removeEventListener('storage', localCount);

  // Remove own entry so the counter drops immediately
  if (HAS_FIREBASE) {
    const entryRef = ref(db, `presence/${getSessionId()}`);
    remove(entryRef).catch(() => {});
  } else {
    const map = readLocalMap();
    delete map[getSessionId()];
    writeLocalMap(map);
  }
  lastState = { total: 0, site: 0, admin: 0, mode: HAS_FIREBASE ? 'firebase' : 'local' };
  emit();
}


