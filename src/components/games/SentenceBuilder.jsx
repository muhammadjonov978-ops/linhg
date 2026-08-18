import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { languages } from '../../data/languages';
import { getSentences, shuffle, pickRandom } from './gameData';
import { speak, getSpeechLang } from '../../utils/speech';
import {
  FaListOl as ListOrdered, FaCheckCircle as CheckCircle, FaTimesCircle as XCircle,
  FaArrowLeft as ArrowLeft, FaRedo as RotateCcw, FaVolumeUp as Volume2,
  FaLightbulb as Lightbulb, FaTrophy as Trophy, FaStar as Star,
} from 'react-icons/fa';

const SENTENCE_COUNT = 8;

export default function SentenceBuilder({ onBack }) {
  const { state, dispatch } = useApp();
  const langId = state.selectedLanguage;
  const currentLang = languages.find((l) => l.id === langId);

  const [gameState, setGameState] = useState('idle'); // idle | playing | finished
  const [sentences, setSentences] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [placedBlocks, setPlacedBlocks] = useState([]);
  const [result, setResult] = useState(null); // 'correct' | 'wrong' | null
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [shakeWrong, setShakeWrong] = useState(false);

  const allSentences = useMemo(() => getSentences(langId), [langId]);

  const startGame = useCallback(() => {
    const selected = pickRandom(allSentences, SENTENCE_COUNT);
    setSentences(selected);
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setGameState('playing');
    loadSentence(selected, 0);
  }, [allSentences]);

  const loadSentence = useCallback((all, index) => {
    const sentence = all[index];
    if (!sentence) return;
    const blocks = sentence.words.map((w, i) => ({ text: w, id: i }));
    setAvailableBlocks(shuffle(blocks));
    setPlacedBlocks([]);
    setResult(null);
    setShowHint(false);
    setShakeWrong(false);
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && sentences.length > 0) {
      loadSentence(sentences, currentIndex);
    }
  }, [currentIndex, gameState, sentences, loadSentence]);

  const placeBlock = useCallback((block) => {
    if (result !== null) return;
    setAvailableBlocks((prev) => prev.filter((b) => b.id !== block.id));
    setPlacedBlocks((prev) => [...prev, block]);
  }, [result]);

  const removeBlock = useCallback((block) => {
    if (result !== null) return;
    setPlacedBlocks((prev) => prev.filter((b) => b.id !== block.id));
    setAvailableBlocks((prev) => [...prev, block]);
  }, [result]);

  const checkAnswer = useCallback(() => {
    const sentence = sentences[currentIndex];
    if (!sentence) return;
    const userAnswer = placedBlocks.map((b) => b.text).join(' ');
    const correctAnswer = sentence.words.join(' ');

    if (userAnswer === correctAnswer) {
      setResult('correct');
      const points = 15 + (showHint ? 0 : 5);
      setScore((s) => s + points);
      setCorrectCount((c) => c + 1);
      dispatch({ type: 'ADD_COINS', payload: 2 });
      // To'g'ri javobni ovozli o'qish
      speak(sentence.translation, langId, { rate: 0.8 });
    } else {
      setResult('wrong');
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 600);
    }
  }, [sentences, currentIndex, placedBlocks, showHint, dispatch, langId]);

  const goNext = useCallback(() => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setGameState('finished');
    }
  }, [currentIndex, sentences.length]);

  const currentSentence = sentences[currentIndex];

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
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-blue-500/25">
            <ListOrdered className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold flex items-center gap-2">
              Sentence Builder <span className="text-sm opacity-60">· {currentLang.flag} {currentLang.name}</span>
            </h1>
            <p className="text-xs opacity-60">So'z bloklarini to'g'ri tartibda joylashtiring 📝</p>
          </div>
        </div>
        {gameState === 'playing' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-base-300 bg-base-100">
              <span className="font-bold text-sm">{currentIndex + 1}/{sentences.length}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10">
              <Trophy className="w-3.5 h-3.5 text-primary" />
              <span className="font-bold text-sm text-primary">{score}</span>
            </div>
          </div>
        )}
      </div>

      {/* Idle state */}
      {gameState === 'idle' && (
        <div className="card bg-base-100 border border-base-300 p-8 text-center animate-bounceIn">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="font-display text-2xl font-bold mb-2">Sentence Builder</h2>
          <p className="text-sm opacity-60 mb-2 max-w-md mx-auto">
            Aralashtirilgan so'z bloklarini to'g'ri tartibda joylashtirib, {currentLang.name} tilida gap tuzing.
          </p>
          <p className="text-xs opacity-40 mb-6">
            📝 {SENTENCE_COUNT} ta gap · 💡 Maslahat tugmasi · ⭐ Maslahatsiz ball ko'proq
          </p>
          <button onClick={startGame} className="btn btn-primary btn-lg gap-2">
            <ListOrdered className="w-5 h-5" /> Boshlash
          </button>
        </div>
      )}

      {/* Playing state */}
      {gameState === 'playing' && currentSentence && (
        <>
          {/* Progress bar */}
          <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex) / sentences.length) * 100}%` }}
            />
          </div>

          {/* Uzbek translation hint */}
          <div className="card bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-500/20 p-4 text-center">
            <p className="text-xs opacity-50 mb-1">🇺🇿 Tarjima:</p>
            <p className="font-bold text-base">{currentSentence.translation}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="badge badge-ghost badge-xs">{currentSentence.difficulty}</span>
              <button
                onClick={() => speak(currentSentence.translation, langId, { rate: 0.8 })}
                className="btn btn-ghost btn-xs btn-circle"
                title="Tinglash"
              >
                <Volume2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Placed blocks (answer area) */}
          <div className={`min-h-[64px] p-3 rounded-2xl border-2 border-dashed transition-all duration-300 ${
            shakeWrong ? 'border-error/60 bg-error/5 animate-[shake_0.3s_ease-in-out]' :
            result === 'correct' ? 'border-success/50 bg-success/5' :
            'border-base-300 bg-base-200/30'
          }`}>
            <p className="text-[10px] opacity-40 mb-2">Joylashtirilgan so'zlar:</p>
            {placedBlocks.length === 0 ? (
              <p className="text-xs opacity-30 text-center py-2">So'zlarni shu yerga bosing...</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {placedBlocks.map((block) => (
                  <button
                    key={`p-${block.id}`}
                    onClick={() => removeBlock(block)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95 ${
                      result === 'correct'
                        ? 'bg-success/20 border border-success/40 text-success'
                        : result === 'wrong'
                          ? 'bg-error/15 border border-error/30 text-error'
                          : 'bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25'
                    }`}
                  >
                    {block.text}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Available blocks */}
          <div className="min-h-[64px] p-3 rounded-2xl border border-base-300 bg-base-200/20">
            <p className="text-[10px] opacity-40 mb-2">Mavjud so'zlar:</p>
            <div className="flex flex-wrap gap-2">
              {availableBlocks.map((block) => (
                <button
                  key={`a-${block.id}`}
                  onClick={() => placeBlock(block)}
                  disabled={result !== null}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-base-100 border border-base-300 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 active:scale-95 disabled:opacity-50"
                >
                  {block.text}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setShowHint(true)}
              disabled={showHint || result !== null}
              className="btn btn-ghost btn-sm gap-1.5 disabled:opacity-30"
            >
              <Lightbulb className="w-4 h-4 text-warning" /> Maslahat
            </button>

            {result === null ? (
              <button
                onClick={checkAnswer}
                disabled={placedBlocks.length === 0}
                className="btn btn-primary btn-sm gap-1.5 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" /> Tekshirish
              </button>
            ) : (
              <button onClick={goNext} className="btn btn-primary btn-sm gap-1.5">
                {currentIndex < sentences.length - 1 ? 'Keyingi →' : 'Natijalar'}
              </button>
            )}
          </div>

          {/* Result feedback */}
          {result === 'correct' && (
            <div className="card bg-success/10 border border-success/30 p-4 text-center animate-bounceIn">
              <p className="font-bold text-success flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" /> To'g'ri! Ajoyib! 🎉
              </p>
              <p className="text-xs opacity-60 mt-1">
                To'g'ri javob: {currentSentence.words.join(' ')}
              </p>
            </div>
          )}
          {result === 'wrong' && (
            <div className="card bg-error/10 border border-error/30 p-4 text-center animate-bounceIn">
              <p className="font-bold text-error flex items-center justify-center gap-2">
                <XCircle className="w-5 h-5" /> Noto'g'ri!
              </p>
              <p className="text-xs opacity-60 mt-1">
                To'g'ri javob: <span className="font-bold">{currentSentence.words.join(' ')}</span>
              </p>
            </div>
          )}

          {/* Hint */}
          {showHint && result === null && (
            <div className="card bg-warning/10 border border-warning/30 p-3 text-center animate-fadeIn">
              <p className="text-xs text-warning flex items-center justify-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                Birinchi so'z: <span className="font-bold">{currentSentence.words[0]}</span>
                {currentSentence.words.length > 2 && (
                  <span className="opacity-60">... (Jami {currentSentence.words.length} so'z)</span>
                )}
              </p>
            </div>
          )}
        </>
      )}

      {/* Finished state */}
      {gameState === 'finished' && (
        <div className="card bg-base-100 border border-base-300 p-8 text-center animate-bounceIn">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="font-bold text-lg mb-1">Ajoyib natija!</h3>
          <p className="text-sm opacity-60 mb-4">
            {correctCount}/{sentences.length} ta gap to'g'ri tuzildi
          </p>
          <div className="flex justify-center gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{score}</p>
              <p className="text-[10px] opacity-50">Ball</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{correctCount}</p>
              <p className="text-[10px] opacity-50">To'g'ri</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">
                {sentences.length > 0 ? Math.round((correctCount / sentences.length) * 100) : 0}%
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

      {/* Shake animation */}
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
