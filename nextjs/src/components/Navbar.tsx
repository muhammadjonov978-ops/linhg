'use client';

import { useApp } from '../context/AppContext';
import { languages } from '../data/languages';
import { useRouter } from 'next/navigation';
import { Home, MessageCircle, Trophy, Coins, Award } from 'lucide-react';
import ThemePicker from './ThemePicker';

export default function Navbar({ onToggleTutor }: { onToggleTutor?: () => void }) {
  const { state, dispatch } = useApp();
  const router = useRouter();

  const currentLang = languages.find(l => l.id === state.selectedLanguage);

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch({ type: 'SELECT_LANGUAGE', payload: null });
    router.push('/');
  };

  return (
    <nav className="navbar bg-base-100/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-base-200">
      <div className="navbar-start">
        <a href="/" onClick={handleHomeClick} className="btn btn-ghost text-xl gap-2 px-2">
          <img
            src="/logo.png"
            alt="Lingohub"
            className="w-9 h-9 rounded-lg object-cover shadow-sm ring-1 ring-base-300"
          />
          <span className="font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:inline">
            Lingohub
          </span>
        </a>
      </div>

      <div className="navbar-center hidden lg:flex gap-2">
        {currentLang && (
          <div className="badge badge-lg gap-2 p-3">
            <span className="text-lg">{currentLang.flag}</span>
            <span className="font-medium">{currentLang.name}</span>
          </div>
        )}

        <div className="flex items-center gap-3 ml-4">
          <div className="badge badge-primary gap-1 p-3 tooltip" data-tip="Tanga ball">
            <Coins className="w-4 h-4" />
            <span className="font-bold">{state.coins}</span>
            <span className="text-xs opacity-70 hidden sm:inline">🪙</span>
          </div>

          {state.streak > 0 && (
            <div className="badge badge-secondary gap-1 p-3 tooltip" data-tip="Kunlik streak">
              <Trophy className="w-4 h-4" />
              <span className="font-bold">{state.streak}</span>
              <span className="text-xs opacity-70 hidden sm:inline">kun</span>
            </div>
          )}

          {(state.achievements?.filter(a => a.unlocked && a.justUnlocked)?.length || 0) > 0 && (
            <div className="badge badge-success gap-1 p-3 animate-pulse tooltip" data-tip="Yangi yutuqlar!">
              <Award className="w-4 h-4" />
              <span className="font-bold">{state.achievements.filter(a => a.unlocked && a.justUnlocked).length}</span>
            </div>
          )}
        </div>
      </div>

      <div className="navbar-end gap-1">
        {/* Theme Picker (35 themes) */}
        <ThemePicker />

        {currentLang && (
          <button
            onClick={onToggleTutor}
            className={`btn btn-ghost btn-sm btn-circle tooltip ${state.isTutorOpen ? 'bg-primary/20' : ''}`}
            data-tip="AI Tutor"
          >
            <MessageCircle className={`w-4 h-4 ${state.isTutorOpen ? 'text-primary' : ''}`} />
          </button>
        )}

        <button            onClick={handleHomeClick}
          className="btn btn-ghost btn-sm btn-circle tooltip"
          data-tip="Bosh sahifa"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
