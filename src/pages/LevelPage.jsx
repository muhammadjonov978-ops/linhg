import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { languages, getLessons, alphabets } from '../data/languages';
import {
  ArrowLeft, CheckCircle, Trophy, Star, Sparkles,
  ChevronLeft, ChevronRight, Volume2, RefreshCw,
  BookOpen, GraduationCap, Zap
} from 'lucide-react';

export default function LevelPage({ onBack }) {
  const { state, dispatch, getLessonProgress } = useApp();

  const currentLang = languages.find(l => l.id === state.selectedLanguage);
  const lessonNumber = parseInt(state.currentLevel?.replace('lesson-', '') || '1');
  const allLessons = getLessons(state.selectedLanguage);
  const lesson = allLessons.find(l => l.number === lessonNumber);

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  if (!currentLang || !lesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="opacity-60">Dars topilmadi</p>
        <button onClick={onBack} className="btn btn-primary btn-sm mt-4">
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </button>
      </div>
    );
  }

  const progress = getLessonProgress(state.selectedLanguage, lessonNumber);
  const isCompleted = progress.completed;
  const isAlphabet = lesson.type === 'alphabet';

  const handleAnswer = (answerIndex) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);

    const correct = answerIndex === lesson.exercise.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      const earnedXp = isAlphabet ? 15 : 25;
      setXpEarned(earnedXp);
      setScore(100);
    } else {
      setScore(50);
      setXpEarned(5);
    }
  };

  const handleComplete = () => {
    dispatch({
      type: 'COMPLETE_LESSON',
      payload: {
        langId: state.selectedLanguage,
        lessonNumber: lessonNumber,
        score: score,
      },
    });

    // Navigate to next lesson
    const nextLesson = allLessons.find(l => l.number === lessonNumber + 1);
    if (nextLesson) {
      dispatch({ type: 'SET_CURRENT_LEVEL', payload: `lesson-${lessonNumber + 1}` });
    } else {
      onBack();
    }
  };

  const handleNextLesson = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setXpEarned(0);

    const nextLesson = allLessons.find(l => l.number === lessonNumber + 1);
    if (nextLesson) {
      dispatch({ type: 'SET_CURRENT_LEVEL', payload: `lesson-${lessonNumber + 1}` });
    }
  };

  const handlePrevLesson = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setXpEarned(0);

    const prevLesson = allLessons.find(l => l.number === lessonNumber - 1);
    if (prevLesson) {
      dispatch({ type: 'SET_CURRENT_LEVEL', payload: `lesson-${lessonNumber - 1}` });
    }
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-base-200 via-base-100 to-base-200 border-b border-base-300 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="btn btn-ghost btn-sm gap-2">
              <ArrowLeft className="w-4 h-4" /> {currentLang.flag} {currentLang.name}
            </button>
            <div className="flex items-center gap-2">
              {lessonNumber > 1 && (
                <button onClick={handlePrevLesson} className="btn btn-ghost btn-xs btn-circle">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <span className="text-sm font-medium opacity-60">
                {lessonNumber} / {allLessons.length}
              </span>
              {lessonNumber < allLessons.length && (
                <button onClick={handleNextLesson} className="btn btn-ghost btn-xs btn-circle">
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Progress bar for lessons */}
          <div className="w-full h-1.5 bg-base-300 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
              style={{ width: `${((lessonNumber - 1) / allLessons.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lesson content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Lesson header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">{lesson.icon}</div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className={`badge badge-sm ${
              lesson.type === 'alphabet' ? 'badge-info' :
              lesson.type === 'vocabulary' ? 'badge-success' :
              lesson.type === 'reading' ? 'badge-secondary' :
              lesson.type === 'listening' ? 'badge-warning' :
              lesson.type === 'speaking' ? 'badge-error' :
              lesson.type === 'writing' ? 'badge-accent' :
              'badge-neutral'
            }`}>
              {lesson.category}
            </span>
            <span className="badge badge-ghost badge-sm">Dars {lesson.number}</span>
            {isCompleted && (
              <span className="badge badge-success badge-sm gap-1">
                <CheckCircle className="w-3 h-3" /> Bajarilgan
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
          <p className="text-sm opacity-60">{lesson.description}</p>
        </div>

        {/* Alphabet lesson content */}
        {isAlphabet && lesson.content.letters && lesson.content.letters.length > 0 && (
          <div className="card bg-base-100 border border-base-300 mb-6 overflow-hidden">
            <div className="card-body p-4">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
                <GraduationCap className="w-4 h-4 text-info" />
                Harflarni o'rganing
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {lesson.content.letters.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-base-200 rounded-xl p-4 text-center hover:bg-info/10 transition-all duration-200 group cursor-default"
                  >
                    <div className="text-3xl font-bold mb-1 group-hover:scale-110 transition-transform">
                      {item.letter}
                    </div>
                    <div className="text-xs opacity-50 font-mono mb-2">{item.pronunciation}</div>
                    <div className="border-t border-base-300 pt-2 mt-1">
                      <div className="text-sm font-medium">{item.example}</div>
                      <div className="text-[10px] opacity-40">{item.exampleUz}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Non-alphabet lesson content */}
        {!isAlphabet && (
          <div className="card bg-base-100 border border-base-300 mb-6">
            <div className="card-body p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  lesson.type === 'vocabulary' ? 'bg-success/10' :
                  lesson.type === 'reading' ? 'bg-secondary/10' :
                  lesson.type === 'listening' ? 'bg-warning/10' :
                  lesson.type === 'speaking' ? 'bg-error/10' :
                  lesson.type === 'writing' ? 'bg-accent/10' : 'bg-neutral/10'
                }`}>
                  <span className="text-xl">{lesson.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{lesson.category}</h3>
                  <p className="text-xs opacity-50">Mashqni bajaring va bilimingizni sinang</p>
                </div>
              </div>

              {/* Simple content display */}
              <div className="bg-base-200 rounded-xl p-4 mb-4">
                <p className="text-sm opacity-70 text-center">
                  Savolga to'g'ri javob bering!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Exercise */}
        <div className="card bg-base-100 border border-base-300 mb-6">
          <div className="card-body p-6">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Savol
            </h3>

            <p className="text-lg font-medium mb-6 text-center">
              {lesson.exercise.question}
            </p>

            {/* Options */}
            <div className="space-y-2">
              {lesson.exercise.options.map((option, idx) => {
                let btnClass = 'btn-ghost border-base-300 hover:border-primary/50';
                if (showResult) {
                  if (idx === lesson.exercise.correctAnswer) {
                    btnClass = 'btn-success text-white border-success';
                  } else if (idx === selectedAnswer && !isCorrect) {
                    btnClass = 'btn-error text-white border-error';
                  } else {
                    btnClass = 'btn-ghost opacity-40';
                  }
                } else if (selectedAnswer === idx) {
                  btnClass = 'btn-primary text-white border-primary';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={showResult}
                    className={`btn btn-block btn-lg justify-start ${btnClass} transition-all duration-200`}
                  >
                    <span className="w-8 h-8 rounded-lg bg-base-300/30 flex items-center justify-center text-sm font-bold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 text-left">{option}</span>
                    {showResult && idx === lesson.exercise.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Result */}
            {showResult && (
              <div className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-success/10 border border-success/20' : 'bg-error/10 border border-error/20'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="font-bold text-success">To'g'ri!</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5 text-error" />
                      <span className="font-bold text-error">Noto'g'ri</span>
                    </>
                  )}
                  <span className="text-sm opacity-50 ml-auto">
                    +{xpEarned} XP
                  </span>
                </div>
                {!isCorrect && (
                  <p className="text-sm opacity-70">
                    To'g'ri javob: <strong>{lesson.exercise.options[lesson.exercise.correctAnswer]}</strong>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Completion and navigation */}
        <div className="flex items-center justify-between">
          {!showResult ? (
            <div className="text-xs opacity-50">
              Javobni tanlang va bilimingizni sinang
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning" />
              <span className="font-bold">{score}/100 ball</span>
            </div>
          )}

          <div className="flex gap-2">
            {showResult && !isCompleted && (
              <button onClick={handleComplete} className="btn btn-primary btn-sm gap-2">
                <Zap className="w-4 h-4" />
                {xpEarned} XP olish
              </button>
            )}
            {isCompleted && lessonNumber < allLessons.length && (
              <button onClick={handleNextLesson} className="btn btn-primary btn-sm gap-2">
                Keyingi dars
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {isCompleted && lessonNumber >= allLessons.length && (
              <button onClick={onBack} className="btn btn-primary btn-sm gap-2">
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Lesson navigation dots */}
        <div className="mt-8 flex justify-center gap-1">
          {allLessons.slice(Math.max(0, lessonNumber - 5), Math.min(allLessons.length, lessonNumber + 4)).map(l => {
            const key = `${state.selectedLanguage}-lesson-${l.number}`;
            const p = state.progress[key];
            return (
              <button
                key={l.number}
                onClick={() => {
                  dispatch({ type: 'SET_CURRENT_LEVEL', payload: `lesson-${l.number}` });
                  setSelectedAnswer(null);
                  setShowResult(false);
                  setScore(0);
                  setXpEarned(0);
                }}
                className={`w-6 h-6 rounded-full text-[10px] font-bold transition-all ${
                  l.number === lessonNumber
                    ? 'bg-primary text-white scale-110'
                    : p?.completed
                      ? 'bg-success text-white'
                      : 'bg-base-300 text-base-content/40'
                }`}
              >
                {l.number}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
