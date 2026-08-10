import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  FaChartBar as Chart, FaFire as Flame, FaCoins as Coins,
  FaBookOpen as BookOpen, FaTrophy as Trophy, FaArrowLeft as ArrowLeft,
  FaCalendarCheck as CalendarCheck, FaClock as Clock,
  FaTelegram as Telegram, FaWhatsapp as Whatsapp, FaShareAlt as ShareAlt,
  FaCheckCircle as CheckCircle,
} from 'react-icons/fa';
import { shareToTelegram, shareToWhatsApp, copyToClipboard } from '../lib/share';

const DAY_MS = 86400000;

// Hafta kunlari nomlari (dushanbadan boshlab)
const WEEKDAYS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

function dayStart(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export default function WeeklyReport({ onBack }) {
  const { state } = useApp();
  const [shared, setShared] = useState('');

  const handleShare = (fn) => {
    const text = `📊 Lingohub haftalik hisobotim: ${totalLessons} ta dars, ${streakDays} faol kun, ${state.coins} tanga! Siz ham 130+ tilni bepul o'rganing!`;
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://lingohub.uz';
    fn(`${url}/#/`, text);
    setShared('✅ Ulashish oynasi ochildi!');
    setTimeout(() => setShared(''), 3000);
  };

  const handleCopy = async () => {
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://lingohub.uz';
    const text = `📊 Lingohub haftalik hisobotim: ${totalLessons} ta dars, ${streakDays} faol kun! Siz ham 130+ tilni bepul o'rganing: ${url}/#/`;
    const ok = await copyToClipboard(text);
    setShared(ok ? '✅ Nusxalandi!' : 'Xatolik');
    setTimeout(() => setShared(''), 3000);
  };

  const report = useMemo(() => {
    // Oxirgi 7 kun — progress timestamp'laridan darslar sonini hisoblaymiz
    const days = [];
    const todayStart = dayStart(Date.now());

    for (let i = 6; i >= 0; i--) {
      const start = todayStart - i * DAY_MS;
      const end = start + DAY_MS;
      const label = i === 0 ? 'Bugun' : WEEKDAYS[(new Date(start).getDay() + 6) % 7];
      const isToday = i === 0;
      days.push({ start, end, label, isToday, lessons: 0, coins: 0 });
    }

    // Dars timestamp'larini kunlarga taqsimlash
    Object.values(state.progress).forEach((p) => {
      if (!p?.timestamp) return;
      const day = days.find((d) => p.timestamp >= d.start && p.timestamp < d.end);
      if (day && p.completed) day.lessons++;
    });

    // Streak: oxirgi kunlardagi darslar ketma-ketligi
    let streakDays = 0;
    for (let i = 6; i >= 0; i--) {
      if (days[i].lessons > 0) streakDays++;
      else if (!days[i].isToday) break;
    }

    const totalLessons = days.reduce((s, d) => s + d.lessons, 0);
    const maxLessons = Math.max(1, ...days.map((d) => d.lessons));
    const achievementsUnlocked = (state.achievements || []).filter((a) => a.unlocked).length;

    return { days, totalLessons, maxLessons, streakDays, achievementsUnlocked };
  }, [state.progress, state.achievements]);

  const { days, totalLessons, maxLessons, streakDays } = report;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn btn-ghost btn-sm btn-circle" title="Orqaga">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Chart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">Haftalik hisobot</h1>
            <p className="text-xs opacity-60">So'nggi 7 kundagi faoliyatingiz 📊</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleShare(shareToTelegram)}
            className="btn btn-sm btn-ghost border border-base-300 gap-1"
            title="Telegram'da ulashish"
          >
            <Telegram className="w-4 h-4 text-[#229ED9]" />
          </button>
          <button
            onClick={() => handleShare(shareToWhatsApp)}
            className="btn btn-sm btn-ghost border border-base-300 gap-1"
            title="WhatsApp'da ulashish"
          >
            <Whatsapp className="w-4 h-4 text-[#25D366]" />
          </button>
          <button
            onClick={handleCopy}
            className="btn btn-sm btn-ghost border border-base-300 gap-1"
            title="Nusxalash"
          >
            {shared ? <CheckCircle className="w-4 h-4 text-success" /> : <ShareAlt className="w-4 h-4 text-primary" />}
          </button>
        </div>
        <div className="badge badge-success badge-lg gap-1.5">
          <CalendarCheck className="w-4 h-4" /> {totalLessons} ta dars
        </div>
      </div>
      {shared && (
        <p className="text-[11px] text-success -mt-2 flex items-center gap-1 animate-fadeInUp">{shared}</p>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="card bg-base-100 border border-base-300 p-4 text-center">
          <BookOpen className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold">{totalLessons}</p>
          <p className="text-[10px] opacity-50">Dars tugatilgan</p>
        </div>
        <div className="card bg-base-100 border border-base-300 p-4 text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-xl font-bold">{streakDays}</p>
          <p className="text-[10px] opacity-50">Faol kun (hafta)</p>
        </div>
        <div className="card bg-base-100 border border-base-300 p-4 text-center">
          <Coins className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-xl font-bold">{state.coins}</p>
          <p className="text-[10px] opacity-50">Tangalar</p>
        </div>
        <div className="card bg-base-100 border border-base-300 p-4 text-center">
          <Trophy className="w-5 h-5 text-warning mx-auto mb-1" />
          <p className="text-xl font-bold">{report.achievementsUnlocked}</p>
          <p className="text-[10px] opacity-50">Yutuqlar</p>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="card bg-base-100 border border-base-300 p-5">
        <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-primary" /> Kunlik darslar
        </h3>
        <div className="flex items-end gap-2 sm:gap-3 h-40">
          {days.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full">
              <span className="text-[10px] font-bold opacity-70">{d.lessons > 0 ? d.lessons : ''}</span>
              <div
                className={`w-full rounded-t-lg transition-all duration-500 ${
                  d.isToday
                    ? 'bg-gradient-to-t from-primary to-secondary'
                    : d.lessons > 0
                      ? 'bg-gradient-to-t from-primary/70 to-primary/40'
                      : 'bg-base-200'
                }`}
                style={{ height: `${d.lessons > 0 ? Math.max(8, (d.lessons / maxLessons) * 100) : 6}%` }}
              />
              <span className={`text-[10px] ${d.isToday ? 'font-bold text-primary' : 'opacity-50'}`}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily breakdown */}
      <div className="card bg-base-100 border border-base-300 p-5">
        <h3 className="font-bold text-sm mb-3">Kunlik taqsimot</h3>
        <div className="space-y-1.5">
          {days.map((d, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className={`w-14 text-xs font-medium ${d.isToday ? 'text-primary' : 'opacity-60'}`}>
                {d.label}
              </span>
              <div className="flex-1 h-2 bg-base-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${d.lessons > 0 ? 'bg-gradient-to-r from-primary to-secondary' : ''}`}
                  style={{ width: `${(d.lessons / maxLessons) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right text-xs font-bold">
                {d.lessons}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Motivation */}
      <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 p-5 text-center">
        {totalLessons === 0 ? (
          <p className="text-sm opacity-70">💪 Bu hafta hali dars qilinmagan — boshlash uchun eng yaxshi vaqt hozir!</p>
        ) : totalLessons >= 7 ? (
          <p className="text-sm font-medium">🌟 Ajoyib hafta! {totalLessons} ta dars — har kuni o'rgandiz. Davom eting!</p>
        ) : streakDays >= 3 ? (
          <p className="text-sm font-medium">🔥 {streakDays} kun izchillik — bu zo'r natija! Yana davom eting.</p>
        ) : (
          <p className="text-sm opacity-70">📚 {totalLessons} ta dars tugatildi. Har kuni ozgina o'rgansangiz, katta natijaga erishasiz!</p>
        )}
      </div>
    </div>
  );
}
