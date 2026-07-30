'use client';

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { levels } from '../data/languages';
import {
  BarChart3, BookOpen, Headphones, Pencil, Mic,
  Clock, Activity,
} from 'lucide-react';

interface WeeklyDay {
  day: string;
  count: number;
  active: boolean;
}

interface Stats {
  totalExercises: number;
  avgScore: number;
  readingAvg: number;
  listeningAvg: number;
  writingAvg: number;
  speakingAvg: number;
  levelScores: Record<string, number>;
  weeklyActivity: WeeklyDay[];
  completedLevels: number;
}

export default function StatsDashboard() {
  const { state } = useApp();
  const [activeStat, setActiveStat] = useState('overview');

  const calculateStats = (): Stats => {
    let totalExercises = 0;
    let totalScore = 0;
    let scoreCount = 0;
    const skillScores: Record<string, number[]> = { reading: [], listening: [], writing: [], speaking: [] };
    const levelScores: Record<string, number> = {};

    Object.entries(state.progress).forEach(([key, prog]) => {
      const [langId, levelId] = key.split('-');
      if (langId === state.selectedLanguage) {
        levelScores[levelId] = prog.bestScore || 0;
        Object.entries(prog.exercises).forEach(([exKey, ex]) => {
          totalExercises++;
          totalScore += ex.score;
          scoreCount++;
          const skill = exKey.replace('skill-', '');
          if (skillScores[skill]) {
            skillScores[skill].push(ex.score);
          }
        });
      }
    });

    const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    const getSkillAvg = (scores: number[]) => {
      return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyActivity: WeeklyDay[] = weekDays.map((day, i) => {
      const dayProgress = Object.values(state.progress).filter(p =>
        Object.values(p.exercises).some(e =>
          e.timestamp && new Date(e.timestamp).getDay() === i
        )
      );
      return {
        day,
        count: Math.min(dayProgress.length, 5),
        active: dayProgress.length > 0,
      };
    });

    return {
      totalExercises,
      avgScore,
      readingAvg: getSkillAvg(skillScores.reading),
      listeningAvg: getSkillAvg(skillScores.listening),
      writingAvg: getSkillAvg(skillScores.writing),
      speakingAvg: getSkillAvg(skillScores.speaking),
      levelScores,
      weeklyActivity,
      completedLevels: Object.values(levelScores).filter(s => s >= 80).length,
    };
  };

  const stats = calculateStats();

  const tabs = [
    { id: 'overview', label: 'Umumiy', icon: BarChart3 },
    { id: 'skills', label: "Ko'nikmalar", icon: Activity },
    { id: 'weekly', label: 'Haftalik', icon: Clock },
  ];

  const colorVarMap: Record<string, string> = {
    primary: 'var(--p)',
    secondary: 'var(--s)',
    accent: 'var(--a)',
    error: 'var(--er)',
    warning: 'var(--wa)',
    info: 'var(--in)',
    success: 'var(--su)',
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-info" />
            </div>
            <h3 className="font-bold text-sm">Statistika</h3>
          </div>
        </div>

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
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-base-200 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-primary">{stats.totalExercises}</p>
                <p className="text-xs opacity-50">Mashqlar</p>
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
                <p className="text-2xl font-bold text-secondary">{stats.completedLevels}/{levels.length}</p>
                <p className="text-xs opacity-50">Darajalar</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium opacity-60 mb-2">Darajalar bo'yicha natijalar</h4>
              <div className="space-y-2">
                {levels.map(level => {
                  const score = stats.levelScores[level.id] || 0;
                  const barWidth = score > 0 ? `${score}%` : '0%';
                  const color = level.isPremium ? 'warning' : 'primary';
                  return (
                    <div key={level.id} className="flex items-center gap-2">
                      <span className="text-xs w-24 truncate">{level.icon} {level.name}</span>
                      <div className="flex-1 h-3 bg-base-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 bg-${color}`}
                          style={{ width: barWidth }}
                        />
                      </div>
                      <span className={`text-xs font-bold w-10 text-right ${score >= 80 ? 'text-success' : ''}`}>
                        {score > 0 ? `${score}%` : '\u2014'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeStat === 'skills' && (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
            <div className="grid grid-cols-2 gap-4">
              {[
                { skill: 'Reading', icon: BookOpen, score: stats.readingAvg, color: 'primary' },
                { skill: 'Listening', icon: Headphones, score: stats.listeningAvg, color: 'secondary' },
                { skill: 'Writing', icon: Pencil, score: stats.writingAvg, color: 'accent' },
                { skill: 'Speaking', icon: Mic, score: stats.speakingAvg, color: 'error' },
              ].map(item => {
                const Icon = item.icon;
                const score = item.score;
                const themeColor = colorVarMap[item.color] || 'var(--p)';
                const circumference = 2 * Math.PI * 32;
                const offset = circumference * (1 - score / 100);
                return (
                  <div key={item.skill} className="bg-base-200 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Icon className="w-4 h-4" style={{ color: `hsl(${themeColor})` }} />
                      <span className="font-medium text-sm">{item.skill}</span>
                    </div>
                    <div className="relative w-20 h-20 mx-auto mb-2">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
                        <circle cx="36" cy="36" r="32" fill="none" stroke="currentColor" className="text-base-300" strokeWidth="4" />
                        <circle
                          cx="36" cy="36" r="32" fill="none"
                          stroke="currentColor"
                          style={{ color: `hsl(${themeColor})`, strokeDasharray: `${circumference}`, strokeDashoffset: `${offset}` }}
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold" style={{ color: `hsl(${themeColor})` }}>{score}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-base-300 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${score}%`, backgroundColor: `hsl(${themeColor})` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeStat === 'weekly' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
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
                        className={`w-full rounded-lg transition-all duration-500 ${
                          day.active ? 'bg-primary' : 'bg-base-300'
                        }`}
                        style={{ height, minHeight: '8%' }}
                      />
                      <span className="text-[10px] opacity-50">{day.day.slice(0, 2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
