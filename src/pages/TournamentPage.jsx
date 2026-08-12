import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { fetchTournament, reportTournamentScore, claimTournamentPrize, getServerUid } from '../lib/server';
import {
  FaTrophy as Trophy, FaCrown as Crown, FaMedal as Medal, FaFire as Flame,
  FaUser as User, FaArrowLeft as ArrowLeft, FaUsers as Users,
  FaGift as Gift, FaSpinner as Loader2, FaClock as Clock, FaCoins as Coins,
} from 'react-icons/fa';

const PRIZE_LABELS = ['🥇 200🪙', '🥈 100🪙', '🥉 50🪙'];
const MEDALS = ['🥇', '🥈', '🥉'];

function useCountdown(target) {
  const [left, setLeft] = useState(() => Math.max(0, target - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, target - Date.now())), 1000);
    return () => clearInterval(t);
  }, [target]);
  const s = Math.floor(left / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return { d, h, m, s: sec };
}

export default function TournamentPage({ onBack }) {
  const { state, dispatch } = useApp();
  const [data, setData] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(true);

  const uid = getServerUid();

  // Sahifa ochilganda bir marta ball yozamiz (AppContext ham yozadi —
  // bu yerda faqat boshlang'ich sinxronlash uchun); so'ng jadvalni
  // 60 soniyada yangilaymiz (yozmasdan — keraksiz Redis yozuvlarini oldini olamiz).
  const load = useCallback(async () => {
    const res = await fetchTournament(uid);
    if (res?.ok) {
      setData(res);
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    reportTournamentScore(state, uid);
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const handleClaimPrize = async () => {
    if (claiming || claimed) return;
    setClaiming(true);
    try {
      const res = await claimTournamentPrize(uid);
      if (res?.ok && res.granted > 0) {
        dispatch({ type: 'ADD_COINS', payload: res.granted });
        setClaimed(true);
        const toast = document.createElement('div');
        toast.className = 'fixed top-20 right-4 z-[200] px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-sm font-bold shadow-2xl animate-[fadeInUp_0.4s_ease-out]';
        toast.textContent = `🏆 Turnir mukofoti: +${res.granted} tanga!`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4500);
      }
    } finally {
      setClaiming(false);
    }
  };

  const countdown = useCountdown(data?.endsAt || Date.now());
  const entries = data?.entries || [];
  const myRank = data?.myRank || -1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn btn-ghost btn-sm btn-circle" title="Orqaga">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">Haftalik Turnir</h1>
            <p className="text-xs opacity-60">TOP-3 hafta oxirida tanga yutadi! 🏆</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-secondary badge-sm gap-1">
            <Clock className="w-3 h-3" />
            {data ? `${countdown.d}k ${countdown.h}s ${countdown.m}daq qoldi` : '...'}
          </span>
          {myRank > 0 && myRank <= 3 && (
            <span className="badge badge-warning badge-sm gap-1">
              <Crown className="w-3 h-3" /> Siz TOP-3 da!
            </span>
          )}
        </div>
      </div>

      {/* Mukofot karta */}
      <div className="grid grid-cols-3 gap-2">
        {PRIZE_LABELS.map((label, i) => (
          <div key={i} className={`card bg-base-100 border text-center py-4 ${i === 0 ? 'border-amber-400/50 shadow-lg shadow-amber-500/10' : 'border-base-300'}`}>
            <span className="text-2xl mb-1">{MEDALS[i]}</span>
            <p className="text-xs opacity-50">O'rin</p>
            <p className="font-extrabold text-sm">{label.replace(/^\S+\s/, '')}</p>
          </div>
        ))}
      </div>

      {/* O'tgan hafta mukofoti */}
      {(data?.prize > 0) && (
        <div className="card bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-400/30 p-4 flex flex-wrap items-center justify-between gap-3 animate-[fadeIn_0.4s_ease-out]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">🎉 O'tgan hafta TOP-{data.prizeRank} bo'ldingiz!</p>
              <p className="text-xs opacity-60">Mukofotingizni oling: <b className="text-amber-400">+{data.prize} 🪙</b></p>
            </div>
          </div>
          <button
            onClick={handleClaimPrize}
            disabled={claiming || claimed}
            className="btn btn-warning btn-sm gap-1 border-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:brightness-110 disabled:opacity-50"
          >
            {claiming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Coins className="w-3.5 h-3.5" />}
            {claimed ? 'Olindi ✅' : 'Mukofotni olish'}
          </button>
        </div>
      )}

      {/* Jadval */}
      <div className="card bg-base-100 border border-base-300 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
          <h3 className="font-bold text-sm flex items-center gap-1.5">
            <Users className="w-4 h-4 text-violet-500" /> Turnir jadvali
          </h3>
          <span className="text-xs opacity-40">{data?.week || ''} hafta</span>
        </div>

        {loading && entries.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-10 opacity-60">
            <Loader2 className="w-4 h-4 animate-spin" /> Turnir yuklanmoqda...
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-10 opacity-60">
            <Trophy className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>Hozircha ishtirokchilar yo'q — birinchi bo'ling! 🚀</p>
            <p className="text-xs mt-1">Dars bajarish ballaringizni oshiradi</p>
          </div>
        ) : (
          <div className="divide-y divide-base-300/60">
            {entries.map((u, i) => (
              <div
                key={`${u.uid}-${i}`}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  u.uid === uid ? 'bg-violet-500/10' : 'hover:bg-base-200/50'
                }`}
              >
                <span className={`w-7 text-center font-bold ${i < 3 ? 'text-base' : 'text-xs opacity-50'}`}>
                  {i < 3 ? MEDALS[i] : `#${i + 1}`}
                </span>
                <span className="w-7 h-7 rounded-full bg-base-200 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 opacity-60" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="font-semibold truncate flex items-center gap-1.5">
                    {u.name}
                    {u.uid === uid && <span className="badge badge-secondary badge-xs">Siz</span>}
                    {i < 3 && <span className="text-[10px] opacity-50">{PRIZE_LABELS[i]}</span>}
                  </span>
                  <span className="text-[10px] opacity-40">
                    {u.lessons} dars · 🪙 {Math.round(u.coins)} · <Flame className="inline w-2.5 h-2.5 text-orange-500" /> {u.streak}
                  </span>
                </span>
                <span className="font-bold text-base-content/80">{Math.round(u.score)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Qoidalar */}
      <div className="card bg-base-100 border border-base-300 p-4">
        <h4 className="font-bold text-sm mb-2 flex items-center gap-1.5">
          <Medal className="w-4 h-4 text-amber-400" /> Qoidalar
        </h4>
        <ul className="text-xs opacity-60 space-y-1 list-disc list-inside">
          <li>Ball = tugallangan darslar × 10 + tanga/10 + streak × 5</li>
          <li>Har dushanba yangi turnir boshlanadi</li>
          <li>TOP-3: 1-o'rin 200🪙, 2-o'rin 100🪙, 3-o'rin 50🪙</li>
          <li>Mukofot keyingi haftada turnir sahifasidan olinadi</li>
        </ul>
      </div>
    </div>
  );
}
