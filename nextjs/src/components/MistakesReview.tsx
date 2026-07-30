'use client';

import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  RotateCcw, CheckCircle, XCircle, ChevronLeft, ChevronRight,
  RefreshCw, Lightbulb
} from 'lucide-react';

const MISTAKE_LANGUAGES = [
  { id: 'english', name: 'English', flag: '🇬🇧' },
  { id: 'spanish', name: 'Spanish', flag: '🇪🇸' },
  { id: 'french', name: 'French', flag: '🇫🇷' },
  { id: 'german', name: 'German', flag: '🇩🇪' },
  { id: 'italian', name: 'Italian', flag: '🇮🇹' },
  { id: 'portuguese', name: 'Portuguese', flag: '🇧🇷' },
  { id: 'russian', name: 'Russian', flag: '🇷🇺' },
];

const MISTAKE_LEVELS = [
  { id: 'beginner', name: 'Beginner', icon: '🌱' },
  { id: 'elementary', name: 'Elementary', icon: '🌿' },
  { id: 'pre-intermediate', name: 'Pre-Intermediate', icon: '🌳' },
  { id: 'advanced', name: 'Advanced', icon: '👑' },
];

interface Mistake {
  id: string;
  langId: string;
  levelId: string;
  skill: string;
  score: number;
  timestamp: number;
  lang?: { id: string; name: string; flag: string };
  level?: { id: string; name: string; icon: string };
}

export default function MistakesReview() {
  const { state, dispatch } = useApp();
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => {
    const collected: Mistake[] = [];
    Object.entries(state.progress).forEach(([key, prog]) => {
      const [langId, levelId] = key.split('-');
      Object.entries(prog.exercises).forEach(([exKey, ex]) => {
        if (ex.score < 80) {
          const skill = exKey.replace('skill-', '');
          collected.push({
            id: `${key}-${exKey}`,
            langId,
            levelId,
            skill,
            score: ex.score,
            timestamp: ex.timestamp,
            lang: MISTAKE_LANGUAGES.find(l => l.id === langId),
            level: MISTAKE_LEVELS.find(l => l.id === levelId),
          });
        }
      });
    });
    setMistakes(collected.reverse());
  }, [state.progress]);

  const currentMistake = mistakes[currentIndex];
  const hasMistakes = mistakes.length > 0;

  const handleMarkReviewed = () => {
    dispatch({ type: 'MARK_MISTAKE_REVIEWED' });
    setReviewedCount(prev => prev + 1);
    if (currentIndex < mistakes.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < mistakes.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowAnswer(false);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowAnswer(true);
  };

  if (!hasMistakes) {
    return (
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-5 text-center">
          <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-7 h-7 text-success" />
          </div>
          <h3 className="font-bold">Xatolar topilmadi! 🎉</h3>
          <p className="text-sm opacity-50 mt-1">
            Barcha mashqlarni muvaffaqiyatli bajargansiz!
          </p>
          <div className="mt-3 text-2xl">🌟</div>
        </div>
      </div>
    );
  }

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case 'reading': return '📖';
      case 'listening': return '🎧';
      case 'writing': return '✍️';
      case 'speaking': return '🎤';
      default: return '📝';
    }
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-error" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Xatolar ustida ishlash</h3>
              <p className="text-xs opacity-50">{mistakes.length} ta xato</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs opacity-50">
              {currentIndex + 1}/{mistakes.length}
            </span>
          </div>
        </div>

        <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-error to-success rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / mistakes.length) * 100}%` }}
          />
        </div>

        <div className="relative">
          <div
            className={`
              bg-gradient-to-br from-base-200 to-base-100 rounded-xl p-6 min-h-[200px]
              border-2 transition-all duration-500 cursor-pointer
              ${isFlipped ? 'border-success/50 shadow-lg' : 'border-base-300 hover:border-primary/30'}
            `}
            onClick={handleFlip}
          >
            {!isFlipped ? (
              <div className="text-center">
                <div className="text-4xl mb-3">
                  {getSkillIcon(currentMistake.skill)}
                </div>
                <p className="text-xs opacity-50 mb-2">
                  {currentMistake.lang?.flag} {currentMistake.lang?.name} &bull; {currentMistake.level?.icon} {currentMistake.level?.name}
                </p>
                <h4 className="font-bold text-lg capitalize mb-2">
                  {currentMistake.skill} Mashqi
                </h4>
                <div className="flex items-center justify-center gap-2">
                  <div className="badge badge-error gap-1">
                    <XCircle className="w-3 h-3" />
                    {currentMistake.score}%
                  </div>
                  <span className="text-xs opacity-40">
                    {new Date(currentMistake.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs opacity-50 mt-4">
                  👆 Ko'rish uchun bosing
                </p>
              </div>
            ) : (
              <div className="text-center animate-[fadeIn_0.3s_ease-out]">
                <div className="text-4xl mb-3">💡</div>
                <h4 className="font-bold text-sm mb-2">Taklif</h4>
                <div className="bg-base-100 rounded-xl p-4 text-sm leading-relaxed">
                  <p className="mb-2">
                    <Lightbulb className="w-4 h-4 text-warning inline-block mr-1" />
                    <strong>{currentMistake.skill === 'reading' ? "Matnni qayta o'qing va asosiy g'oyalarni toping" :
                      currentMistake.skill === 'listening' ? "Ko'proq tinglab, eshitganingizni takrorlang" :
                      currentMistake.skill === 'writing' ? 'Grammatika qoidalarini takrorlang va ko\'proq yozing' :
                      "So'zlarni bo'g'inlarga ajratib talaffuz qiling"}</strong>
                  </p>
                  <p className="text-xs opacity-60">
                    {currentMistake.score < 50
                      ? 'Asoslarni mustahkamlash uchun Beginner darajasidan qayta o\'ting.'
                      : 'Yana bir bor urinib ko\'ring! 80%+ olishga harakat qiling.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="btn btn-ghost btn-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleMarkReviewed}
            className="btn btn-success btn-sm flex-1 gap-1"
          >
            <CheckCircle className="w-4 h-4" />
            Ko'rib chiqdim
          </button>

          <button
            onClick={handleFlip}
            className="btn btn-ghost btn-sm"
            title="Qayta aylantirish"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === mistakes.length - 1}
            className="btn btn-ghost btn-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-center gap-4 text-xs opacity-50">
          <span>🔄 {reviewedCount} ta ko'rib chiqildi</span>
          <span>📊 {Math.round((currentIndex + 1) / mistakes.length * 100)}% bajarildi</span>
        </div>
      </div>
    </div>
  );
}
