import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { languages } from '../../data/languages';
import { getWordPairs, shuffle, pickRandom } from './gameData';
import { speak, getSpeechLang } from '../../utils/speech';
import {
  FaPuzzlePiece as Puzzle, FaCheckCircle as CheckCircle, FaTimesCircle as XCircle,
  FaFire as Flame, FaArrowLeft as ArrowLeft, FaRedo as RotateCcw,
  FaClock as Clock, FaVolumeUp as Volume2, FaTrophy as Trophy,
} from 'react-icons/fa';

const PAIR_COUNT = 6;
const TIME_LIMIT = 60;

export default function WordMatch({ onBack }) {
  const { state, dispatch } = useApp();
  const langId = state.selectedLanguage;
  const currentLang = languages.find((l) => l.id === langId);

  const [gameState, setGameState] = useState('idle'); // idle | playing | finished
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matched, setMatched] = useState(new Set());
  const [wrongPair, setWrongPair] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [combo, setCombo] = useState(0);
  const timerRef = useRef(null);

  const allPairs = useMemo(() => getWordPairs(langId), [langId]);

  const startGame = useCallback(() => {
    const selected = pickRandom(allPairs, PAIR_COUNT);
    setLeftItems(shuffle(selected.map((p, i) => ({ ...p, id: i, side: 'left' }))));
    setRightItems(shuffle(selected.map((p, i) => ({ ...p, id: i, side: 'right' }))));
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatched(new Set());
    setWrongPair(null);
    setTimeLeft(TIME_LIMIT);
    setScore(0);
    setStreak(0);
    setCombo(0);
    setGameState('playing');
  }, [allPairs]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setGameState('finished');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const playSound = useCallback((correct) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = 0.15;
      osc.frequency.value = correct ? 600 : 200;
      osc.type = correct ? 'sine' : 'sawtooth';
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (correct ? 0.15 : 0.3));
      osc.stop(ctx.currentTime + (correct ? 0.15 : 0.3));
    } catch { /* noop */ }
  }, []);

  const speakWord = useCallback((text) => {
    speak(text, langId, { rate: 0.8 });
  }, [langId]);

  const checkMatch = useCallback((left, right) => {
    if (left.id === right.id) {
      // To'g'ri!
      playSound(true);
      speakWord(left.word);
      const newMatched = new Set(matched);
      newMatched.add(left.id);
      setMatched(newMatched);
      setCombo((c) => c + 1);
      setStreak((s) => s + 1);
      const bonus = combo >= 2 ? combo * 5 : 0;
      const points = 10 + bonus;
      setScore((s) => s + points);
      dispatch({ type: 'ADD_COINS', payload: 1 });
      setSelectedLeft(null);
      setSelectedRight(null);

      // Barcha juftliklar topilganda — o'yin tugadi
      if (newMatched.size === leftItems.length) {
        clearInterval(timerRef.current);
        const timeBonus = Math.floor(timeLeft * 0.5);
        setScore((s) => s + timeBonus);
        dispatch({ type: 'ADD_COINS', payload: timeBonus });
        setGameState('finished');
      }
    } else {
      // Noto'g'ri
      playSound(false);
      setWrongPair({ left: left.id, right: right.id });
      setCombo(0);
      setStreak(0);
      setTimeout(() => {
        setWrongPair(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 600);
    }
  }, [matched, combo, leftItems.length, timeLeft, dispatch, playSound, speakWord]);

  const handleLeftClick = useCallback((item) => {
    if (matched.has(item.id)) return;
    setSelectedLeft(item);
    speakWord(item.word);
    if (selectedRight) {
      checkMatch(item, selectedRight);
    }
  }, [matched, selectedRight, checkMatch, speakWord]);

  const handleRightClick = useCallback((item) => {
    if (matched.has(item.id)) return;
    setSelectedRight(item);
    if (selectedLeft) {
      checkMatch(selectedLeft, item);
    }
  }, [matched, selectedLeft, checkMatch]);

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
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/25">
            <Puzzle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold flex items-center gap-2">
              Word Match <span className="text-sm opacity-60">· {currentLang.flag} {currentLang.name}</span>
            </h1>
            <p className="text-xs opacity-60">So'zlarni o'zbekcha tarjimasi bilan moslashtiring 🧩</p>
          </div>
        </div>
        {gameState === 'playing' && (
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${timeLeft <= 10 ? 'border-error/50 bg-error/10 text-error animate-pulse' : 'border-base-300 bg-base-100'}`}>
              <Clock className="w-3.5 h-3.5" />
              <span className="font-bold text-sm tabular-nums">{timeLeft}s</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10">
              <Trophy className="w-3.5 h-3.5 text-primary" />
              <span className="font-bold text-sm text-primary">{score}</span>
            </div>
            {combo >= 2 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-warning/15 border border-warning/30 animate-bounceIn">
                <Flame className="w-3 h-3 text-warning" />
                <span className="text-xs font-bold text-warning">x{combo}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Idle state — Start screen */}
      {gameState === 'idle' && (
        <div className="card bg-base-100 border border-base-300 p-8 text-center animate-bounceIn">
          <div className="text-5xl mb-4">🧩</div>
          <h2 className="font-display text-2xl font-bold mb-2">Word Match</h2>
          <p className="text-sm opacity-60 mb-2 max-w-md mx-auto">
            Chap tomondagi {currentLang.name} so'zlarini o'ng tomondagi o'zbekcha tarjimalari bilan moslashtiring.
          </p>
          <p className="text-xs opacity-40 mb-6">
            ⏱️ {TIME_LIMIT} soniya · 🎯 {PAIR_COUNT} ta juftlik · 🔥 Combo ballari
          </p>
          <button onClick={startGame} className="btn btn-primary btn-lg gap-2">
            <Puzzle className="w-5 h-5" /> Boshlash
          </button>
        </div>
      )}

      {/* Playing state */}
      {gameState === 'playing' && (
        <>
          {/* Progress */}
          <div className="flex items-center justify-between text-xs opacity-60">
            <span>{matched.size}/{leftItems.length} topildi</span>
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-warning" /> Streak: {streak}
            </span>
          </div>

          {/* Match grid */}
          <div className="grid grid-cols-2 gap-4 sm:gap-8">
            {/* Left column — Target language */}
            <div className="space-y-2">
              <p className="text-xs font-semibold opacity-50 text-center mb-2">{currentLang.flag} {currentLang.name}</p>
              {leftItems.map((item) => {
                const isMatched = matched.has(item.id);
                const isSelected = selectedLeft?.id === item.id;
                const isWrong = wrongPair && wrongPair.left === item.id;
                return (
                  <button
                    key={`l-${item.id}`}
                    onClick={() => handleLeftClick(item)}
                    disabled={isMatched}
                    className={`w-full p-3 rounded-xl border-2 text-sm font-semibold transition-all duration-300 ${
                      isMatched
                        ? 'border-success/50 bg-success/10 text-success cursor-default'
                        : isWrong
                          ? 'border-error/60 bg-error/10 text-error animate-[shake_0.3s_ease-in-out]'
                          : isSelected
                            ? 'border-primary bg-primary/15 text-primary shadow-lg shadow-primary/20 scale-[1.02]'
                            : 'border-base-300 bg-base-200/60 hover:border-primary/40 hover:bg-primary/5 active:scale-[0.97]'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {item.word}
                      {isSelected && <Volume2 className="w-3 h-3 shrink-0" />}
                      {isMatched && <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right column — Uzbek translation */}
            <div className="space-y-2">
              <p className="text-xs font-semibold opacity-50 text-center mb-2">🇺🇿 O'zbekcha</p>
              {rightItems.map((item) => {
                const isMatched = matched.has(item.id);
                const isSelected = selectedRight?.id === item.id;
                const isWrong = wrongPair && wrongPair.right === item.id;
                return (
                  <button
                    key={`r-${item.id}`}
                    onClick={() => handleRightClick(item)}
                    disabled={isMatched}
                    className={`w-full p-3 rounded-xl border-2 text-sm font-semibold transition-all duration-300 ${
                      isMatched
                        ? 'border-success/50 bg-success/10 text-success cursor-default'
                        : isWrong
                          ? 'border-error/60 bg-error/10 text-error animate-[shake_0.3s_ease-in-out]'
                          : isSelected
                            ? 'border-secondary bg-secondary/15 text-secondary shadow-lg shadow-secondary/20 scale-[1.02]'
                            : 'border-base-300 bg-base-200/60 hover:border-secondary/40 hover:bg-secondary/5 active:scale-[0.97]'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {item.meaning}
                      {isMatched && <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Finished state */}
      {gameState === 'finished' && (
        <div className="card bg-base-100 border border-base-300 p-8 text-center animate-bounceIn">
          <div className="text-5xl mb-3">{matched.size === leftItems.length ? '🎉' : '⏰'}</div>
          <h3 className="font-bold text-lg mb-1">
            {matched.size === leftItems.length ? 'Ajoyib!' : 'Vaqt tugadi!'}
          </h3>
          <p className="text-sm opacity-60 mb-4">
            {matched.size}/{leftItems.length} juftlik topildi
          </p>
          <div className="flex justify-center gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{score}</p>
              <p className="text-[10px] opacity-50">Ball</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{combo > 0 ? combo : streak}</p>
              <p className="text-[10px] opacity-50">Eng uzun combo</p>
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

      {/* Shake animation for wrong answers */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
