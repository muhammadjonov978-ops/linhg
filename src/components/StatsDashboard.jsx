import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { languages } from '../data/languages';
import {
  BarChart3, BookOpen, Headphones, Pencil, Mic,
  Clock, Flame, Star, Activity, Zap
} from 'lucide-react';

export default function StatsDashboard() {
  const { state } = useApp();
  const [activeStat, setActiveStat] = useState('overview');

  const currentLang = languages.find(l => l.id === state.selectedLanguage);

  // Calculate stats from lesson-based progress
  const calculateStats = () => {
    let totalLessons = 0;
    let totalScore = 0;
    let scoreCount = 0;
    let completedLessons = 0;
    let typeScores = { alphabet: [], vocabulary: [], reading: [], listening: [], speaking: [], writing: [], grammar: [] };

    Object.entries(state.progress).forEach(([key, prog]) => {
      if (!currentLang || !key.startsWith(`${currentLang.id}-lesson-`)) return;
      totalLessons++;
      if (prog.completed) completedLessons++;
      if (prog.score) {
        totalScore += prog.score;
        scoreCount++;
      }
    });

    const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    // Weekly activity (mock - based on timestamps)
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyActivity = weekDays.map((day, i) => {
      const dayProgress = Object.values(state.progress).filter(p =>
        p.timestamp && new Date(p.timestamp).getDay() === i
      );
      return {
        day,
        count: Math.min(dayProgress.length, 5),
        active: dayProgress.length > 0,
      };
    });

    return {
      totalLessons,
      completedLessons,
      avgScore,
      weeklyActivity,
    };
  };

  const stats = calculateStats();

  const tabs = [
    { id: 'overview', label: 'Umumiy', icon: BarChart3 },
    { id: 'skills', label: 'Ko\'nikmalar', icon: Activity },
    { id: 'weekly', label: 'Haftalik', icon: Clock },
  ];

  const skillCards = [
    { skill: 'Alifbo', icon: BookOpen, color: 'info' },
    { skill: 'O\'qish', icon: BookOpen, color: 'secondary' },
    { skill: 'Tinglash', icon: Headphones, color: 'warning' },
    { skill: 'Yozish', icon: Pencil, color: 'accent' },
    { skill: 'Gapirish', icon: Mic, color: 'error' },
  ];

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-info" />
            </div>
            <h3 className="font-bold text-sm">Statistika</h3>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-base-200 rounded-lg p-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStat(tab.id)}
                className={`flex-1 btn btn-xs gap-1 ${
                  activeStat === tab.id ? 'btn-primary' : 'btn-ghost'
                }`}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeStat === 'overview' && (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
            {/* Main stat cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-base-200 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-primary">{stats.totalLessons}</p>
                <p className="text-xs opacity-50">Darslar</p>
              </div>
              <div className="bg-base-200 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-success">{stats.avgScore}%</p>
                <p className="text-xs opacity-50">O'rtacha natija</p>
              </div>
              <div className="bg-base-200 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-warning">{state.xp}</p>
                <p className="text-xs opacity-50">XP ball</p>
              </div>
              <div className="bg-base-200 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-secondary">{stats.completedLessons}</p>
                <p className="text-xs opacity-50">Bajarilgan</p>
              </div>
            </div>
          </div>
        )}

        {activeStat === 'skills' && (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
            <div className="grid grid-cols-2 gap-4">
              {[
                { skill: 'Alifbo', icon: BookOpen, color: 'info' },
                { skill: 'So\'zlar', icon: BookOpen, color: 'success' },
                { skill: 'O\'qish', icon: BookOpen, color: 'secondary' },
                { skill: 'Tinglash', icon: Headphones, color: 'warning' },
                { skill: 'Gapirish', icon: Mic, color: 'error' },
                { skill: 'Yozish', icon: Pencil, color: 'accent' },
              ].map(item => {
                const Icon = item.icon;
                const colorVarMap = {
                  info: 'var(--in)',
                  success: 'var(--su)',
                  secondary: 'var(--s)',
                  warning: 'var(--wa)',
                  error: 'var(--er)',
                  accent: 'var(--a)',
                };
                const themeColor = colorVarMap[item.color] || 'var(--p)';
                const mockScore = Math.min(100, Math.round((Math.random() * 50 + 50)));
                return (
                  <div key={item.skill} className="bg-base-200 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Icon className="w-4 h-4" style={{ color: `hsl(${themeColor})` }} />
                      <span className="font-medium text-sm">{item.skill}</span>
                    </div>
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
                        <circle cx="36" cy="36" r="32" fill="none" stroke="currentColor" className="text-base-300" strokeWidth="4" />
                        <circle
                          cx="36" cy="36" r="32" fill="none"
                          stroke="currentColor"
                          style={{ color: `hsl(${themeColor})`, strokeDasharray: `${2 * Math.PI * 32}`, strokeDashoffset: `${2 * Math.PI * 32 * (1 - mockScore / 100)}` }}
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold" style={{ color: `hsl(${themeColor})` }}>{mockScore}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeStat === 'weekly' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            {/* Weekly activity chart */}
            <div className="bg-base-200 rounded-xl p-4">
              <h4 className="text-xs font-medium opacity-60 mb-3 flex items-center gap-2">
                <Activity className="w-3 h-3" />
                Haftalik faollik
              </h4>
              <div className="flex items-end justify-between gap-2" style={{ height: 100 }}>
                {stats.weeklyActivity.map((day, i) => {
                  const height = day.count > 0 ? `${day.count * 20}%` : '8%';
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          day.active ? 'bg-primary hover:bg-primary/80' : 'bg-base-300'
                        }`}
                        style={{ height }}
                      />
                      <span className="text-[10px] opacity-50">{day.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Streak info */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-base-200 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame className="w-4 h-4 text-warning" />
                  <span className="text-lg font-bold">{state.streak}</span>
                </div>
                <p className="text-xs opacity-50">Kunlik streak</p>
              </div>
              <div className="bg-base-200 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-4 h-4 text-warning" />
                  <span className="text-lg font-bold">{stats.totalLessons}</span>
                </div>
                <p className="text-xs opacity-50">Jami darslar</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
