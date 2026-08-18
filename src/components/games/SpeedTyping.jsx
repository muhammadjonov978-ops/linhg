import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { languages } from '../../data/languages';
import { getSpeedWords, getWordPairs, pickRandom } from './gameData';
import { speak, getSpeechLang } from '../../utils/speech';
import {
  FaKeyboard as Keyboard, FaCheckCircle as CheckCircle, FaTimesCircle as XCircle,
  FaArrowLeft as ArrowLeft, FaRedo as RotateCcw, FaBolt as Zap,
  FaFire as Flame, FaClock as Clock, FaTrophy as Trophy, FaVolumeUp as Volume2,
} from 'react-icons/fa';

const WORD_COUNT = 15;
const BASE_TIME = 3;
const BONUS_TIME = 2;

export default function SpeedTyping({ onBack }) {
  const { state, dispatch } = useApp();
  const langId = state.selectedLanguage;
  const currentLang = languages.find((l) => l.id === langId);

  const [gameState, setGameState] = useState('idle');
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(BASE_TIME * WORD_COUNT);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [result, setResult] = useState(null); // 'correct' | 'wrong' | null
  const [meaning, setMeaning] = useState('');
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const speedWords = useMemo(() => getSpeedWords(langId), [langId]);
  const wordPairs = useMemo(() => getWordPairs(langId), [langId]);

  // So'zni aralashtirish
  const scrambleWord = useCallback((word) => {
    if (word.length <= 2) return word;
    let scrambled = word;
    let attempts = 0;
    while (scrambled === word && attempts < 20) {
      const arr = word.split('');
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      scrambled = arr.join('');
      attempts++;
    }
    return scrambled;
  }, []);

  const loadWord = useCallback((allWords, index) => {
    const word = allWords[index];
    setScrambled(scrambleWord(word));
    setUserInput('');
    setResult(null);
    // Ma'noni topish
    const pair = wordPairs.find((p) => p.word.toLowerCase() === word.toLowerCase());
    setMeaning(pair?.meaning || '');
  }, [scrambleWord, wordPairs]);

  const startGame = useCallback(() => {
    const selected = pickRandom(speedWords, WORD_COUNT);
    setWords(selected);
    setCurrentIndex(0);
    setTimeLeft(BASE_TIME * WORD_COUNT);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setGameState('playing');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [speedWords]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          clearInterval(timerRef.current);
          setGameState('finished');
          return 0;
        }
        return t - 0.1;
      });
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing' && words.length > 0) {
      loadWord(words, currentIndex);
      inputRef.current?.focus();
    }
  }, [currentIndex, gameState, words, loadWord]);

  const playSound = useCallback((correct) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = 0.12;
      osc.frequency.value = correct ? 700 : 250;
      osc.type = 'sine';
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (correct ? 0.12 : 0.25));
      osc.stop(ctx.currentTime + (correct ? 0.12 : 0.25));
    } catch { /* noop */ }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (result !== null || !userInput.trim()) return;

    const correctWord = words[currentIndex];
    const isCorrect = userInput.trim().toLowerCase() === correctWord.toLowerCase();

    if (isCorrect) {
      playSound(true);
      speak(words[currentIndex], langId, { rate: 0.8 });
      setResult('correct');
      setCorrectCount((c) => c + 1);
      setStreak((s) => {
        const newStreak = s + 1;
        setMaxStreak((m) => Math.max(m, newStreak));
        return newStreak;
      });
      const streakBonus = Math.min(streak, 5);
      const points = 10 + streakBonus * 2;
      setScore((s) => s + points);
      setTimeLeft((t) => Math.min(t + BONUS_TIME, BASE_TIME * WORD_COUNT));
      dispatch({ type: 'ADD_COINS', payload: 1 });
    } else {
      playSound(false);
      setResult('wrong');
      setStreak(0);
    }

    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        clearInterval(timerRef.current);
        setGameState('finished');
      }
    }, isCorrect ? 800 : 1200);
  }, [result, userInput, words, currentIndex, streak, dispatch, playSound, langId]);

  // Tez so'z — qo'shimcha ball uchun
  const isFastBonus = timeLeft > BASE_TIME * WORD_COUNT * 0.7;

  if (!currentLang) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="opacity-60">Avval til tanlang</p>
        <button onClick={onBack} className="btn btn-primary btn-sm mt-4">Orqaga</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn btn-ghost btn-sm btn-circle" title="Orqaga">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xl shadow-lg shadow-orange-500/25">
            <Keyboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold flex items-center gap-2">
              Speed Typing <span className="text-sm opacity-60">· {currentLang.flag} {currentLang.name}</span>
            </h1>
            <p className="text-xs opacity-60">Aralashtirilgan harflardan so'zni tezda yozing ⚡</p>
          </div>
        </div>
        {gameState === 'playing' && (
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${timeLeft <= 5 ? 'border-error/50 bg-error/10 text-error animate-pulse' : 'border-base-300 bg-base-100'}`}>
              <Clock className="w-3.5 h-3.5" />
              <span className="font-bold text-sm tabular-nums">{Math.ceil(timeLeft)}s</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10">
              <Trophy className="w-3.5 h-3.5 text-primary" />
              <span className="font-bold text-sm text-primary">{score}</span>
            </div>
            {streak >= 3 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-warning/15 border border-warning/30 animate-bounceIn">
                <Flame className="w-3 h-3 text-warning" />
                <span className="text-xs font-bold text-warning">x{streak}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Idle state */}
      {gameState === 'idle' && (
        <div className="card bg-base-100 border border-base-300 p-8 text-center animate-bounceIn">
          <div className="text-5xl mb-4">⚡</div>
          <h2 className="font-display text-2xl font-bold mb-2">Speed Typing</h2>
          <p className="text-sm opacity-60 mb-2 max-w-md mx-auto">
            Harflari aralashtirib tashlangan so'zlarni to'g'ri ketma-ketlikda tezda yozing.
          </p>
          <p className="text-xs opacity-40 mb-6">
            ⚡ {WORD_COUNT} ta so'z · ⏱️ {BASE_TIME}s har so'z uchun · 🎯 Har to'g'ri so'z +{BONUS_TIME}s
          </p>
          <button onClick={startGame} className="btn btn-primary btn-lg gap-2">
            <Keyboard className="w-5 h-5" /> Boshlash
          </button>
        </div>
      )}

      {/* Playing state */}
      {gameState === 'playing' && (
        <>
          {/* Progress */}
          <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex) / words.length) * 100}%` }}
            />
          </div>

          {/* Scrambled word display */}
          <div className="card bg-base-100 border border-base-300 p-8 text-center">
            <p className="text-xs opacity-40 mb-2">{currentIndex + 1}/{words.length} so'z</p>

            {/* Scrambled word */}
            <div className="mb-4">
              <p className="text-4xl sm:text-5xl font-extrabold tracking-widest mb-2 font-mono">
                {scrambled.split('').map((char, i) => (
                  <span
                    key={i}
                    className={`inline-block transition-all duration-300 ${
                      result === 'correct'
                        ? 'text-success'
                        : result === 'wrong'
                          ? 'text-error'
                          : 'text-base-content'
                    }`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {char}
                  </span>
                ))}
              </p>
              {meaning && (
                <p className="text-sm opacity-50 flex items-center justify-center gap-1.5">
                  🇺🇿 {meaning}
                  <button
                    onClick={() => speak(words[currentIndex], langId, { rate: 0.7 })}
                    className="btn btn-ghost btn-xs btn-circle"
                    title="Tinglash"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </p>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-md mx-auto">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={result !== null}
                placeholder="So'zni yozing..."
                className="input input-bordered flex-1 text-center text-lg font-bold tracking-wider disabled:opacity-50"
                autoComplete="off"
                autoFocus
              />
              <button
                type="submit"
                disabled={result !== null || !userInput.trim()}
                className="btn btn-primary gap-1 disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
              </button>
            </form>

            {/* Quick skip */}
            {result === null && (
              <button
                onClick={() => {
                  setResult('wrong');
                  setStreak(0);
                  setTimeout(() => {
                    if (currentIndex < words.length - 1) setCurrentIndex((i) => i + 1);
                    else { clearInterval(timerRef.current); setGameState('finished'); }
                  }, 600);
                }}
                className="btn btn-ghost btn-xs mt-3 opacity-40 hover:opacity-70"
              >
                O'tkazib yuborish →
              </button>
            )}
          </div>

          {/* Result feedback */}
          {result === 'correct' && (
            <div className="card bg-success/10 border border-success/30 p-3 text-center animate-bounceIn">
              <p className="font-bold text-success text-sm flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> To'g'ri! +{10 + Math.min(streak, 5) * 2} ball
                {isFastBonus && <span className="text-xs opacity-70">(tez bonus ⚡)</span>}
              </p>
            </div>
          )}
          {result === 'wrong' && (
            <div className="card bg-error/10 border border-error/30 p-3 text-center animate-bounceIn">
              <p className="font-bold text-error text-sm flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4" /> To'g'ri javob: <span className="font-mono">{words[currentIndex]}</span>
              </p>
            </div>
          )}
        </>
      )}

      {/* Finished state */}
      {gameState === 'finished' && (
        <div className="card bg-base-100 border border-base-300 p-8 text-center animate-bounceIn">
          <div className="text-5xl mb-3">
            {correctCount === words.length ? '🏆' : correctCount >= words.length * 0.7 ? '🎉' : '💪'}
          </div>
          <h3 className="font-bold text-lg mb-1">
            {correctCount === words.length ? 'Mukammal!' : correctCount >= words.length * 0.7 ? 'Ajoyib!' : 'Yaxshi harakat!'}
          </h3>
          <p className="text-sm opacity-60 mb-4">
            {correctCount}/{words.length} ta so'z to'g'ri
          </p>
          <div className="flex justify-center gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{score}</p>
              <p className="text-[10px] opacity-50">Ball</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{maxStreak}</p>
              <p className="text-[10px] opacity-50">Eng uzun streak</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">
                {words.length > 0 ? Math.round((correctCount / words.length) * 100) : 0}%
              </p>
              <p className="text-[10px] opacity-50">Samaradorlik</p>
            </div>
          </div>
          <div className="flex justify-center gap-2">
            <button onClick={startGame} className="btn btn-primary gap-1.5">
              <RotateCcw className="w-4 h-4" /> Qayta o'ynash
            </button>
            <button onClick={onBack} className="btn btn-ghost gap-1.5">
              <ArrowLeft className="w-4 h-4" /> O'yinlar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
