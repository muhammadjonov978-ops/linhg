// ==== ADMIN LOGIN ACTIVITY LOG (server-side) ====
// Kim admin panelga kirganini (va kirishga urinishlarni) jonli kuzatish:
//  1) REDIS (Upstash) — barcha qurilmalarda yagona, doimiy log.
//  2) IN-MEMORY fallback — Redis sozlanmagan bo'lsa, shu instansiya ichida.
// Admin panel har 15 soniyada /api/admin/activity orqali o'qib turadi.
import { redis } from './redis.js';

const LOG_KEY = 'admin_log';
const TOTAL_KEY = 'admin_log_total';
const MAX_LOG = 200;

function dayKey(ts = Date.now()) {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
function todayKey() {
  return `admin_log_${dayKey()}`;
}

// ---------- In-memory fallback ----------
const memoryLog = [];
let memoryTotal = 0;
let memoryToday = 0;
let memoryTodayKey = dayKey();

// ---------- Public API ----------
export async function logAdminAttempt({ username, ok, ip, ua }) {
  const entry = {
    time: Date.now(),
    username: String(username || '').slice(0, 64) || "(noma'lum)",
    ok: Boolean(ok),
    ip: String(ip || '').slice(0, 64),
    ua: String(ua || '').slice(0, 120),
  };
  const today = dayKey();

  if (redis) {
    try {
      await redis.lpush(LOG_KEY, JSON.stringify(entry));
      await redis.ltrim(LOG_KEY, 0, MAX_LOG - 1);
      await redis.incr(TOTAL_KEY);
      const tKey = todayKey();
      await redis.incr(tKey);
      await redis.expire(tKey, 3 * 86400);
      return;
    } catch {
      /* Redis xatosi — memory ga tushamiz */
    }
  }

  memoryLog.unshift(entry);
  if (memoryLog.length > MAX_LOG) memoryLog.pop();
  memoryTotal += 1;
  if (memoryTodayKey !== today) {
    memoryTodayKey = today;
    memoryToday = 0;
  }
  memoryToday += 1;
}

export async function getAdminActivity() {
  let entries = [];
  let total = 0;
  let today = 0;

  if (redis) {
    try {
      const raw = await redis.lrange(LOG_KEY, 0, MAX_LOG - 1);
      entries = (raw || [])
        .map((s) => {
          try {
            return JSON.parse(s);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
      total = Number(await redis.get(TOTAL_KEY)) || 0;
      today = Number(await redis.get(todayKey())) || 0;
      return { entries, total, today, mode: 'redis' };
    } catch {
      /* fall through */
    }
  }

  entries = [...memoryLog];
  total = memoryTotal;
  today = memoryTodayKey === dayKey() ? memoryToday : 0;
  return { entries, total, today, mode: 'memory' };
}
