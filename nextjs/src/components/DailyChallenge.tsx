'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import type { DailyChallengeItem } from '../context/AppContext';
import { Target, CheckCircle, RotateCcw, Zap, Gift, Sparkles } from 'lucide-react';

export default function DailyChallenge() {
  const { state, dispatch } = useApp();
  const [showReward, setShowReward] = useState<{ coinReward: number } | null>(null);

  // useCallback: check funksiyalari hozirgi progress/tutorMessages holatini
  // closure orqali o'qiydi — identity faqat shular o'zgarganda yangilanadi.
  const generateDailyChallenges = useCallback(() => {
    const today = new Date().toDateString();
    const seed = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

    const challenges = [
      {
        id: `${today}-1`,
        title: 'Mashqlar',
        description: '3 ta mashq bajaring',
        icon: '📝',
        coinReward: 30,
        check: () => {
          const progressValues = Object.values(state.progress);
          let total = 0;
          progressValues.forEach(p => { total += Object.keys(p.exercises).length; });
          return total >= 3;
        },
      },
      {
        id: `${today}-2`,
        title: 'Speaking',
        description: '1 ta speaking mashqini bajaring',
        icon: '🎤',
        coinReward: 40,
        check: () => {
          const progressValues = Object.values(state.progress);
          return progressValues.some(p =>
            Object.keys(p.exercises).some(k => k.startsWith('skill-speaking') && p.exercises[k].completed)
          );
        },
      },
      {
        id: `${today}-3`,
        title: '80%+ Natija',
        description: 'Har qanday mashqdan 80%+ oling',
        icon: '🎯',
        coinReward: 50,
        check: () => {
          const progressValues = Object.values(state.progress);
          return progressValues.some(p =>
            Object.values(p.exercises).some(e => e.score >= 80)
          );
        },
      },
      {
        id: `${today}-4`,
        title: 'AI Tutor',
        description: 'AI Tutor bilan suhbatlashing',
        icon: '🤖',
        coinReward: 35,
        check: () => state.tutorMessages.length >= 2,
      },
      {
        id: `${today}-5`,
        title: 'Streak',
        description: 'Bugun kamida 1 ta mashq bajaring',
        icon: '🔥',
        coinReward: 25,
        check: () => {
          const progressValues = Object.values(state.progress);
          return progressValues.some(p =>
            Object.values(p.exercises).some(e =>
              e.timestamp && Date.now() - e.timestamp < 86400000
            )
          );
        },
      },
    ];

    const picked: typeof challenges = [];
    const used = new Set<number>();
    while (picked.length < 3) {
      const idx = (seed + picked.length * 7) % challenges.length;
      if (!used.has(idx)) {
        used.add(idx);
        picked.push(challenges[idx]);
      }
    }
    return picked;
  }, [state.progress, state.tutorMessages]);

  const [dailyChallenges, setDailyChallenges] = useState<DailyChallengeItem[]>(() => {
    const saved = state.dailyChallenges;
    const today = new Date().toDateString();
    if (saved && saved.date === today && Array.isArray(saved.challenges)) {
      // Regenerate fresh challenges so `check` functions exist (they are lost in JSON)
      const fresh = generateDailyChallenges();
      const completedIds = new Set(saved.challenges.filter(c => c.completed).map(c => c.id));
      return fresh.map(c => ({ ...c, completed: completedIds.has(c.id) }));
    }
    return generateDailyChallenges().map(c => ({ ...c, completed: false }));
  });

  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(() => {
    const saved = state.dailyChallenges;
    const today = new Date().toDateString();
    if (saved && saved.date === today && Array.isArray(saved.challenges)) {
      return new Set(saved.challenges.filter(c => c.completed).map(c => c.id));
    }
    return new Set<string>();
  });

  useEffect(() => {
    // IMPORTANT: regenerate fresh `check` functions from CURRENT state each time.
    // Stored challenges may carry stale closures (or no function after JSON round-trip),
    // which would make auto-completion never fire.
    const freshChallenges = generateDailyChallenges();
    const freshById = new Map(freshChallenges.map(f => [f.id, f]));

    let changed = false;
    let totalReward = 0;
    const updated = dailyChallenges.map(c => {
      const check = freshById.get(c.id)?.check || c.check;
      if (!completedChallenges.has(c.id) && check && check()) {
        changed = true;
        totalReward += c.coinReward || 0;
        setShowReward(c);
        setTimeout(() => setShowReward(null), 3000);
        return { ...c, completed: true };
      }
      return c;
    });

    if (changed) {
      const newCompleted = new Set(completedChallenges);
      updated.forEach(c => { if (c.completed) newCompleted.add(c.id); });
      setCompletedChallenges(newCompleted);
      setDailyChallenges(updated);

      // Auto-collect coin reward
      if (totalReward > 0) {
        dispatch({ type: 'ADD_COINS', payload: totalReward });
      }

      dispatch({
        type: 'UPDATE_DAILY_CHALLENGES',
        payload: {
          date: new Date().toDateString(),
          challenges: updated.map(({ check: _check, ...rest }) => rest),
        },
      });
    }
  }, [state.progress, state.tutorMessages, dailyChallenges, completedChallenges, dispatch, generateDailyChallenges]);

  const handleRefresh = () => {
    const newChallenges = generateDailyChallenges();
    setDailyChallenges(newChallenges);
    setCompletedChallenges(new Set());
    dispatch({
      type: 'UPDATE_DAILY_CHALLENGES',
      payload: {
        date: new Date().toDateString(),
        // strip check functions — only serializable data is stored
        challenges: newChallenges.map(({ check: _check, ...rest }) => ({ ...rest, completed: false })),
      },
    });
  };

  const completedCount = completedChallenges.size;
  const totalCount = dailyChallenges.length;

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="card-body p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-warning" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Kunlik Topshiriqlar</h3>
              <p className="text-xs opacity-50">{completedCount}/{totalCount} bajarildi</p>
            </div>
          </div>
          <button onClick={handleRefresh} className="btn btn-ghost btn-xs btn-circle" title="Yangilash">
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-warning to-success rounded-full transition-all duration-700"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>

        <div className="space-y-2">
          {dailyChallenges.map((challenge) => {
            const isCompleted = completedChallenges.has(challenge.id);
            return (
              <div
                key={challenge.id}
                className={`flex items-center gap-3 p-3 rounded-xl text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-success/10 border border-success/20'
                    : 'bg-base-200 border border-transparent hover:border-primary/20'
                }`}
              >
                <span className="text-lg">{challenge.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${isCompleted ? 'text-success line-through' : ''}`}>
                      {challenge.title}
                    </span>
                    {isCompleted && <CheckCircle className="w-3 h-3 text-success" />}
                  </div>
                  <p className="text-xs opacity-50">{challenge.description}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-warning">
                  <Zap className="w-3 h-3" />
                  +{challenge.coinReward} 🪙
                </div>
              </div>
            );
          })}
        </div>

        {completedCount === totalCount && (
          <div className="mt-3 p-3 bg-gradient-to-r from-warning/10 to-success/10 rounded-xl text-center animate-[fadeIn_0.5s_ease-out] border border-warning/20">
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-success">
              <Gift className="w-4 h-4" />
              Barcha topshiriqlar bajarildi!
              <Sparkles className="w-4 h-4 text-warning" />
            </div>
            <p className="text-xs opacity-60 mt-1">Ertaga yangi topshiriqlar keladi!</p>
          </div>
        )}

        {showReward && (
          <div className="fixed top-20 right-4 z-50 animate-[fadeIn_0.3s_ease-out]">
            <div className="bg-success text-success-content px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
              <Gift className="w-5 h-5" />
              <div>
                <p className="font-bold text-sm">Topshiriq bajarildi!</p>
                <p className="text-xs opacity-80">+{showReward.coinReward} 🪙 tanga</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
