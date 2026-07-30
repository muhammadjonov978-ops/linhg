'use client';

import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Award, Sparkles, X, Zap, ChevronDown, ChevronUp } from 'lucide-react';

interface AchievementsPanelProps {
  limit?: number;
}

export default function AchievementsPanel({ limit }: AchievementsPanelProps) {
  const { state, dispatch } = useApp();
  const [showAll, setShowAll] = useState(false);
  const [newAchievement, setNewAchievement] = useState<{ name: string; icon: string; xpReward: number } | null>(null);

  const unlockedAchievements = state.achievements?.filter(a => a.unlocked) || [];
  const newUnlocked = unlockedAchievements.filter(a => a.justUnlocked);

  // Show popup for new achievements
  useEffect(() => {
    if (newUnlocked.length > 0) {
      const latest = newUnlocked[newUnlocked.length - 1];
      setNewAchievement(latest);
      setTimeout(() => setNewAchievement(null), 5000);

      // Remove justUnlocked flag after showing
      setTimeout(() => {
        dispatch({ type: 'CLAIM_ACHIEVEMENT_XP', payload: latest.xpReward });
        dispatch({ type: 'REMOVE_ACHIEVEMENT', payload: latest.id });
        // Re-add without justUnlocked
        const updated = unlockedAchievements.map(a =>
          a.id === latest.id ? { ...a, justUnlocked: false } : a
        );
        dispatch({ type: 'SET_ACHIEVEMENTS', payload: updated });
      }, 3000);
    }
  }, [state.achievements?.length]);

  const displayAchievements = limit && !showAll
    ? unlockedAchievements.slice(0, limit)
    : unlockedAchievements;

  const allAchievements = state.achievements || [];

  return (
    <>
      <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="card-body p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Award className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Yutuqlar</h3>
                <p className="text-xs opacity-50">{unlockedAchievements.length}/{allAchievements.length}</p>
              </div>
            </div>
            {newUnlocked.length > 0 && (
              <div className="badge badge-accent badge-sm animate-pulse">
                {newUnlocked.length} ta yangi!
              </div>
            )}
          </div>

          <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-accent to-success rounded-full transition-all duration-700"
              style={{ width: `${(unlockedAchievements.length / Math.max(allAchievements.length, 1)) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {displayAchievements.map(achievement => (
              <div
                key={achievement.id}
                className={`p-3 rounded-xl text-center transition-all duration-300 ${
                  achievement.justUnlocked
                    ? 'bg-accent/20 border border-accent/50 achievement-new'
                    : 'bg-base-200 hover:bg-base-300 border border-transparent'
                }`}
              >
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <p className="text-xs font-medium leading-tight">{achievement.name}</p>
                <p className="text-[10px] opacity-50 mt-1">{achievement.description}</p>
                <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-warning font-bold">
                  <Zap className="w-2.5 h-2.5" />
                  +{achievement.xpReward} XP
                </div>
              </div>
            ))}
          </div>

          {limit && unlockedAchievements.length > limit && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="btn btn-ghost btn-xs w-full mt-2 gap-1"
            >
              {showAll ? (
                <>Kamroq ko'rsat <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>Yana {unlockedAchievements.length - limit} ta <ChevronDown className="w-3 h-3" /></>
              )}
            </button>
          )}

          {unlockedAchievements.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm opacity-50">Hali yutuqlar yo'q</p>
              <p className="text-xs opacity-30 mt-1">Mashq bajarib yutuqlarni oching!</p>
            </div>
          )}
        </div>
      </div>

      {/* New achievement popup */}
      {newAchievement && (
        <div className="fixed top-20 right-4 z-50 animate-[fadeIn_0.5s_ease-out]">
          <div className="bg-accent text-accent-content px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[250px]">
            <div className="text-4xl animate-bounceIn">{newAchievement.icon}</div>
            <div>
              <div className="flex items-center gap-1 text-xs opacity-80">
                <Sparkles className="w-3 h-3" />
                Yangi yutuq!
              </div>
              <p className="font-bold">{newAchievement.name}</p>
              <p className="text-xs opacity-80">+{newAchievement.xpReward} XP</p>
            </div>
            <button onClick={() => setNewAchievement(null)} className="btn btn-ghost btn-xs btn-circle ml-auto">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
