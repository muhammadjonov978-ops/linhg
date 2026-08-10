import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DAILY_MISSIONS, WEEKLY_MISSIONS } from '../data/missions';
import {
  FaArrowLeft as ArrowLeft, FaCheckCircle as CheckCircle, FaBolt as Zap,
  FaGift as Gift, FaSun as SunIcon, FaCalendarWeek as CalendarWeek,
  FaTrophy as Trophy, FaCoins as Coins,
} from 'react-icons/fa';

const STORAGE_KEY = 'lingohub_missions_';

function todayStr() {
  return new Date().toDateString();
}

function weekStartStr() {
  const d = new Date();
  const day = d.getDay() === 0 ? 7 : d.getDay();
  d.setDate(d.getDate() - day + 1); // dushanba
  return d.toDateString();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { date: '', week: '', daily: {}, weekly: {} };
}

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch { /* ignore */ }
}

export default function MissionsPage({ onBack }) {
  const { state, dispatch } = useApp();
  const [claimedDaily, setClaimedDaily] = useState({});
  const [claimedWeekly, setClaimedWeekly] = useState({});

  // Sana almashganda claimed'lar tozalanadi (kunlik) / hafta almashganda (haftalik)
  const today = todayStr();
  const week = weekStartStr();

  useEffect(() => {
    const saved = loadState();
    if (saved.date !== today) {
      saved.date = today;
      saved.daily = {};
    }
    if (saved.week !== week) {
      saved.week = week;
      saved.weekly = {};
    }
    saveState(saved);
    setClaimedDaily(saved.daily);
    setClaimedWeekly(saved.weekly);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today, week]);

  // Bajarilganlikni tekshirish (har state o'zgarganda)
  const { dailyCompleted, weeklyCompleted } = useMemo(() => {
    const daily = DAILY_MISSIONS.filter((m) => m.check(state)).map((m) => m.id);
    const weekly = WEEKLY_MISSIONS.filter((m) => m.check(state)).map((m) => m.id);
    return { dailyCompleted: new Set(daily), weeklyCompleted: new Set(weekly) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.progress, state.tutorMessages, state.mistakesReviewed, state.selectedLanguage]);

  const handleClaim = (mission, kind) => {
    const claimed = kind === 'daily' ? claimedDaily : claimedWeekly;
    const setClaimed = kind === 'daily' ? setClaimedDaily : setClaimedWeekly;
    const completedSet = kind === 'daily' ? dailyCompleted : weeklyCompleted;
    if (!completedSet.has(mission.id) || claimed[mission.id]) return;

    dispatch({ type: 'ADD_COINS', payload: mission.reward });
    const next = { ...claimed, [mission.id]: true };
    setClaimed(next);

    const saved = loadState();
    if (kind === 'daily') saved.daily = next;
    else saved.weekly = next;
    saved.date = today;
    saved.week = week;
    saveState(saved);
  };

  const dailyCount = DAILY_MISSIONS.filter((m) => dailyCompleted.has(m.id)).length;
  const weeklyCount = WEEKLY_MISSIONS.filter((m) => weeklyCompleted.has(m.id)).length;

  const renderMissions = (missions, kind, completedSet, claimedSet, count, total, icon, title, subtitle) => (
    <div className="card bg-base-100 border border-base-300 overflow-hidden">
      <div className="p-5 border-b border-base-300 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
              {icon}
            </div>
            <div>
              <h3 className="font-bold">{title}</h3>
              <p className="text-xs opacity-50">{subtitle}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">{count}/{total}</p>
            <p className="text-[10px] opacity-40">bajarildi</p>
          </div>
        </div>
        <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-gradient-to-r from-warning to-success rounded-full transition-all duration-700"
            style={{ width: `${total ? (count / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="p-4 space-y-2">
        {missions.map((m) => {
          const done = completedSet.has(m.id);
          const claimed = claimedSet[m.id];
          return (
            <div
              key={m.id}
              className={`flex items-center gap-3 p-3 rounded-xl text-sm transition-all duration-300 ${
                done ? 'bg-success/10 border border-success/20' : 'bg-base-200 border border-transparent'
              }`}
            >
              <span className="text-xl">{m.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium truncate ${done ? 'text-success' : ''}`}>{m.title}</span>
                  {done && <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />}
                </div>
                <p className="text-xs opacity-50">{m.desc}</p>
              </div>
              {done && claimed ? (
                <span className="flex items-center gap-1 text-xs font-bold text-success flex-shrink-0">
                  <CheckCircle className="w-3 h-3" /> +{m.reward} 🪙
                </span>
              ) : done ? (
                <button
                  onClick={() => handleClaim(m, kind)}
                  className="btn btn-xs btn-warning gap-1 flex-shrink-0 animate-[fadeIn_0.4s_ease-out]"
                >
                  <Zap className="w-3 h-3" /> +{m.reward} 🪙
                </button>
              ) : (
                <span className="flex items-center gap-1 text-xs font-bold text-warning flex-shrink-0">
                  <Coins className="w-3 h-3" /> +{m.reward}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="btn btn-ghost btn-sm btn-circle" title="Orqaga">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-warning to-orange-500 flex items-center justify-center text-xl shadow-lg shadow-warning/25">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold flex items-center gap-2">
            Missiyalar <span className="text-sm opacity-60">· {state.coins} 🪙</span>
          </h1>
          <p className="text-xs opacity-60">Vazifalarni bajarib, tangalar yig'ing!</p>
        </div>
      </div>

      {renderMissions(
        DAILY_MISSIONS, 'daily', dailyCompleted, claimedDaily,
        dailyCount, DAILY_MISSIONS.length,
        <SunIcon className="w-5 h-5 text-warning" />,
        "Kunlik missiyalar", "Har kuni yangilanadi — ertalab kelib tekshiring!"
      )}

      {renderMissions(
        WEEKLY_MISSIONS, 'weekly', weeklyCompleted, claimedWeekly,
        weeklyCount, WEEKLY_MISSIONS.length,
        <CalendarWeek className="w-5 h-5 text-secondary" />,
        "Haftalik missiyalar", "Har dushanba kuni yangilanadi"
      )}

      {/* Bonus animation */}
      {dailyCount === DAILY_MISSIONS.length && weeklyCount === WEEKLY_MISSIONS.length && (
        <div className="p-4 bg-gradient-to-r from-warning/15 to-success/15 rounded-2xl text-center border border-warning/20 animate-[fadeIn_0.5s_ease-out]">
          <Gift className="w-6 h-6 text-warning mx-auto mb-1" />
          <p className="font-bold text-sm">Barcha missiyalar bajarildi! Siz haqiqiy chempionsiz! 🏆</p>
        </div>
      )}
    </div>
  );
}
