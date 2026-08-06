'use client';

import { useState } from 'react';
import { Pencil, CheckCircle, XCircle, ArrowRight, RotateCcw, Lightbulb } from 'lucide-react';
import type { WritingPromptExercise, WritingErrorExercise, WritingError } from '../data/languages';

type WritingExercise = WritingPromptExercise | WritingErrorExercise;

interface WritingSectionProps {
  exercises: WritingExercise[];
  langId: string;
  levelId: string;
  onComplete: (score: number) => void;
}

export default function WritingSection({ exercises, langId: _langId, levelId: _levelId, onComplete }: WritingSectionProps) {
  const [currentEx, setCurrentEx] = useState(0);
  const [userText, setUserText] = useState('');
  const [foundErrors, setFoundErrors] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [completedExs, setCompletedExs] = useState(new Set<number>());

  const exercise = exercises[currentEx];
  if (!exercise) return null;

  const isErrorExercise = 'text' in exercise && 'errors' in exercise;
  const isPromptExercise = 'prompt' in exercise;

  const handleSubmitPrompt = () => {
    const requirements = (exercise as WritingPromptExercise).requirements;
    const wordCount = userText.split(/\s+/).filter(w => w.length > 0).length;
    const meetsMin = wordCount >= requirements.minWords;
    const meetsMax = wordCount <= requirements.maxWords;
    const percentage = meetsMin && meetsMax ? 90 : Math.round((wordCount / requirements.minWords) * 50);

    setScore(Math.min(percentage, 100));
    setShowResults(true);

    const newCompleted = new Set(completedExs);
    newCompleted.add(currentEx);
    setCompletedExs(newCompleted);

    if (newCompleted.size >= exercises.length) {
      onComplete(Math.min(percentage, 100));
    }
  };

  const handleErrorClick = (errorIndex: number) => {
    if (showResults) return;
    setFoundErrors(prev => {
      if (prev.includes(errorIndex)) {
        return prev.filter(i => i !== errorIndex);
      }
      return [...prev, errorIndex];
    });
  };

  const handleSubmitErrors = () => {
    const errorExercise = exercise as WritingErrorExercise;
    const totalErrors = errorExercise.errors?.length || 1;
    const correct = foundErrors.filter(i => i < totalErrors).length;
    const percentage = Math.round((correct / totalErrors) * 100);
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
      setUserText('');
      setFoundErrors([]);
      setShowResults(false);
    }
  };

  const handleReset = () => {
    setUserText('');
    setFoundErrors([]);
    setShowResults(false);
  };

  const progress = completedExs.size;
  const total = exercises.length;

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pencil className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">{exercise.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-70">{progress}/{total}</span>
          <div className="w-20 h-2 bg-base-200 rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${(progress / total) * 100}%` }} />
          </div>
        </div>
      </div>

      {isErrorExercise && (
        <>
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <h4 className="font-medium text-sm opacity-70 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-warning" />
                Xatolarni toping
              </h4>
              <p className="text-sm leading-relaxed p-4 bg-base-200 rounded-xl">
                {exercise.text.split(' ').map((word: string, i: number) => {
                  const errorIdx = (exercise as WritingErrorExercise).errors?.findIndex(e => e.word === word.replace(/[.,!?;:]/g, ''));
                  const isError = errorIdx !== -1;
                  const isFound = foundErrors.includes(errorIdx);
                  return (
                    <span key={i}>
                      {' '}
                      <button
                        onClick={() => isError && handleErrorClick(errorIdx)}
                        disabled={showResults}
                        className={`inline-block px-1 rounded transition-colors ${
                          isError && !showResults
                            ? 'bg-error/10 hover:bg-error/20 cursor-pointer'
                            : isError && showResults && isFound
                            ? 'bg-success/20 text-success'
                            : isError && showResults && !isFound
                            ? 'bg-error/10 text-error'
                            : ''
                        }`}
                        title={isError ? `Xato: ${(exercise as WritingErrorExercise).errors?.[errorIdx]?.explanation}` : ''}
                      >
                        {word}
                      </button>
                    </span>
                  );
                })}
              </p>
              {!showResults && (
                <p className="text-xs opacity-50 mt-2">
                  Xato deb o'ylagan so'zlaringizni bosing. {(exercise as WritingErrorExercise).errors?.length || 0} ta xato bor.
                </p>
              )}
            </div>
          </div>

          {showResults && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Tuzatishlar:</h4>
              {(exercise as WritingErrorExercise).errors?.map((err: WritingError, i: number) => {
                const isFound = foundErrors.includes(i);
                return (
                  <div key={i} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${isFound ? 'bg-success/10' : 'bg-error/10'}`}>
                    {isFound ? <CheckCircle className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-error" />}
                    <span><strong>{err.word}</strong> → <strong className="text-success">{err.correction}</strong></span>
                    <span className="text-xs opacity-60">({err.explanation})</span>
                  </div>
                );
              })}
            </div>
          )}

          {!showResults && (
            <button onClick={handleSubmitErrors} className="btn btn-accent flex-1">
              <CheckCircle className="w-4 h-4" />
              Tekshirish ({foundErrors.length} ta topildi)
            </button>
          )}
        </>
      )}

      {isPromptExercise && (
        <>
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <h4 className="font-medium text-sm opacity-70 mb-2">Mavzu:</h4>
              <div className="p-4 bg-base-200 rounded-xl text-sm">
                {(exercise as WritingPromptExercise).prompt}
              </div>
              <div className="mt-3 flex gap-2 text-xs opacity-50">
                <span>{(exercise as WritingPromptExercise).requirements.minWords} - {(exercise as WritingPromptExercise).requirements.maxWords} so'z</span>
                {(exercise as WritingPromptExercise).requirements.grammarCheck && <span>• Grammatika tekshiruvi mavjud</span>}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <label className="text-sm font-medium opacity-70 mb-2">Javobingiz:</label>
              <textarea
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder="Inshoingizni yozing..."
                className="textarea textarea-bordered min-h-[200px] text-sm leading-relaxed"
                disabled={showResults}
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs opacity-50">
                  So'zlar: {userText.split(/\s+/).filter(w => w.length > 0).length}
                </span>
                {!showResults && (
                  <button onClick={handleSubmitPrompt} disabled={userText.trim().length < 10} className="btn btn-accent btn-sm">
                    <CheckCircle className="w-4 h-4" />
                    Yuborish
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {showResults && (
        <>
          <div className={`card ${score >= 80 ? 'bg-success/10 border-success' : 'bg-warning/10 border-warning'} border shadow-sm`}>
            <div className="card-body p-4 text-center">
              <div className="text-3xl font-bold mb-1">{score}%</div>
              <p className="text-sm opacity-70">
                {score >= 80 ? '🎉 Ajoyib! Siz bu mashqni muvaffaqiyatli bajardingiz!' : '💪 Davom eting! Yana bir bor urinib ko\'ring.'}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {currentEx < exercises.length - 1 && (
              <button onClick={handleNext} className="btn btn-accent flex-1">
                <ArrowRight className="w-4 h-4" />
                Keyingi mashq
              </button>
            )}
            <button onClick={handleReset} className="btn btn-ghost">
              <RotateCcw className="w-4 h-4" />
              Qayta urinish
            </button>
          </div>
        </>
      )}
    </div>
  );
}
