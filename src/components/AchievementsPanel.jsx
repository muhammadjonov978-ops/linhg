import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Award, Lock, Sparkles, Zap, Trophy, ChevronRight, Gift } from 'lucide-react';

export default function AchievementsPanel({ limit }) {
  const { state, dispatch } = useApp();
  const [showAll, setShowAll] = useState(false);

  const achievements = state.achievements || [];
  const unlocked = achievements.filter(a => a.unlocked);
  const locked = limit ? [] : achievements.filter(a => !a.unlocked);
  const displayAchievements = limit ? unlocked.slice(0, limit) : achievements;
  const showViewAll = limit && unlocked.length > limit;

  const handleClaimReward = (achievement) => {
    dispatch({ type: 'CLAIM_ACHIEVEMENT_XP', payload: achievement.xpReward });
    dispatch({ type: 'REMOVE_ACHIEVEMENT', payload: achievement.id });
  };

  if (!achievements.length && !limit) {
    return (
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-5 text-center">
          <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6 opacity-30" />
          </div>
          <h3 className="font-bold text-sm">Yutuqlar</h3>
          <p className="text-xs opacity-50 mt-1">Mashqlarni bajarib, yutuqlarni oching!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="card-body p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-success" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Yutuqlar</h3>
              <p className="text-xs opacity-50">{unlocked.length} ta ochilgan</p>
            </div>
          </div>
          {limit && unlocked.length > 0 && (
            <button onClick={() => setShowAll(!showAll)} className="btn btn-ghost btn-xs">
              {showAll ? 'Yopish' : `Barchasi (${unlocked.length})`}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(showAll ? achievements : displayAchievements).map((achievement, i) => {
            const isUnlocked = achievement.unlocked;
            return (
              <div
                key={achievement.id}
                className={`
                  relative p-3 rounded-xl text-center transition-all duration-300
                  ${isUnlocked
                    ? 'bg-gradient-to-br from-success/10 to-success/5 border border-success/20 hover:shadow-sm'
                    : 'bg-base-200 border border-base-300 opacity-60'
                  }
                  ${achievement.justUnlocked ? 'animate-[fadeIn_0.5s_ease-out] ring-2 ring-success/50' : ''}
                `}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="text-2xl mb-1">{isUnlocked ? achievement.icon : '🔒'}</div>
                <p className={`text-xs font-medium ${isUnlocked ? '' : 'opacity-50'}`}>
                  {achievement.name}
                </p>
                {isUnlocked && achievement.xpReward && (
                  <div className="flex items-center justify-center gap-1 mt-1 text-xs text-warning">
                    <Zap className="w-3 h-3" />
                    +{achievement.xpReward}
                  </div>
                )}
                {isUnlocked && achievement.justUnlocked && (
                  <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Show new achievements that need claiming */}
        {unlocked.filter(a => a.justUnlocked).length > 0 && (
          <div className="mt-3 space-y-2">
            {unlocked.filter(a => a.justUnlocked).map(achievement => (
              <div
                key={achievement.id}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-warning/10 to-success/10 rounded-xl border border-success/30 animate-[fadeIn_0.5s_ease-out]"
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">                      <Gift className="w-4 h-4 text-warning" />
                    <span className="font-bold text-sm">{achievement.name}</span>
                  </div>
                  <p className="text-xs opacity-60">{achievement.description}</p>
                </div>
                <button
                  onClick={() => handleClaimReward(achievement)}
                  className="btn btn-success btn-sm gap-1"
                >
                  <Zap className="w-3 h-3" />
                  {achievement.xpReward} XP
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
