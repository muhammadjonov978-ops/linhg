import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { languages } from '../data/languages';
import { useI18n } from '../i18n';
import {
  buildPlacementQuestions, gradePlacement, getCefrInfo, CEFR_LEVELS,
} from '../lib/placement';
import {
  FaArrowLeft as ArrowLeft, FaBullseye as Target, FaChevronRight as ChevronRight,
  FaChevronLeft as ChevronLeft, FaRedo as RotateCcw,
  FaCoins as Coins, FaRocket as Rocket, FaMedal as Medal,
} from 'react-icons/fa';
import CertificateModal from '../components/CertificateModal';

const SKIP_VALUE = -1;

export default function PlacementTest({ onBack }) {
  const { state, dispatch } = useApp();
  const { t } = useI18n();
  const [answers, setAnswers] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [finished, setFinished] = useState(false);
  const [certOpen, setCertOpen] = useState(false);

  const currentLang = languages.find((l) => l.id === state.selectedLanguage);
  const questions = useMemo(
    () => (state.selectedLanguage ? buildPlacementQuestions(state.selectedLanguage) : []),
    [state.selectedLanguage]
  );

  // Result sahifasida natijani ko'rsatish uchun
  const result = useMemo(() => (finished ? gradePlacement(answers) : null), [finished, answers]);

  const currentQuestion = questions[currentIdx];

  const handleSelect = (optionIdx) => {
    if (!currentQuestion) return;
    const next = [...answers];
    next[currentIdx] = { ...currentQuestion, selected: optionIdx };
    setAnswers(next);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setFinished(true);
      // Darajani saqlash
      const grade = gradePlacement(next);
      dispatch({ type: 'SET_LEVEL', payload: grade.level });
      // Bonus faqat birinchi marta beriladi (qayta topshirishda farming bo'lmasin)
      if (!state.level) {
        dispatch({ type: 'ADD_COINS', payload: 50 });
      }
    }
  };

  const handleSkip = () => handleSelect(SKIP_VALUE);

  const handleRetake = () => {
    setAnswers([]);
    setCurrentIdx(0);
    setFinished(false);
  };

  // Natija ko'rsatilganda CEFR ma'lumoti
  const cefr = result ? getCefrInfo(result.level) : null;

  if (!currentLang) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="opacity-60">{t('placement.noLang')}</p>
        <button onClick={onBack} className="btn btn-primary btn-sm mt-4">{t('placement.back')}</button>
      </div>
    );
  }

  // ===== NATIJA SAHIFASI =====
  if (finished && result && cefr) {
    const alreadyTaken = state.level === result.level;
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fadeInUp">
        <div className="text-center mb-6">
          <button onClick={onBack} className="btn btn-ghost btn-sm gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" /> {t('placement.back')}
          </button>
          <div className="text-6xl mb-3">{cefr.icon}</div>
          <h1 className="font-display text-3xl font-bold">{t('placement.resultTitle')}</h1>
          <p className="opacity-60 mt-1">{currentLang.flag} {currentLang.name}</p>
        </div>

        {/* Daraja kartasi */}
        <div className="card bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/10 border border-primary/30 p-8 text-center mb-4 animate-[scaleIn_0.4s_ease-out]">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-5xl font-black font-display text-primary">{result.level}</span>
            <span className="text-left">
              <p className="font-bold">{cefr.label}</p>
              <p className="text-xs opacity-60">{cefr.description}</p>
            </span>
          </div>

          {/* Daraja pog'onasi */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {CEFR_LEVELS.map((lvl) => {
              const idx = CEFR_LEVELS.findIndex((x) => x.id === result.level);
              const lvlIdx = CEFR_LEVELS.findIndex((x) => x.id === lvl.id);
              return (
                <div
                  key={lvl.id}
                  className={`w-12 h-2 rounded-full transition-all ${
                    lvlIdx <= idx ? 'bg-primary' : 'bg-base-300'
                  }`}
                  title={lvl.id}
                />
              );
            })}
          </div>
          <div className="flex justify-center gap-3 mt-1.5 text-[10px] opacity-50">
            {CEFR_LEVELS.map((l) => <span key={l.id}>{l.id}</span>)}
          </div>

          <div className="flex items-center justify-center gap-2 mt-5">
            <div className="badge badge-lg badge-primary gap-1">
              <Target className="w-3.5 h-3.5" /> {result.correct}/{result.total} to'g'ri
            </div>
            <div className="badge badge-lg badge-warning gap-1">
              <Coins className="w-3.5 h-3.5" /> +50 tanga
            </div>
          </div>

          {!alreadyTaken && (
            <p className="text-xs text-primary mt-3 animate-pulse">🎉 {t('placement.saved')}</p>
          )}
        </div>

        {/* Tavsiya */}
        <div className="card bg-base-100 border border-base-300 p-5 mb-4">
          <h3 className="font-bold text-sm flex items-center gap-2 mb-2">
            <Rocket className="w-4 h-4 text-secondary" /> {t('placement.recommend')}
          </h3>
          <ul className="text-sm opacity-70 space-y-1.5">
            <li>• {t('placement.rec1')}</li>
            <li>• {t('placement.rec2')}</li>
            <li>• {t('placement.rec3')}</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={handleRetake} className="btn btn-ghost flex-1 gap-2 border border-base-300">
            <RotateCcw className="w-4 h-4" /> {t('placement.retake')}
          </button>
          <button
            onClick={() => setCertOpen(true)}
            className="btn btn-warning gap-2 btn-wave"
          >
            <Medal className="w-4 h-4" /> {t('placement.cert')}
          </button>
          <button onClick={onBack} className="btn btn-primary flex-1 gap-2">
            {t('placement.continue')} <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* CEFR sertifikat modal */}
        {certOpen && result && (
          <CertificateModal
            userName={loadSavedUser()?.name || 'O\'quvchi'}
            cert={{
              type: 'cefr',
              title: `${result.level} daraja — ${cefr.label}`,
              subtitle: cefr.description,
              icon: cefr.icon,
              color: '#818cf8',
              level: result.level,
              date: Date.now(),
            }}
            onClose={() => setCertOpen(false)}
          />
        )}
      </div>
    );
  }

  function loadSavedUser() {
    try {
      const raw = localStorage.getItem('lingohub_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // ===== TEST SAHIFASI =====
  if (!questions.length || !currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="opacity-60">{t('placement.empty')}</p>
        <button onClick={onBack} className="btn btn-primary btn-sm mt-4">{t('placement.back')}</button>
      </div>
    );
  }

  const answeredCount = answers.filter((a) => a).length;
  const progress = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="btn btn-ghost btn-sm btn-circle" title={t('placement.back')}>
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <h1 className="font-display text-xl font-bold flex items-center gap-2 justify-center">
            <Target className="w-5 h-5 text-primary" /> {t('placement.title')}
          </h1>
          <p className="text-xs opacity-50">{currentLang.flag} {currentLang.name} · {t('placement.subtitle')}</p>
        </div>
        <div className="badge badge-primary badge-sm">{currentIdx + 1}/{questions.length}</div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 bg-base-200 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question card */}
      <div key={currentIdx} className="card bg-base-100 border border-base-300 p-6 sm:p-8 animate-[fadeInUp_0.3s_ease-out]">
        <div className="text-[10px] uppercase tracking-wider opacity-40 mb-2">
          {t('placement.wordQ')} · {t('placement.lesson')} {currentQuestion.lessonNum}
        </div>
        <h2 className="text-3xl font-extrabold mb-6 text-center break-words">
          {currentQuestion.word}
        </h2>

        <div className="grid gap-2">
          {currentQuestion.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className="btn btn-ghost border border-base-300 justify-start h-auto py-3 px-4 text-left hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <span className="w-7 h-7 rounded-lg bg-base-200 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-sm">{opt}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleSkip}
          className="btn btn-ghost btn-xs mt-4 mx-auto opacity-50 hover:opacity-100"
        >
          🤔 {t('placement.skip')}
        </button>
      </div>

      {/* Nav buttons */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="btn btn-ghost btn-sm gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> {t('placement.prev')}
        </button>
        <span className="text-[10px] opacity-40 self-center">{t('placement.choose')}</span>
        <div className="w-16" />
      </div>

      {/* Daraja legendasi */}
      <div className="mt-6 flex flex-wrap justify-center gap-3 text-[10px] opacity-50">
        {CEFR_LEVELS.map((l) => (
          <span key={l.id} className="flex items-center gap-1">
            {l.icon} {l.id} · {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}
