import { useState, useEffect, useCallback } from 'react';
import { getSpeechLang } from '../utils/speech';
import { Mic, MicOff, Volume2, CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

export default function SpeakingSection({ exercises, langId, levelId: _levelId, onComplete }) {
  const [currentEx, setCurrentEx] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [results, setResults] = useState({});
  const [recognitionResult, setRecognitionResult] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [completedExs, setCompletedExs] = useState(new Set());
  const [recognition, setRecognition] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const exercise = exercises[currentEx];
  const isWordExercise = !!exercise?.words;
  const items = exercise ? (isWordExercise ? exercise.words : exercise.sentences) : [];
  const currentItem = items?.[currentItemIndex];

  // Hook'lar har doim chaqirilishi kerak — `if (!exercise) return null`
  // hammasidan keyin turadi (rules-of-hooks).
  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = getSpeechLang(langId);
      recog.maxAlternatives = 3;

      recog.onresult = (event) => {
        const results = Array.from(event.results);
        const transcript = results.map(r => r[0].transcript).join('');
        setRecognitionResult(transcript);
      };

      recog.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert('Iltimos, mikrofonga ruxsat bering!');
        }
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    } else {
      console.warn('Speech Recognition not supported');
    }

    return () => {
      // Cleanup
    };
  }, [langId]);

  const speakText = useCallback((text, callback) => {
    if ('speechSynthesis' in window) {
      setIsPlaying(true);
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getSpeechLang(langId);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.onend = () => {
        setIsPlaying(false);
        callback?.();
      };
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  }, [langId]);

  const playCurrentItem = useCallback(() => {
    speakText(currentItem);
  }, [speakText, currentItem]);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      setRecognitionResult('');
      setIsListening(true);
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      try {
        recognition.start();
      } catch (e) {
        console.warn('Recognition start error:', e);
        setIsListening(false);
      }
    } else if (!recognition) {
      alert('Speech Recognition sizning brauzeringizda qo\'llanmaydi. Chrome yoki Edge dan foydalaning.');
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  const handleCheck = useCallback(() => {
    if (!recognitionResult.trim()) return;

    setIsProcessing(true);
    const spoken = recognitionResult.trim().toLowerCase();
    const target = currentItem.toLowerCase();

    // Calculate similarity (simple word matching + character comparison)
    const spokenWords = spoken.split(/\s+/);
    const targetWords = target.split(/\s+/);

    let matchCount = 0;
    targetWords.forEach(tw => {
      const cleanTw = tw.replace(/[^a-z0-9]/g, '');
      spokenWords.forEach(sw => {
        const cleanSw = sw.replace(/[^a-z0-9]/g, '');
        if (cleanSw === cleanTw || cleanSw.includes(cleanTw) || cleanTw.includes(cleanSw)) {
          matchCount++;
        }
      });
    });

    const wordAccuracy = targetWords.length > 0 ? Math.round((matchCount / targetWords.length) * 100) : 0;

    // Also check character-level similarity for more accurate scoring
    let charMatchCount = 0;
    const minLen = Math.min(spoken.length, target.length);
    for (let i = 0; i < minLen; i++) {
      if (spoken[i] === target[i]) charMatchCount++;
    }
    const charAccuracy = target.length > 0 ? Math.round((charMatchCount / target.length) * 100) : 0;

    // Combine both metrics
    const finalAccuracy = Math.round((wordAccuracy + charAccuracy) / 2);

    setResults(prev => ({
      ...prev,
      [currentItemIndex]: {
        spoken: recognitionResult,
        target: currentItem,
        accuracy: finalAccuracy,
        passed: finalAccuracy >= 60,
      },
    }));

    setIsProcessing(false);

    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
      setRecognitionResult('');
    } else {
      // Calculate final score
      const allResults = {
        ...results,
        [currentItemIndex]: {
          spoken: recognitionResult,
          target: currentItem,
          accuracy: finalAccuracy,
          passed: finalAccuracy >= 60,
        },
      };

      const totalAccuracy = Object.values(allResults).reduce((sum, r) => sum + r.accuracy, 0);
      const avgAccuracy = Math.round(totalAccuracy / items.length);

      setScore(avgAccuracy);
      setShowResults(true);

      const newCompleted = new Set(completedExs);
      newCompleted.add(currentEx);
      setCompletedExs(newCompleted);

      if (newCompleted.size >= exercises.length) {
        onComplete(avgAccuracy);
      }
    }
  }, [recognitionResult, currentItem, currentItemIndex, items.length, results, completedExs, currentEx, exercises.length, onComplete]);

  const handleNextExercise = () => {
    if (currentEx < exercises.length - 1) {
      setCurrentEx(prev => prev + 1);
      setCurrentItemIndex(0);
      setRecognitionResult('');
      setResults({});
      setShowResults(false);
    }
  };

  const handleReset = () => {
    setCurrentItemIndex(0);
    setRecognitionResult('');
    setResults({});
    setShowResults(false);
  };

  if (!exercise) return null;

  const progress = completedExs.size;
  const total = exercises.length;

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-error" />
          <h3 className="font-semibold">{exercise.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-70">{progress}/{total}</span>
          <div className="w-20 h-2 bg-base-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-error rounded-full transition-all duration-500"
              style={{ width: `${(progress / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {!showResults ? (
        <>
          {/* Progress within exercise */}
          <div className="text-center text-sm opacity-60">
            {currentItemIndex + 1} / {items.length}
          </div>

          {/* Main card */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body items-center text-center py-8">
              {/* Target display */}
              <div className="mb-6">
                <p className="text-xs opacity-50 mb-2">
                  {isWordExercise ? "Quyidagi so'zni talaffuz qiling:" : "Quyidagi gapni talaffuz qiling:"}
                </p>
                <div className="text-2xl font-bold p-4 bg-base-200 rounded-xl">
                  "{currentItem}"
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={playCurrentItem}
                  disabled={isListening || isPlaying}
                  className="btn btn-outline btn-lg btn-circle"
                  title="Eshitish"
                >
                  <Volume2 className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
                </button>

                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isPlaying || isProcessing}
                  className={`btn btn-lg btn-circle ${
                    isListening ? 'btn-error animate-pulse' : 'btn-primary'
                  }`}
                  title={isListening ? "To'xtatish" : "Gapirish"}
                >
                  {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
              </div>

              {/* Recognition result */}
              <div className="w-full max-w-md">
                {(recognitionResult || isListening) && (
                  <div className="p-4 bg-base-200 rounded-xl mb-4">
                    <p className="text-xs opacity-50 mb-2">Sizning talaffuzingiz:</p>
                    <p className="text-lg font-medium">
                      {recognitionResult || <span className="animate-pulse opacity-50">Gapiryapsiz...</span>}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleCheck}
                  disabled={!recognitionResult.trim() || isListening || isProcessing}
                  className="btn btn-primary w-full"
                >
                  {isProcessing ? (
                    <>Tekshirilmoqda...</>
                  ) : (
                    <><CheckCircle className="w-4 h-4" /> Talaffuzni tekshirish</>
                  )}
                </button>
              </div>

              {isListening && (
                <div className="flex items-center gap-2 mt-4 text-sm text-error">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
                  </span>
                  Mikrofon yoqilgan... gapiring
                </div>
              )}
            </div>
          </div>

          {/* Previous results */}
          {Object.keys(results).length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium opacity-70">Natijalar:</p>
              {Object.entries(results).map(([idx, res]) => (
                <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${res.passed ? 'bg-success/10' : 'bg-error/10'}`}>
                  {res.passed ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-error" />
                  )}
                  <span className="flex-1">
                    <span className={res.passed ? 'text-success' : 'text-error'}>
                      "{res.spoken}" 
                    </span>
                    <span className="text-xs opacity-50 ml-2">({res.accuracy}%)</span>
                  </span>
                  {!res.passed && (
                    <span className="text-xs opacity-60">→ "{res.target}"</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Final Results */
        <div className="space-y-4">
          <div className={`card ${score >= 80 ? 'bg-success/10 border-success' : score >= 50 ? 'bg-warning/10 border-warning' : 'bg-error/10 border-error'} border shadow-sm`}>
            <div className="card-body text-center py-8">
              <div className="text-5xl font-bold mb-2">{score}%</div>
              <p className="text-sm opacity-70">
                {score >= 80 ? '🎉 Ajoyib talaffuz!' : score >= 50 ? '👍 Yaxshi, lekin yaxshilash mumkin' : '🔄 Ko\'proq mashq qiling!'}
              </p>
              <p className="text-xs opacity-50 mt-2">
                {score >= 60 ? '🏆 Siz bu mashqdan o\'tdingiz!' : '💪 Yana urinib ko\'ring!'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => {
              const res = Object.values(results).find((r, i) => i === idx) || results[idx];
              return (
                <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${res?.passed ? 'bg-success/10' : 'bg-error/10'}`}>
                  {res?.passed ? <CheckCircle className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-error" />}
                  <span className="flex-1">
                    Siz: "{res?.spoken || '—'}" 
                    <span className="text-xs opacity-50 ml-2">({res?.accuracy || 0}%)</span>
                  </span>
                  {!res?.passed && (
                    <span className="text-xs opacity-60">→ "{item}"</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            {currentEx < exercises.length - 1 && (
              <button onClick={handleNextExercise} className="btn btn-primary flex-1">
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
