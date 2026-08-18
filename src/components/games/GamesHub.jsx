import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { languages } from '../../data/languages';
import {
  FaPuzzlePiece as Puzzle, FaListOl as ListOrdered, FaKeyboard as Keyboard,
  FaLayerGroup as Layers, FaArrowLeft as ArrowLeft, FaTrophy as Trophy,
  FaFire as Flame, FaCoins as Coins, FaGamepad as Gamepad,
} from 'react-icons/fa';

const GAMES = [
  {
    id: 'word-match',
    title: 'Word Match',
    description: "So'zlarni o'zbekcha tarjimasi bilan moslashtiring. Taymer va combo tizimi!",
    icon: Puzzle,
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/25',
    emoji: '🧩',
    features: ['Taymer (60s)', 'Combo ballari', 'Tovush effektlari'],
    route: '#/games/word-match',
  },
  {
    id: 'sentence-builder',
    title: 'Sentence Builder',
    description: "Aralashtirilgan so'z bloklarini to'g'ri tartibda joylashtirib gap tuzing.",
    icon: ListOrdered,
    gradient: 'from-blue-500 to-indigo-600',
    shadow: 'shadow-blue-500/25',
    emoji: '📝',
    features: ["Grammatika mashqi", 'Maslahat tizimi', 'Ovozli o\'qish'],
    route: '#/games/sentence-builder',
  },
  {
    id: 'speed-typing',
    title: 'Speed Typing',
    description: "Aralashtirilgan harflardan so'zni tezda yozing. Vaqt bosimi ostida!",
    icon: Keyboard,
    gradient: 'from-orange-500 to-red-600',
    shadow: 'shadow-orange-500/25',
    emoji: '⚡',
    features: ['Tezlik mashqi', 'Streak tizimi', '+Vaqt bonusi'],
    route: '#/games/speed-typing',
  },
  {
    id: 'flashcards',
    title: 'Flashcard Quiz',
    description: "Kartochkalar orqali so'zlarni yodlang. SRS algoritmi bilan interval takrorlash.",
    icon: Layers,
    gradient: 'from-violet-500 to-fuchsia-600',
    shadow: 'shadow-violet-500/25',
    emoji: '🧠',
    features: ['SRS algoritmi', 'Leitner qutilari', 'Anki eksport'],
    route: '#/flashcards',
  },
];

export default function GamesHub({ onSelectGame }) {
  const { state } = useApp();
  const langId = state.selectedLanguage;
  const currentLang = languages.find((l) => l.id === langId);

  const stats = useMemo(() => {
    const completed = Object.values(state.progress).filter((p) => p.completed).length;
    return {
      completedLessons: completed,
      coins: state.coins,
      streak: state.streak,
    };
  }, [state.progress, state.coins, state.streak]);

  if (!currentLang) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="opacity-60">Avval til tanlang</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
          <Gamepad className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold">O'yinlar</h1>
          <p className="text-xs opacity-60">
            {currentLang.flag} {currentLang.name} — So'z boyligingizni oshiring! 🎮
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-base-300 bg-base-100 shrink-0">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-xs font-bold">{state.streak} kun streak</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-base-300 bg-base-100 shrink-0">
          <Coins className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-bold">{state.coins} tanga</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-base-300 bg-base-100 shrink-0">
          <Trophy className="w-3.5 h-3.5 text-violet-500" />
          <span className="text-xs font-bold">{stats.completedLessons} dars</span>
        </div>
      </div>

      {/* Games grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GAMES.map((game) => {
          const Icon = game.icon;
          return (
            <button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className={`card bg-base-100 border border-base-300 p-5 text-left hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 group`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${game.gradient} flex items-center justify-center shadow-lg ${game.shadow} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base mb-1 flex items-center gap-2">
                    {game.title}
                    <span className="text-lg">{game.emoji}</span>
                  </h3>
                  <p className="text-xs opacity-60 mb-3 leading-relaxed">{game.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {game.features.map((f) => (
                      <span key={f} className="badge badge-ghost badge-xs opacity-60">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tip */}
      <div className="card bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/15 p-4">
        <p className="text-xs opacity-60 text-center">
          💡 <span className="font-semibold">Maslahat:</span> Har kuni kamida 1 ta o'yin o'ynang — streak saqlanadi va qo'shimcha tanga olasiz!
        </p>
      </div>
    </div>
  );
}
