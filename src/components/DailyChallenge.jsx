import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Target, CheckCircle, Clock, Zap, Gift, Sparkles, RotateCcw } from 'lucide-react';

export default function DailyChallenge() {
  const { state, dispatch } = useApp();
  const [showReward, setShowReward] = useState(null);

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
        xpReward: 30,
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
        xpReward: 40,
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
        xpReward: 50,
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
        xpReward: 35,
        check: () => state.tutorMessages.length >= 2,
      },
      {
        id: `${today}-5`,
        title: 'Streak',
        description: 'Bugun kamida 1 ta dars bajaring',
        icon: '🔥',
        xpReward: 25,
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

  const [dailyChallenges, setDailyChallenges] = useState(() => {
    const saved = state.dailyChallenges;
    const today = new Date().toDateString();
    if (saved && saved.date === today) {
      return saved.challenges;
    }
    return generateDailyChallenges();
  });

  const [completedChallenges, setCompletedChallenges] = useState(() => {
    const saved = state.dailyChallenges;
    const today = new Date().toDateString();
    if (saved && saved.date === today) {
      return new Set(saved.challenges.filter(c => c.completed).map(c => c.id));
    }
    return new Set();
  });

  // Check and auto-complete challenges
  useEffect(() => {
    let changed = false;
    const updated = dailyChallenges.map(c => {
      if (!completedChallenges.has(c.id) && c.check()) {
        changed = true;
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

      // Save to context
      dispatch({
        type: 'UPDATE_DAILY_CHALLENGES',
        payload: {
          date: new Date().toDateString(),
          challenges: updated,
        },
      });
    }
  }, [state.progress, state.tutorMessages]);

  const handleRefresh = () => {
    const newChallenges = generateDailyChallenges();
    setDailyChallenges(newChallenges);
    setCompletedChallenges(new Set());
    dispatch({
      type: 'UPDATE_DAILY_CHALLENGES',
      payload: {
        date: new Date().toDateString(),
        challenges: newChallenges.map(c => ({ ...c, completed: false })),
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
                <div className="flex items-center gap-1 text-xs font-bold text-warning">
                  <Zap className="w-3 h-3" />
                  +{challenge.xpReward}
                </div>
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

        {/* Reward notification */}
        {showReward && (
          <div className="fixed top-20 right-4 z-50 animate-[fadeIn_0.3s_ease-out]">
            <div className="bg-success text-success-content px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
              <Gift className="w-5 h-5" />
              <div>
                <p className="font-bold text-sm">Topshiriq bajarildi!</p>
                <p className="text-xs opacity-80">+{showReward.xpReward} XP</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
