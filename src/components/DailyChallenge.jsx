import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Target, CheckCircle, Clock, Zap, Gift, Sparkles, RotateCcw } from 'lucide-react';

export default function DailyChallenge() {
  const { state, dispatch } = useApp();

  const generateDailyChallenges = () => {
    const today = new Date().toDateString();
    // Use date-based seed for consistent daily challenges
    const seed = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

    const challenges = [
      {
        id: `${today}-1`,
        title: 'Mashqlar',
        description: '3 ta darsni tugating',
        icon: '📝',
        coinReward: 30,
        check: () => {
          const progressValues = Object.values(state.progress);
          return progressValues.filter(p => p.completed).length >= 3;
        },
      },
      {
        id: `${today}-2`,
        title: 'Dars',
        description: '1 ta darsni bajaring',
        icon: '🎤',
        coinReward: 40,
        check: () => {
          const progressValues = Object.values(state.progress);
          return progressValues.some(p => p.completed);
        },
      },
      {
        id: `${today}-3`,
        title: '80%+ Natija',
        description: 'Har qanday darsdan 80%+ oling',
        icon: '🎯',
        coinReward: 50,
        check: () => {
          const progressValues = Object.values(state.progress);
          return progressValues.some(p => p.score >= 80);
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
        description: 'Bugun kamida 1 ta dars bajaring',
        icon: '🔥',
        coinReward: 25,
        check: () => {
          const progressValues = Object.values(state.progress);
          const now = Date.now();
          return progressValues.some(p =>
            p.timestamp && (now - p.timestamp < 86400000)
          );
        },
      },
    ];

    // Pick 3 challenges based on date seed
    const picked = [];
    const used = new Set();
    while (picked.length < 3) {
      const idx = (seed + picked.length * 7) % challenges.length;
      if (!used.has(idx)) {
        used.add(idx);
        picked.push(challenges[idx]);
      }
    }
    return picked;
  };

  // IMPORTANT: always regenerate challenges fresh so that `check` functions exist.
  // Saved challenges from localStorage lose their functions (JSON cannot store functions),
  // which caused the "t.check is not a function" crash.
  const [dailyChallenges, setDailyChallenges] = useState(() => {
    const saved = state.dailyChallenges;
    const today = new Date().toDateString();
    const fresh = generateDailyChallenges();
    if (saved && saved.date === today && Array.isArray(saved.challenges)) {
      const savedById = new Map(saved.challenges.map(c => [c.id, c]));
      return fresh.map(c => {
        const s = savedById.get(c.id);
        return s ? { ...c, completed: !!s.completed, claimed: !!s.claimed } : c;
      });
    }
    return fresh;
  });

  const [completedChallenges, setCompletedChallenges] = useState(() => {
    const saved = state.dailyChallenges;
    const today = new Date().toDateString();
    if (saved && saved.date === today && Array.isArray(saved.challenges)) {
      return new Set(saved.challenges.filter(c => c.completed).map(c => c.id));
    }
    return new Set();
  });

  // Tangalar avtomatik emas — foydalanuvchi "Olib olish" tugmasini bosganda beriladi
  const [claimedIds, setClaimedIds] = useState(() => {
    const saved = state.dailyChallenges;
    const today = new Date().toDateString();
    if (saved && saved.date === today && Array.isArray(saved.challenges)) {
      return new Set(saved.challenges.filter(c => c.completed && c.claimed).map(c => c.id));
    }
    return new Set();
  });

  // Check and auto-complete challenges (rewards auto-collected as coins)
  useEffect(() => {
    // IMPORTANT: regenerate fresh `check` functions from CURRENT state each time.
    // Stored challenges may carry stale closures (or no function after JSON round-trip),
    // which would make auto-completion never fire.
    const freshChallenges = generateDailyChallenges();
    const freshById = new Map(freshChallenges.map(f => [f.id, f]));

    let changed = false;
    const updated = dailyChallenges.map(c => {
      const check = freshById.get(c.id)?.check || c.check;
      if (!completedChallenges.has(c.id) && check && check()) {
        changed = true;
        return { ...c, completed: true, claimed: false };
      }
      return c;
    });

    if (changed) {
      const newCompleted = new Set(completedChallenges);
      updated.forEach(c => { if (c.completed) newCompleted.add(c.id); });
      setCompletedChallenges(newCompleted);
      setDailyChallenges(updated);

      // Tanga avtomatik berilmaydi — "Olib olish" tugmasi bosilganda beriladi

      // Save to context (strip check functions - only serializable data)
      dispatch({
        type: 'UPDATE_DAILY_CHALLENGES',
        payload: {
          date: new Date().toDateString(),
          challenges: updated.map(({ check, ...rest }) => rest),
        },
      });
    }
  }, [state.progress, state.tutorMessages]);

  const handleClaim = (challenge) => {
    if (!challenge.completed || claimedIds.has(challenge.id)) return;
    dispatch({ type: 'ADD_COINS', payload: challenge.coinReward || 0 });
    setClaimedIds(prev => new Set(prev).add(challenge.id));
    const next = dailyChallenges.map(c => c.id === challenge.id ? { ...c, claimed: true } : c);
    setDailyChallenges(next);
    dispatch({
      type: 'UPDATE_DAILY_CHALLENGES',
      payload: {
        date: new Date().toDateString(),
        challenges: next.map(({ check, ...rest }) => rest),
      },
    });
  };

  const handleRefresh = () => {
    const newChallenges = generateDailyChallenges();
    setDailyChallenges(newChallenges);
    setCompletedChallenges(new Set());
    setClaimedIds(new Set());
    dispatch({
      type: 'UPDATE_DAILY_CHALLENGES',
      payload: {
        date: new Date().toDateString(),
        // strip check functions — only serializable data is stored
        challenges: newChallenges.map(({ check, ...rest }) => ({ ...rest, completed: false })),
      },
    });
  };

  const completedCount = completedChallenges.size;
  const totalCount = dailyChallenges.length;

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="card-body p-5">
        {/* Header */}
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

        {/* Progress bar */}
        <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-warning to-success rounded-full transition-all duration-700"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>

        {/* Challenge list */}
        <div className="space-y-2">
          {dailyChallenges.map((challenge, i) => {
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
                {isCompleted && claimedIds.has(challenge.id) ? (
                  <div className="flex items-center gap-1 text-xs font-bold text-success">
                    <CheckCircle className="w-3 h-3" />
                    +{challenge.coinReward} 🪙
                  </div>
                ) : isCompleted ? (
                  <button
                    onClick={() => handleClaim(challenge)}
                    className="btn btn-xs btn-warning gap-1 animate-[fadeIn_0.4s_ease-out]"
                  >
                    <Zap className="w-3 h-3" />
                    +{challenge.coinReward} 🪙
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-xs font-bold text-warning">
                    <Zap className="w-3 h-3" />
                    +{challenge.coinReward} 🪙
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Completion reward animation */}
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


      </div>
    </div>
  );
}
