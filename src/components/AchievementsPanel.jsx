import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FaAward as Award, FaBolt as Zap, FaTrophy as Trophy, FaGift as Gift, FaCheckCircle as CheckCircle } from 'react-icons/fa';

export default function AchievementsPanel({ limit }) {
  const { state, dispatch } = useApp();
  const [showAll, setShowAll] = useState(false);

  // Clear the justUnlocked flag a few seconds after showing, so the Navbar
  // "Yangi yutuqlar" pulse badge doesn't stay forever.
  useEffect(() => {
    const justUnlocked = (state.achievements || []).filter(a => a.unlocked && a.justUnlocked);
    if (justUnlocked.length === 0) return;
    const t = setTimeout(() => {
      dispatch({
        type: 'SET_ACHIEVEMENTS',
        payload: (state.achievements || []).map(a =>
          a.justUnlocked ? { ...a, justUnlocked: false } : a
        ),
      });
    }, 5000);
    return () => clearTimeout(t);
  }, [state.achievements, dispatch]);

  const achievements = state.achievements || [];

  const handleClaim = (achievement) => {
    dispatch({
      type: 'CLAIM_ACHIEVEMENT',
      payload: { id: achievement.id, coinReward: achievement.coinReward ?? achievement.xpReward ?? 0 },
    });
  };
  const unlocked = achievements.filter(a => a.unlocked);
  const displayAchievements = limit ? unlocked.slice(0, limit) : achievements;

  // Rewards are auto-collected in AppContext when achievements unlock.
  // No manual claim needed anymore.

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
                {isUnlocked && (achievement.coinReward || achievement.xpReward) && (
                  achievement.claimed ? (
                    <div className="flex items-center justify-center gap-1 mt-1 text-[11px] text-success font-medium">
                      <CheckCircle className="w-3 h-3" />
                      +{achievement.coinReward ?? achievement.xpReward} 🪙 olindi
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleClaim(achievement); }}
                      className="btn btn-xs btn-warning gap-1 mt-1.5 animate-[fadeIn_0.4s_ease-out] btn-wave"
                    >
                      <Zap className="w-3 h-3" />
                      +{achievement.coinReward ?? achievement.xpReward} 🪙 olib olish
                    </button>
                  )
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

        {/* Show new achievements — rewards auto-collected as coins */}
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
                <div className="badge badge-success badge-sm gap-1">
                  <Zap className="w-3 h-3" />
                  +{achievement.coinReward ?? achievement.xpReward} 🪙
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
