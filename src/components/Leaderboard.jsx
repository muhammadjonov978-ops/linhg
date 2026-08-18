import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { languages } from '../data/languages';
import { db, HAS_FIREBASE, ensureFirebaseInit } from '../firebase';
import { fetchLeaderboard, getServerUid, reportScore, computeScore } from '../lib/server';
import {
  FaTrophy as Trophy, FaCrown as Crown, FaMedal as Medal, FaFire as Flame,
  FaUser as User, FaArrowLeft as ArrowLeft,
  FaBookOpen as BookOpen, FaCloudUploadAlt as Cloud, FaUserFriends as Users,
  FaGlobe as Globe, FaMagic as Sparkles, FaServer as ServerIcon,
} from 'react-icons/fa';

// Reyting balli: tugallangan darslar + tanga + streak (server.js'dagi formula)

function loadSavedUser() {
  try {
    const raw = localStorage.getItem('lingohub_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Kirilmagan foydalanuvchilar uchun qurilma ID si (presence bilan bir xil)
function getDeviceId() {
  try {
    let id = localStorage.getItem('lingohub_presence_session');
    if (!id) {
      id = `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem('lingohub_presence_session', id);
    }
    return id;
  } catch {
    return `dev-${Math.random().toString(36).slice(2, 10)}`;
  }
}

// Demo rejim uchun namuna o'quvchilar (Firebase sozlanmaganda ko'rsatiladi)
const DEMO_USERS = [
  { name: 'Aziz', flag: '🇺🇿', lessons: 96, coins: 1240, streak: 45 },
  { name: 'Kamola', flag: '🇺🇿', lessons: 88, coins: 980, streak: 30 },
  { name: 'Timur', flag: '🇷🇺', lessons: 74, coins: 750, streak: 21 },
  { name: 'Jasmina', flag: '🇺🇿', lessons: 61, coins: 620, streak: 17 },
  { name: 'Daniel', flag: '🇰🇷', lessons: 55, coins: 480, streak: 12 },
  { name: 'Madina', flag: '🇰🇿', lessons: 47, coins: 390, streak: 9 },
  { name: 'Sherzod', flag: '🇺🇿', lessons: 38, coins: 310, streak: 7 },
  { name: 'Lola', flag: '🇹🇷', lessons: 29, coins: 250, streak: 5 },
];

function demoScore(u) {
  return u.lessons * 10 + u.coins / 10 + u.streak * 5;
}

const MEDALS = [
  { icon: '🥇', ring: 'ring-amber-400/60 border-amber-400/40', text: 'text-amber-400' },
  { icon: '🥈', ring: 'ring-slate-300/60 border-slate-300/40', text: 'text-slate-300' },
  { icon: '🥉', ring: 'ring-orange-600/60 border-orange-600/40', text: 'text-orange-500' },
];

export default function Leaderboard({ onBack }) {
  const { state } = useApp();
  const [tab, setTab] = useState('global'); // 'global' | 'lang'
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [synced, setSynced] = useState(false);
  // Server rejim (Redis) — frontend'ning asosiy manbasi; Firebase demo sifatida
  const [serverEntries, setServerEntries] = useState(null);
  const [serverMode, setServerMode] = useState(null); // 'redis' | 'memory' | null

  const savedUser = loadSavedUser();
  const myName = savedUser?.name || 'Siz';
  const myScore = computeScore(state);

  const completedCount = Object.values(state.progress).filter((p) => p.completed).length;

  // SERVER reyting: o'z ballini yozish + jadvalni o'qish
  useEffect(() => {
    let cancelled = false;
    const uid = getServerUid();
    reportScore(state, uid).then((r) => {
      if (cancelled) return;
      if (r?.ok) {
        fetchLeaderboard(uid).then((data) => {
          if (cancelled || !data?.ok) return;
          setServerEntries(data.entries || []);
          setServerMode(data.mode || 'redis');
          setSynced(true);
        });
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myScore]);

  // Firebase'ga o'z reytingimizni yozish + boshqalarni o'qish (server bo'lmasa fallback)
  useEffect(() => {
    if (!HAS_FIREBASE) {
      setSynced(false);
      return;
    }
    let cancelled = false;
    let unsub = null;
    (async () => {
      try {
        const { ref, set, onValue, serverTimestamp } = await import('firebase/database');
        await ensureFirebaseInit();
        const uid = savedUser?.sub || getDeviceId();
        const myRef = ref(db, `leaderboard/${uid}`);
        set(myRef, {
          name: myName,
          score: Math.round(myScore),
          lessons: completedCount,
          coins: state.coins || 0,
          streak: state.streak || 0,
          updatedAt: serverTimestamp(),
        }).catch(() => {});

        const listRef = ref(db, 'leaderboard');
        unsub = onValue(listRef, (snap) => {
          if (cancelled) return;
          const data = snap.val() || {};
          const users = Object.entries(data)
            .filter(([, u]) => u && typeof u.score === 'number')
            .map(([key, u]) => ({ ...u, key }))
            .sort((a, b) => b.score - a.score);
          setOnlineUsers(users);
        });
      } catch {
        /* firebase sozlanmagan/xato — server yoki demo rejim ishlayveradi */
      }
    })();
    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myScore]);

  // Global ro'yxat: SERVER > Firebase > demo
  const globalList = useMemo(() => {
    // 1) Server reyting (Redis) — hamma qurilmalarda umumiy
    if (serverEntries && serverEntries.length > 0) {
      const myKey = getServerUid();
      return serverEntries.map((u) => ({
        name: u.name || 'O\'quvchi',
        flag: '🏅',
        score: Math.round(u.score || 0),
        lessons: u.lessons || 0,
        coins: u.coins || 0,
        streak: u.streak || 0,
        isMe: u.uid === myKey,
      }));
    }
    // 2) Firebase (agar server yo'q bo'lsa)
    if (HAS_FIREBASE && onlineUsers.length > 0) {
      const myKey = savedUser?.sub || getDeviceId();
      return onlineUsers.map((u) => ({
        name: u.name || 'O\'quvchi',
        flag: '🏅',
        score: Math.round(u.score || 0),
        lessons: u.lessons || 0,
        coins: u.coins || 0,
        streak: u.streak || 0,
        isMe: u.key === myKey,
      }));
    }
    // 3) Demo: namuna o'quvchilar + o'zimiz (agar faollik bo'lsa)
    const demo = DEMO_USERS.map((u) => ({ ...u, score: demoScore(u), isMe: false }));
    if (myScore > 0) {
      demo.push({ name: myName, flag: '🫵', lessons: completedCount, coins: state.coins || 0, streak: state.streak || 0, score: myScore, isMe: true });
    }
    return demo.sort((a, b) => b.score - a.score);
  }, [serverEntries, onlineUsers, myScore, myName, completedCount, state.coins, state.streak, savedUser]);

  // Til bo'yicha reyting — faqat o'zimiz + til statistikasi
  const langList = useMemo(() => {
    if (!state.selectedLanguage) return [];
    const lang = languages.find((l) => l.id === state.selectedLanguage);
    const keys = Object.keys(state.progress).filter((k) =>
      k.startsWith(`${state.selectedLanguage}-lesson-`) && state.progress[k]?.completed
    );
    return {
      lang,
      completed: keys.length,
      total: 100,
      percent: Math.round((keys.length / 100) * 100),
    };
  }, [state.selectedLanguage, state.progress]);

  const rank = globalList.findIndex((u) => u.isMe) + 1;
  const top3 = globalList.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn btn-ghost btn-sm btn-circle" title="Orqaga">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">Reyting jadvali</h1>
            <p className="text-xs opacity-60">Eng faol o'quvchilar bilan raqobatlashing! 🔥</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {serverMode ? (
            <span className="badge badge-success badge-sm gap-1">
              <ServerIcon className="w-3 h-3" /> {serverMode === 'redis' ? 'Server reyting' : 'Demo (xotira)'}
            </span>
          ) : synced ? (
            <span className="badge badge-success badge-sm gap-1">
              <Cloud className="w-3 h-3" /> Onlayn sinxron
            </span>
          ) : (
            <span className="badge badge-ghost badge-sm gap-1" title="Firebase kalitlari .env faylga qo'shilsa, reyting barcha o'quvchilarda umumiy bo'ladi">
              <Sparkles className="w-3 h-3 text-warning" /> Demo rejim
            </span>
          )}
          {rank > 0 && (
            <span className="badge badge-primary badge-sm gap-1">
              <Crown className="w-3 h-3" /> Sizning joy: {rank}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('global')}
          className={`btn btn-sm gap-1.5 ${tab === 'global' ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
        >
          <Globe className="w-3.5 h-3.5" /> Global
        </button>
        <button
          onClick={() => setTab('lang')}
          className={`btn btn-sm gap-1.5 ${tab === 'lang' ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Til bo'yicha
        </button>
      </div>

      {tab === 'global' ? (
        <>
          {/* Podium (TOP 3) */}
          {top3.length > 0 && (
            <div className="grid grid-cols-3 gap-2 items-end">
              {[1, 0, 2].map((idx) => {
                const u = top3[idx];
                if (!u) return <div key={idx} />;
                const medal = MEDALS[idx];
                const height = idx === 0 ? 'h-28' : idx === 1 ? 'h-20' : 'h-16';
                return (
                  <div key={idx} className={`card bg-base-100 border ${medal.ring} shadow-lg flex flex-col items-center pt-4 ${height}`}>
                    <span className="text-3xl mb-1">{medal.icon}</span>
                    <p className="font-bold text-sm truncate max-w-full px-2">{u.name}</p>
                    <p className={`text-lg font-extrabold ${medal.text}`}>{Math.round(u.score)}</p>
                    {u.isMe && <span className="badge badge-primary badge-xs mt-1">Siz</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Rest of list */}
          <div className="card bg-base-100 border border-base-300 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" /> TOP o'quvchilar
              </h3>
              <span className="text-xs opacity-40">Ball = dars×10 + tanga/10 + streak×5</span>
            </div>
            <div className="divide-y divide-base-300/60">
              {globalList.map((u, i) => (
                <div
                  key={`${u.name}-${i}`}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    u.isMe ? 'bg-primary/10' : 'hover:bg-base-200/50'
                  }`}
                >
                  <span className={`w-7 text-center font-bold ${i < 3 ? 'text-base' : 'text-xs opacity-50'}`}>
                    {i < 3 ? MEDALS[i].icon : `#${i + 1}`}
                  </span>
                  <span className="w-7 h-7 rounded-full bg-base-200 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 opacity-60" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="font-semibold truncate flex items-center gap-1.5">
                      {u.name}
                      {u.isMe && <span className="badge badge-primary badge-xs">Siz</span>}
                    </span>
                    <span className="text-[10px] opacity-40">
                      {u.lessons} dars · 🪙 {Math.round(u.coins)} · <Flame className="inline w-2.5 h-2.5 text-orange-500" /> {u.streak}
                    </span>
                  </span>
                  <span className="font-bold text-base-content/80">{Math.round(u.score)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* My stats */}
          {myScore > 0 && (
            <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Medal className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">Sizning statistika</p>
                  <p className="text-xs opacity-60">{completedCount} ta dars · {state.coins} 🪙 · {state.streak} kun streak</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-primary">{Math.round(myScore)}</p>
                  <p className="text-[10px] opacity-40">ball</p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Til bo'yicha */
        <div className="card bg-base-100 border border-base-300 p-6">
          {langList && langList.lang ? (
            <>
              <div className="flex items-center gap-4 mb-5">
                <span className="text-4xl">{langList.lang.flag}</span>
                <div>
                  <h3 className="font-bold text-lg">{langList.lang.name} reytingi</h3>
                  <p className="text-xs opacity-60">Siz bu tilda {langList.completed}/100 dars tugatgansiz</p>
                </div>
              </div>
              <div className="w-full h-4 bg-base-200 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
                  style={{ width: `${langList.percent}%` }}
                />
              </div>
              <p className="text-xs opacity-50 mb-6">{langList.percent}% tugallangan</p>

              {/* Til bo'yicha demo reyting */}
              <div className="space-y-2">
                {[
                  { name: 'Poliglot 1', flag: '🌍', percent: 100, isMe: langList.percent >= 100 },
                  { name: 'Til ustasi', flag: '🏆', percent: 92 },
                  { name: 'O\'quvchi 3', flag: '📚', percent: 78 },
                  { name: myName, flag: '🫵', percent: langList.percent, isMe: true },
                ].filter((u) => u.percent > 0).sort((a, b) => b.percent - a.percent).map((u, i) => (
                  <div key={u.name} className={`flex items-center gap-3 p-2.5 rounded-xl text-sm ${u.isMe ? 'bg-primary/10 border border-primary/20' : 'bg-base-200/50'}`}>
                    <span className="w-6 text-center font-bold text-xs opacity-50">#{i + 1}</span>
                    <span className="text-lg">{u.flag}</span>
                    <span className="flex-1 font-semibold">{u.name} {u.isMe && <span className="badge badge-primary badge-xs">Siz</span>}</span>
                    <span className="font-bold text-xs opacity-60">{u.percent}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10 opacity-60">
              <Globe className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>Reytingni ko'rish uchun til tanlang</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
