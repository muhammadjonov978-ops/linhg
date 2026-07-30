'use client';

import { use } from 'react';
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { languages, levels } from '../../data/languages';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock, ChevronRight, Trophy, CheckCircle,
  Crown, ArrowLeft, TrendingUp
} from 'lucide-react';
import PaywallModal from '../../components/PaywallModal';
import DailyChallenge from '../../components/DailyChallenge';
import AchievementsPanel from '../../components/AchievementsPanel';
import StatsDashboard from '../../components/StatsDashboard';
import StreakCalendar from '../../components/StreakCalendar';

export default function LanguageDashboardPage({ params }: { params: Promise<{ langId: string }> }) {
  const { langId } = use(params);
  const { state, dispatch, isLevelUnlocked, isLevelAvailable, getLevelProgress } = useApp();
  const router = useRouter();
  const [showPaywall, setShowPaywall] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    if (state.selectedLanguage !== langId) {
      dispatch({ type: 'SELECT_LANGUAGE', payload: langId });
    }
  }, [langId]);

  const currentLang = languages.find(l => l.id === langId);
  if (!currentLang) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Til topilmadi</h2>
          <a href="/" className="btn btn-primary">Bosh sahifaga qaytish</a>
        </div>
      </div>
    );
  }

  const handleLevelClick = (levelId: string) => {
    if (levelId === 'advanced' && !state.isPremium) {
      setShowPaywall(true);
      return;
    }
    if (isLevelUnlocked(langId, levelId)) {
      dispatch({ type: 'SET_CURRENT_LEVEL', payload: levelId });
      router.push(`/${langId}/${levelId}`);
    }
  };

  const handleUnlockPremium = () => {
    dispatch({ type: 'UNLOCK_PREMIUM' });
    dispatch({ type: 'SET_CURRENT_LEVEL', payload: 'advanced' });
    router.push(`/${langId}/advanced`);
  };

  const totalProgress = levels.reduce((acc, level) => {
    const prog = getLevelProgress(langId, level.id);
    if (prog.completed) acc.completed++;
    acc.total = levels.length;
    return acc;
  }, { completed: 0, total: levels.length });

  const achievementsUnlocked = state.achievements?.filter(a => a.unlocked)?.length || 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link
            href="/"
            onClick={() => dispatch({ type: 'SELECT_LANGUAGE', payload: null })}
            className="btn btn-ghost btn-sm gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Barcha tillar
          </Link>

          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{currentLang.flag}</span>
              <div>
                <h1 className="text-3xl font-bold">{currentLang.name}</h1>
                <p className="opacity-60">{currentLang.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:ml-auto">
              <div className="flex items-center gap-1 badge badge-primary badge-lg p-3">
                <Trophy className="w-4 h-4 text-warning" />
                <span className="font-bold">{state.xp} XP</span>
              </div>
              <div className="badge badge-secondary badge-lg p-3">
                <TrendingUp className="w-4 h-4" />
                {totalProgress.completed}/{totalProgress.total}
              </div>
              {state.streak > 0 && (
                <div className="badge badge-warning badge-lg p-3">
                  🔥 {state.streak} kun
                </div>
              )}
              {achievementsUnlocked > 0 && (
                <div className="badge badge-success badge-lg p-3">
                  🏆 {achievementsUnlocked} yutuq
                </div>
              )}
            </div>
          </div>

          <div className="w-full h-3 bg-base-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full transition-all duration-1000"
              style={{ width: `${(totalProgress.completed / totalProgress.total) * 100}%` }}
            />
          </div>
          <p className="text-xs opacity-50 mt-2">
            Umumiy taraqqiyot: {totalProgress.completed}/{totalProgress.total} daraja
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Levels */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-4">
              {levels.map((level, index) => {
                const unlocked = isLevelUnlocked(langId, level.id);
                const available = isLevelAvailable(level.id);
                const progress = getLevelProgress(langId, level.id);
                const isLocked = !unlocked || !available;
                const isCurrentLevel = state.currentLevel === level.id;

                const exCount = progress.exercises ? Object.values(progress.exercises).filter(e => e.completed).length : 0;
                const totalEx = 8;

                const skillScore = (skill: string) => {
                  const ex = progress.exercises[`skill-${skill}`];
                  return ex?.score || 0;
                };

                return (
                  <button
                    key={level.id}
                    onClick={() => handleLevelClick(level.id)}
                    disabled={isLocked && !(level.id === 'advanced' && !state.isPremium)}
                    className={`card bg-base-100 border-2 transition-all duration-300 group text-left
                      ${isLocked ? 'opacity-50 cursor-not-allowed border-base-300' : 'hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer border-base-300'}
                      ${progress.completed ? 'border-success/50 bg-success/5' : ''}
                      ${isCurrentLevel ? 'border-primary shadow-md' : ''}
                    `}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="card-body p-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0
                          ${isLocked ? 'bg-base-300' : progress.completed ? 'bg-success/20' : level.isPremium ? 'bg-warning/10' : 'bg-primary/10'}
                        `}>
                          {isLocked ? <Lock className="w-6 h-6 opacity-50" /> : level.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-2">
                            <h3 className="font-bold text-lg">{level.name}</h3>
                            <span className={`badge badge-sm ${level.isPremium ? 'badge-warning' : 'badge-ghost'}`}>
                              {level.code}
                            </span>
                            {level.isPremium && !state.isPremium && (
                              <span className="badge badge-warning badge-sm gap-1">
                                <Crown className="w-3 h-3" /> Pro
                              </span>
                            )}
                            {level.isPremium && state.isPremium && (
                              <span className="badge badge-success badge-sm gap-1">
                                <Crown className="w-3 h-3" /> Ochilgan
                              </span>
                            )}
                            {progress.completed && (
                              <CheckCircle className="w-4 h-4 text-success" />
                            )}
                          </div>
                          <p className="text-sm opacity-60 truncate">{level.description}</p>

                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex-1 max-w-xs">
                              <div className="h-2 bg-base-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    progress.completed ? 'bg-success' : 'bg-primary'
                                  }`}
                                  style={{ width: `${(exCount / totalEx) * 100}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-xs opacity-50">{exCount}/{totalEx}</span>
                            {progress.bestScore > 0 && (
                              <span className="text-xs text-success">Eng yaxshi: {progress.bestScore}%</span>
                            )}
                          </div>

                          {!isLocked && (
                            <div className="flex gap-2 mt-2">
                              {['reading', 'listening', 'writing', 'speaking'].map(s => {
                                const sc = skillScore(s);
                                return (
                                  <div
                                    key={s}
                                    className={`badge badge-xs gap-1 ${
                                      sc >= 80 ? 'badge-success' : sc > 0 ? 'badge-ghost' : 'badge-ghost opacity-30'
                                    }`}
                                  >
                                    {s === 'reading' ? '📖' : s === 'listening' ? '🎧' : s === 'writing' ? '✍️' : '🎤'}
                                    {sc > 0 ? `${sc}%` : ''}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-60 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column - Widgets */}
          <div className="space-y-4">
            <DailyChallenge />
            <AchievementsPanel limit={4} />
            <StatsDashboard />
            <StreakCalendar />
          </div>
        </div>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUnlock={handleUnlockPremium}
      />
    </div>
  );
}
