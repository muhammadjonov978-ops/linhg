import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { languages } from '../data/languages';
import { getGrammarLessons, HAS_GRAMMAR } from '../data/grammar';
import { speak, stopSpeaking } from '../utils/speech';
import {
  FaArrowLeft as ArrowLeft, FaVolumeUp as Volume2, FaCheckCircle as CheckCircle,
  FaChevronRight as ChevronRight, FaGraduationCap as GraduationCap,
  FaCoins as Coins, FaTrophy as Trophy, FaRedo as RotateCcw,
  FaExclamationTriangle as AlertIcon,
} from 'react-icons/fa';

const GRAMMAR_REWARD = 20;

export default function GrammarPage({ onBack }) {
  const { state, dispatch } = useApp();
  const [selectedId, setSelectedId] = useState(null);
  const [quizIdx, setQuizIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [showExplain, setShowExplain] = useState(false);

  const currentLang = languages.find((l) => l.id === state.selectedLanguage);
  const topics = useMemo(
    () => (state.selectedLanguage ? getGrammarLessons(state.selectedLanguage) : []),
    [state.selectedLanguage]
  );

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const selected = topics.find((topic) => topic.id === selectedId) || null;

  const getProgress = (topicId) => {
    const key = `${state.selectedLanguage}-grammar-${topicId}`;
    return state.progress[key] || null;
  };

  const startTopic = (topic) => {
    stopSpeaking();
    setSelectedId(topic.id);
    setQuizIdx(0);
    setPicked(null);
    setCorrectCount(0);
    setQuizDone(false);
    setShowExplain(false);
  };

  const handlePick = (optionIdx) => {
    if (picked !== null || !selected) return;
    setPicked(optionIdx);
    const isRight = optionIdx === selected.quiz[quizIdx].a;
    if (isRight) setCorrectCount((c) => c + 1);
    setTimeout(() => {
      if (quizIdx < selected.quiz.length - 1) {
        setQuizIdx((i) => i + 1);
        setPicked(null);
      } else {
        const finalCorrect = correctCount + (isRight ? 1 : 0);
        setQuizDone(true);
        const score = Math.round((finalCorrect / selected.quiz.length) * 100);
        dispatch({ type: 'COMPLETE_GRAMMAR_LESSON', payload: { langId: state.selectedLanguage, grammarId: selected.id, score } });
        if (score >= 60) {
          // Dars birinchi marta muvaffaqiyatli tugatilgan bo'lsa — tanga
          const prev = getProgress(selected.id);
          if (!prev?.completed) {
            dispatch({ type: 'ADD_COINS', payload: GRAMMAR_REWARD });
          }
        }
      }
    }, 900);
  };

  if (!currentLang) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="opacity-60">Avval til tanlang</p>
        <button onClick={onBack} className="btn btn-primary btn-sm mt-4">Orqaga</button>
      </div>
    );
  }

  // ===== MAVZU ICHIDA =====
  if (selected) {
    const q = selected.quiz[quizIdx];
    const progress = getProgress(selected.id);
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 animate-fadeInUp">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => { stopSpeaking(); setSelectedId(null); }} className="btn btn-ghost btn-sm btn-circle" title="Orqaga">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg shadow-lg shadow-amber-500/20">
            {selected.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg font-bold truncate">{selected.title}</h1>
            <div className="flex items-center gap-2">
              <span className="badge badge-xs badge-primary">{selected.level}</span>
              {progress?.completed && (
                <span className="badge badge-xs badge-success gap-1">
                  <CheckCircle className="w-2.5 h-2.5" /> O'zlashtirildi
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tushuntirish */}
        <div className="card bg-base-100 border border-base-300 p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm">Qoida</h3>
            {!showExplain && (
              <button onClick={() => setShowExplain(true)} className="btn btn-ghost btn-xs ml-auto opacity-60">
                Tarjima ko'rsatish
              </button>
            )}
          </div>
          <div className="whitespace-pre-line text-sm leading-relaxed opacity-80">
            {showExplain ? selected.explanation : selected.explanation.split('\n')[0]}
          </div>
        </div>

        {/* Misollar */}
        <div className="card bg-base-100 border border-base-300 p-5 mb-4">
          <h3 className="font-bold text-sm mb-3">Misollar</h3>
          <div className="space-y-2">
            {selected.examples.map((ex, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-base-200 rounded-xl">
                <button
                  onClick={() => speak(ex.target, currentLang.id, { rate: 0.8 })}
                  className="btn btn-ghost btn-xs btn-circle flex-shrink-0"
                  title="Tinglash"
                >
                  <Volume2 className="w-3.5 h-3.5 text-primary" />
                </button>
                <div className="min-w-0">
                  <p className="text-sm font-medium break-words">{ex.target}</p>
                  <p className="text-xs opacity-50">{ex.uz}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test */}
        <div className="card bg-base-100 border border-primary/25 p-5">
          {quizDone ? (
            <div className="text-center py-4 animate-bounceIn">
              <div className="text-5xl mb-2">{correctCount === selected.quiz.length ? '🏆' : correctCount >= 2 ? '🎉' : '💪'}</div>
              <h3 className="font-bold text-lg">{correctCount}/{selected.quiz.length} to'g'ri</h3>
              <p className="text-xs opacity-60 mb-4">
                {correctCount === selected.quiz.length
                  ? "A'lo! Mavzuni mukammal o'zlashtirdingiz!"
                  : correctCount >= 2
                    ? "Yaxshi natija! Mavzu o'zlashtirildi."
                    : "Yana bir bor qoidani o'qib chiqing va qayta urinib ko'ring."}
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => { setQuizIdx(0); setPicked(null); setCorrectCount(0); setQuizDone(false); }}
                  className="btn btn-ghost gap-2 border border-base-300"
                >
                  <RotateCcw className="w-4 h-4" /> Qayta topshirish
                </button>
                <button onClick={() => setSelectedId(null)} className="btn btn-primary gap-2">
                  Boshqa mavzu <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-warning" /> Mini-test
                </h3>
                <span className="text-xs opacity-50">{quizIdx + 1}/{selected.quiz.length} · +{GRAMMAR_REWARD} 🪙</span>
              </div>
              <p key={quizIdx} className="text-base font-medium mb-4 animate-fadeInUp">{q.q}</p>
              <div className="grid gap-2">
                {q.options.map((opt, i) => {
                  const isPicked = picked === i;
                  const isRight = i === q.a;
                  let cls = 'btn-ghost border-base-300 hover:border-primary/50';
                  if (picked !== null) {
                    if (isRight) cls = 'btn-success border-success';
                    else if (isPicked) cls = 'btn-error border-error';
                    else cls = 'btn-ghost border-base-300 opacity-50';
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handlePick(i)}
                      disabled={picked !== null}
                      className={`btn justify-start h-auto py-3 px-4 text-left border transition-all ${cls}`}
                    >
                      <span className="w-6 h-6 rounded-lg bg-base-200 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm">{opt}</span>
                      {picked !== null && isRight && <CheckCircle className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </div>
              {picked !== null && (
                <p className="text-xs mt-3 p-3 bg-base-200 rounded-xl animate-fadeInUp opacity-70">
                  💡 {q.explain}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ===== MAVZU RO'YXATI =====
  const completedCount = topics.filter((topic) => getProgress(topic.id)?.completed).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn btn-ghost btn-sm btn-circle" title="Orqaga">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl shadow-lg shadow-amber-500/25">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold flex items-center gap-2">
              Grammatika <span className="text-sm opacity-60">· {currentLang.flag} {currentLang.name}</span>
            </h1>
            <p className="text-xs opacity-60">Qoidalar, misollar va mini-testlar</p>
          </div>
        </div>
        {topics.length > 0 && (
          <div className="badge badge-lg badge-primary">{completedCount}/{topics.length} o'zlashtirildi</div>
        )}
      </div>

      {!HAS_GRAMMAR.has(state.selectedLanguage) ? (
        <div className="card bg-base-100 border border-base-300 p-10 text-center">
          <div className="text-5xl mb-3">🚧</div>
          <h3 className="font-bold text-lg mb-1">Bu til uchun grammatika hali tayyor emas</h3>
          <p className="text-sm opacity-60 mb-4">
            Hozircha grammatika darslari: English, Русский, 한국어, العربية, Español, Français, Deutsch va O'zbekcha tillarida mavjud.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs opacity-70">
            <AlertIcon className="w-4 h-4 text-warning" />
            <span>Tez orada barcha tillarga qo'shiladi!</span>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {topics.map((topic) => {
            const prog = getProgress(topic.id);
            const done = !!prog?.completed;
            return (
              <button
                key={topic.id}
                onClick={() => startTopic(topic)}
                className={`card bg-base-100 border text-left transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-md ${
                  done ? 'border-success/30' : 'border-base-300 hover:border-primary/40'
                }`}
              >
                <div className="card-body p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center text-lg flex-shrink-0">
                      {topic.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm truncate">{topic.title}</h3>
                        {done && <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="badge badge-xs badge-primary">{topic.level}</span>
                        <span className="text-[10px] opacity-50">{topic.examples.length} misol · {topic.quiz.length} savol</span>
                        {prog?.score > 0 && (
                          <span className={`text-[10px] font-medium ${prog.score >= 80 ? 'text-success' : 'text-warning'}`}>
                            {prog.score}%
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-20 group-hover:opacity-50 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Progress summary */}
      {topics.length > 0 && (
        <div className="card bg-base-100 border border-base-300 p-4">
          <div className="flex items-center justify-between mb-2 text-xs opacity-60">
            <span className="font-semibold flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-warning" /> Har bir mavzu uchun +{GRAMMAR_REWARD} tanga
            </span>
            <span>{completedCount}/{topics.length}</span>
          </div>
          <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700"
              style={{ width: `${topics.length ? (completedCount / topics.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
