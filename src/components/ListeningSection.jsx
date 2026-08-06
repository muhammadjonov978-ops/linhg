import { useState, useCallback } from 'react';
import { getSpeechLang } from '../utils/speech';
import { Headphones, Volume2, CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

export default function ListeningSection({ exercises, langId, levelId: _levelId, onComplete }) {
  const [currentEx, setCurrentEx] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [results, setResults] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [completedExs, setCompletedExs] = useState(new Set());

  const exercise = exercises[currentEx];
  const isWordExercise = !!exercise?.words;
  const items = exercise ? (isWordExercise ? exercise.words : exercise.sentences) : [];
  const currentItem = items?.[currentWordIndex];

  // Hook'lar har doim chaqirilishi kerak — `if (!exercise) return null`
  // hammasidan keyin turadi (rules-of-hooks).
  const speakText = useCallback((text, callback) => {
    if ('speechSynthesis' in window) {
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getSpeechLang(langId);
      utterance.rate = isWordExercise ? 0.7 : 0.8;
      utterance.pitch = 1;
      utterance.onend = () => {
        setIsPlaying(false);
        callback?.();
      };
      utterance.onerror = () => {
        setIsPlaying(false);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Sizning brauzeringiz matnni ovozga aylantirishni qo\'llamaydi.');
    }
  }, [langId, isWordExercise]);

  const handlePlay = () => {
    speakText(currentItem);
  };

  const handlePlayAndCheck = () => {
    speakText(currentItem, () => {
      // After playing, focus on the input
      document.getElementById('listening-input')?.focus();
    });
  };

  const handleCheck = () => {
    const normalizedInput = userInput.trim().toLowerCase();
    const normalizedTarget = currentItem.toLowerCase();
    const isCorrect = normalizedInput === normalizedTarget;

    setResults(prev => ({
      ...prev,
      [currentWordIndex]: { input: userInput, correct: isCorrect, target: currentItem },
    }));

    if (currentWordIndex < items.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setUserInput('');
    } else {
      // Calculate score
      const allResults = { ...results, [currentWordIndex]: { input: userInput, correct: isCorrect, target: currentItem } };
      const correctCount = Object.values(allResults).filter(r => r.correct).length;
      const percentage = Math.round((correctCount / items.length) * 100);
      setScore(percentage);
      setShowResults(true);

      const newCompleted = new Set(completedExs);
      newCompleted.add(currentEx);
      setCompletedExs(newCompleted);

      if (newCompleted.size >= exercises.length) {
        onComplete(percentage);
      }
    }
  };

  const handleNextExercise = () => {
    if (currentEx < exercises.length - 1) {
      setCurrentEx(prev => prev + 1);
      setCurrentWordIndex(0);
      setUserInput('');
      setResults({});
      setShowResults(false);
    }
  };

  const handleReset = () => {
    setCurrentWordIndex(0);
    setUserInput('');
    setResults({});
    setShowResults(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && userInput.trim()) {
      handleCheck();
    }
  };

  if (!exercise) return null;

  const progress = completedExs.size;
  const total = exercises.length;

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-secondary" />
          <h3 className="font-semibold">{exercise.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-70">{progress}/{total}</span>
          <div className="w-20 h-2 bg-base-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all duration-500"
              style={{ width: `${(progress / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {!showResults ? (
        <>
          {/* Progress within exercise */}
          <div className="text-center text-sm opacity-60">
            {currentWordIndex + 1} / {items.length}
          </div>

          {/* Word/Sentence display */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body items-center text-center py-8">
              {/* Hidden item - just show hint */}
              <div className="mb-4">
                <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Volume2 className="w-8 h-8 text-secondary" />
                </div>
                <p className="text-sm opacity-60 mb-2">
                  {isWordExercise
                    ? `So'z №${currentWordIndex + 1}ni tinglang va yozing`
                    : `Gap №${currentWordIndex + 1}ni tinglang va yozing`}
                </p>
              </div>

              {/* Play buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handlePlayAndCheck}
                  disabled={isPlaying}
                  className="btn btn-secondary btn-lg btn-circle"
                >
                  <Volume2 className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
                </button>
                <button
                  onClick={handlePlay}
                  disabled={isPlaying}
                  className="btn btn-ghost btn-lg btn-circle"
                  title="Qayta tinglash"
                >
                  <Headphones className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
                </button>
              </div>

              {/* Input */}
              <div className="w-full max-w-md">
                <div className="flex gap-2">
                  <input
                    id="listening-input"
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Eshitganingizni yozing..."
                    className="input input-bordered flex-1 text-center text-lg"
                    autoFocus
                  />
                  <button
                    onClick={handleCheck}
                    disabled={!userInput.trim() || isPlaying}
                    className="btn btn-secondary"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Tekshirish
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Previous results */}
          {Object.keys(results).length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium opacity-70">Natijalar:</p>
              {Object.entries(results).map(([idx, res]) => (
                <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${res.correct ? 'bg-success/10' : 'bg-error/10'}`}>
                  {res.correct ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-error" />
                  )}
                  <span className={res.correct ? 'text-success' : 'text-error'}>
                    Siz: "{res.input}"
                  </span>
                  {!res.correct && (
                    <span className="text-xs opacity-60">| To'g'ri: "{res.target}"</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Final results */
        <div className="space-y-4">
          <div className={`card ${score >= 80 ? 'bg-success/10 border-success' : 'bg-warning/10 border-warning'} border shadow-sm`}>
            <div className="card-body text-center py-8">
              <div className="text-5xl font-bold mb-2">{score}%</div>
              <p className="text-sm opacity-70">
                {score >= 80 ? '🎉 Tabriklaymiz! Eshitish qobiliyatingiz ajoyib!' : '💪 Yana mashq qiling! Yaxshi bo\'ladi.'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => {
              const res = Object.values(results).find((r, i) => i === idx) || results[idx];
              return (
                <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${res?.correct ? 'bg-success/10' : 'bg-error/10'}`}>
                  {res?.correct ? <CheckCircle className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-error" />}
                  <span className={res?.correct ? '' : 'text-error'}>
                    "{res?.input || '—'}"
                  </span>
                  {!res?.correct && (
                    <span className="text-xs opacity-60">→ "{item}"</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            {currentEx < exercises.length - 1 && (
              <button onClick={handleNextExercise} className="btn btn-secondary flex-1">
                <ArrowRight className="w-4 h-4" />
                Keyingi mashq
              </button>
            )}
            <button onClick={handleReset} className="btn btn-ghost">
              <RotateCcw className="w-4 h-4" />
              Qayta urinish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
