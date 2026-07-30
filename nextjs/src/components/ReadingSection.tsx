'use client';

import { useState } from 'react';
import { BookOpen, CheckCircle, XCircle, ArrowRight, RotateCcw, Volume2 } from 'lucide-react';
import type { ReadingExercise } from '../data/languages';

interface ReadingSectionProps {
  exercises: ReadingExercise[];
  langId: string;
  levelId: string;
  onComplete: (score: number) => void;
}

export default function ReadingSection({ exercises, langId, levelId, onComplete }: ReadingSectionProps) {
  const [currentEx, setCurrentEx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [completedExs, setCompletedExs] = useState(new Set<number>());

  const exercise = exercises[currentEx];
  if (!exercise) return null;

  const handleAnswer = (qId: string, optionIndex: number) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qId]: optionIndex }));
  };

  const handleSubmit = () => {
    const questions = exercise.questions || [];
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct) correct++;
    });
    const percentage = Math.round((correct / questions.length) * 100);
    setScore(percentage);
    setShowResults(true);

    const newCompleted = new Set(completedExs);
    newCompleted.add(currentEx);
    setCompletedExs(newCompleted);

    if (newCompleted.size >= exercises.length) {
      onComplete(percentage);
    }
  };

  const handleNext = () => {
    if (currentEx < exercises.length - 1) {
      setCurrentEx(prev => prev + 1);
      setAnswers({});
      setShowResults(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setShowResults(false);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langId === 'russian' ? 'ru-RU' : `${langId}-US`;
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const progress = completedExs.size;
  const total = exercises.length;

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">{exercise.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-70">{progress}/{total}</span>
          <div className="w-20 h-2 bg-base-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(progress / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm opacity-70">📖 Matn</h4>
            <button
              onClick={() => speakText(exercise.passage)}
              className="btn btn-ghost btn-xs btn-circle"
              title="Tinglash"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 bg-base-200 rounded-xl text-sm leading-relaxed">
            {exercise.passage}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <span>❓</span> Savollar
        </h4>
        {exercise.questions?.map((q, qi) => (
          <div key={q.id} className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-4">
              <p className="font-medium text-sm mb-3">
                {qi + 1}. {q.question}
              </p>
              <div className="grid gap-2">
                {q.options.map((opt, oi) => {
                  const isSelected = answers[q.id] === oi;
                  const isCorrect = showResults && q.correct === oi;
                  const isWrong = showResults && isSelected && q.correct !== oi;

                  return (
                    <button
                      key={oi}
                      onClick={() => handleAnswer(q.id, oi)}
                      disabled={showResults}
                      className={`
                        flex items-center gap-3 p-3 rounded-xl text-sm text-left transition-all duration-200
                        ${isSelected && !showResults ? 'bg-primary/10 border-primary border' : 'bg-base-200 hover:bg-base-300 border border-transparent'}
                        ${isCorrect ? 'bg-success/20 border-success border text-success' : ''}
                        ${isWrong ? 'bg-error/20 border-error border text-error' : ''}
                      `}
                    >
                      <span className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${isSelected && !showResults ? 'bg-primary text-primary-content' : 'bg-base-300'}
                        ${isCorrect ? 'bg-success text-success-content' : ''}
                        ${isWrong ? 'bg-error text-error-content' : ''}
                      `}>
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span>{opt}</span>
                      {isCorrect && <CheckCircle className="w-4 h-4 ml-auto" />}
                      {isWrong && <XCircle className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        {!showResults ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < (exercise.questions?.length || 0)}
            className="btn btn-primary flex-1"
          >
            <CheckCircle className="w-4 h-4" />
            Tekshirish
          </button>
        ) : (
          <>
            {currentEx < exercises.length - 1 ? (
              <button onClick={handleNext} className="btn btn-primary flex-1">
                <ArrowRight className="w-4 h-4" />
                Keyingi mashq
              </button>
            ) : null}
            <button onClick={handleReset} className="btn btn-ghost">
              <RotateCcw className="w-4 h-4" />
              Qayta urinish
            </button>
          </>
        )}
      </div>

      {showResults && (
        <div className={`card ${score >= 80 ? 'bg-success/10 border-success' : 'bg-warning/10 border-warning'} border shadow-sm`}>
          <div className="card-body p-4 text-center">
            <div className="text-3xl font-bold mb-1">{score}%</div>
            <p className="text-sm opacity-70">
              {score >= 80 ? '🎉 Ajoyib! Siz bu mashqni muvaffaqiyatli bajardingiz!' : '💪 Davom eting! Yana bir bor urinib ko\'ring.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
