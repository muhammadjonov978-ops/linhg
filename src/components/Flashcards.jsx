import { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { languages } from '../data/languages';
import { speak, stopSpeaking, getSpeechLang } from '../utils/speech';
import {
  buildDeck, loadSrs, saveSrs, mergeDeckInto, getDueCards,
  rateCard, getSrsStats, RATINGS, MAX_BOX, resetSrs,
} from '../lib/flashcards';
import {
  FaLayerGroup as Layers, FaVolumeUp as Volume2, FaSync as RotateCcw,
  FaCheckCircle as CheckCircle, FaTimesCircle as XCircle, FaFire as Flame,
  FaArrowLeft as ArrowLeft, FaTrash as Trash, FaGraduationCap as GraduationCap,
  FaFileExport as FileExport,
} from 'react-icons/fa';
import { downloadAnkiTsv, downloadCsv } from '../lib/anki';

function speakWord(text, langId) {
  if (!text) return;
  stopSpeaking();
  speak(text, langId, { rate: 0.85 });
}

export default function Flashcards({ onBack }) {
  const { state } = useApp();
  const [flipped, setFlipped] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [queue, setQueue] = useState([]);

  const langId = state.selectedLanguage;
  const currentLang = languages.find((l) => l.id === langId);

  // Darslardan karta to'plami (har til uchun avtomatik)
  const deck = useMemo(() => (langId ? buildDeck(langId) : []), [langId]);

  // SRS holatini localStorage'dan o'qish + yangi kartalarni qo'shish
  const [srs, setSrs] = useState(() => {
    if (!langId) return { cards: {}, updatedAt: Date.now() };
    const base = loadSrs(langId);
    return mergeDeckInto(base, buildDeck(langId));
  });

  useEffect(() => {
    if (!langId) return;
    setSrs((prev) => {
      const merged = mergeDeckInto(prev, deck);
      if (merged !== prev) saveSrs(langId, merged);
      return merged;
    });
  }, [langId, deck]);

  const stats = useMemo(() => getSrsStats(deck, srs), [deck, srs]);

  const current = queue[0] || null;

  // Sessiyani boshlash: bugun due bo'lgan kartalar (agar bo'lmasa — yangi kartalar)
  const startSession = useCallback(() => {
    const due = getDueCards(deck, srs);
    let cards = due.map((d) => d.card);
    if (cards.length === 0) {
      cards = deck.filter((c) => !srs.cards[c.id] || srs.cards[c.id].box === 0).slice(0, 10);
    }
    setQueue(cards);
    setSessionCount(0);
    setSessionCorrect(0);
    setFinished(cards.length === 0);
    setFlipped(false);
  }, [deck, srs]);

  useEffect(() => {
    startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [langId]);

  const handleRate = (rating) => {
    if (!current) return;
    const next = rateCard(srs, current.id, rating);
    setSrs(next);
    saveSrs(langId, next);
    if (rating === 'good' || rating === 'easy') setSessionCorrect((c) => c + 1);
    setSessionCount((c) => c + 1);
    setFlipped(false);
    // Bir oz kutib, keyingi kartaga o'tish (vizual feedback uchun)
    setTimeout(() => {
      setQueue((q) => q.slice(1));
    }, 150);
  };

  const handleFlip = () => setFlipped((f) => !f);

  const handleReset = () => {
    if (!window.confirm("Flashcard tarixi o'chirilsinmi? Barcha box'lar qayta boshlanadi.")) return;
    resetSrs(langId);
    setSrs({ cards: {}, updatedAt: Date.now() });
    startSession();
  };

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
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-xl shadow-lg shadow-violet-500/25">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold flex items-center gap-2">
              Flashcard <span className="text-sm opacity-60">· {currentLang.flag} {currentLang.name}</span>
            </h1>
            <p className="text-xs opacity-60">Smart takrorlash — bilganingiz sari kamroq takrorlanadi 🧠</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Anki eksporti */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-xs gap-1 opacity-70 hover:opacity-100" title="Anki'ga eksport qilish">
              <FileExport className="w-3 h-3" /> Anki
            </div>
            <ul tabIndex={0} className="dropdown-content z-[60] menu p-2 shadow-xl bg-base-100 rounded-box border border-base-300 w-56">
              <li className="text-[10px] opacity-50 px-2 pb-1 pt-1">Anki'ga import: File → Import</li>
              <li>
                <button onClick={() => downloadAnkiTsv(deck, langId)}>
                  📄 TSV (Anki uchun) — {deck.length} karta
                </button>
              </li>
              <li>
                <button onClick={() => downloadCsv(deck, langId)}>
                  📊 CSV (Excel/Sheets)
                </button>
              </li>
            </ul>
          </div>
          <button onClick={handleReset} className="btn btn-ghost btn-xs gap-1 opacity-60 hover:opacity-100" title="Tarixni tozalash">
            <Trash className="w-3 h-3" /> Tozalash
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="card bg-base-100 border border-base-300 p-3 text-center">
          <p className="text-lg font-bold text-primary">{stats.due}</p>
          <p className="text-[10px] opacity-50">Bugun takrorlash</p>
        </div>
        <div className="card bg-base-100 border border-base-300 p-3 text-center">
          <p className="text-lg font-bold text-success">{stats.known}</p>
          <p className="text-[10px] opacity-50">O'zlashtirilgan</p>
        </div>
        <div className="card bg-base-100 border border-base-300 p-3 text-center">
          <p className="text-lg font-bold text-warning">{stats.learning + stats.newCards}</p>
          <p className="text-[10px] opacity-50">O'rganilmoqda</p>
        </div>
        <div className="card bg-base-100 border border-base-300 p-3 text-center">
          <p className="text-lg font-bold text-accent">{stats.reviewedToday}</p>
          <p className="text-[10px] opacity-50">Bugun ko'rilgan</p>
        </div>
      </div>

      {/* Box progress */}
      <div className="card bg-base-100 border border-base-300 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold opacity-60 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" /> Leitner qutilari
          </p>
          <p className="text-[10px] opacity-40">{stats.known}/{stats.total} o'zlashtirilgan</p>
        </div>
        <div className="flex gap-1.5">
          {stats.boxes.map((count, i) => (
            <div key={i} className="flex-1" title={`${count} ta karta · ${i + 1}-quti`}>
              <div
                className={`h-9 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                  i === 0 ? 'bg-base-200 text-base-content/50'
                  : i <= 2 ? 'bg-warning/20 text-warning'
                  : i <= 4 ? 'bg-info/20 text-info'
                  : 'bg-success/20 text-success'
                }`}
              >
                {count}
              </div>
              <p className="text-center text-[9px] opacity-40 mt-1">Q{i + 1}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Card area */}
      <div className="relative min-h-[320px]">
        {finished ? (
          <div className="card bg-base-100 border border-base-300 p-10 text-center animate-bounceIn">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="font-bold text-lg mb-1">Ajoyib!</h3>
            <p className="text-sm opacity-60 mb-4">Barcha kartalar ko'rib chiqildi</p>
            <div className="flex justify-center gap-2">
              <button onClick={startSession} className="btn btn-primary gap-1.5">
                <RotateCcw className="w-4 h-4" /> Qayta boshlash
              </button>
            </div>
          </div>
        ) : current ? (
          <>
            {/* Session progress */}
            <div className="flex items-center justify-between mb-3 text-xs opacity-60">
              <span>{queue.length} ta karta qoldi</span>
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-warning" /> {sessionCorrect}/{sessionCount} to'g'ri
              </span>
            </div>

            {/* Flip card */}
            <button
              onClick={handleFlip}
              className={`relative w-full h-64 [perspective:1200px] group focus:outline-none`}
            >
              <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
                {/* Front */}
                <div className="absolute inset-0 [backface-visibility:hidden] card bg-gradient-to-br from-base-100 to-base-200 border-2 border-base-300 rounded-2xl flex flex-col items-center justify-center p-6 shadow-xl">
                  <div className="badge badge-ghost badge-xs mb-3">{current.kind === 'letter' ? '🔤 Harf' : '📝 So\'z'}</div>
                  <p className="text-4xl font-extrabold mb-2 break-all text-center">{current.front}</p>
                  {current.pronunciation && (
                    <p className="text-sm opacity-50 font-mono">{current.pronunciation}</p>
                  )}
                  <p className="absolute bottom-4 text-xs opacity-40 animate-pulse">👆 Javobni ko'rish uchun bosing</p>
                </div>
                {/* Back */}
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] card bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/30 rounded-2xl flex flex-col items-center justify-center p-6 shadow-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-3xl font-bold text-center break-all">{current.back}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); speakWord(current.back, langId); }}
                      className="btn btn-ghost btn-xs btn-circle hover:bg-primary/15"
                      title="Tinglash"
                    >
                      <Volume2 className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                  {current.backUz && <p className="text-sm opacity-60 mt-1">{current.backUz}</p>}
                  {current.kind === 'word' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); speakWord(current.front, langId); }}
                      className="btn btn-ghost btn-xs gap-1 mt-2 opacity-70 hover:opacity-100"
                    >
                      <Volume2 className="w-3 h-3" /> {current.front}
                    </button>
                  )}
                </div>
              </div>
            </button>

            {/* Rating buttons */}
            {flipped && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 animate-fadeInUp">
                <button onClick={() => handleRate('again')} className="btn btn-error gap-1.5">
                  <XCircle className="w-4 h-4" /> Yana
                </button>
                <button onClick={() => handleRate('hard')} className="btn btn-warning gap-1.5">
                  <RotateCcw className="w-4 h-4" /> Qiyin
                </button>
                <button onClick={() => handleRate('good')} className="btn btn-success gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Bilaman
                </button>
                <button onClick={() => handleRate('easy')} className="btn btn-primary gap-1.5">
                  <Flame className="w-4 h-4" /> Oson
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="card bg-base-100 border border-base-300 p-10 text-center">
            <p className="opacity-60">Kartalar tayyorlanmoqda...</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 text-[10px] opacity-50 pt-2">
        {Object.entries(RATINGS).map(([key, r]) => (
          <span key={key} className="flex items-center gap-1">
            {r.emoji} {r.label} → {key === 'again' ? '0 kun' : `${r.interval} kun`}
          </span>
        ))}
        <span className="opacity-40">· Maksimal quti: {MAX_BOX + 1}</span>
      </div>
    </div>
  );
}
