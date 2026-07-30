import { useApp } from '../context/AppContext';
import { languages } from '../data/languages';
import { Home, MessageCircle, Trophy, Zap, Brain, Sun, Moon, Award } from 'lucide-react';

export default function Navbar({ onToggleTutor }) {
  const { state, dispatch } = useApp();

  const currentLang = languages.find(l => l.id === state.selectedLanguage);

  return (
    <nav className="navbar bg-base-100/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-base-200">
      <div className="navbar-start">
        <a href="/" onClick={(e) => {
          e.preventDefault();
          dispatch({ type: 'SELECT_LANGUAGE', payload: null });
        }} className="btn btn-ghost text-xl gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <span className="font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:inline">
            Alpomish
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
          {/* XP Display */}
          <div className="badge badge-primary gap-1 p-3 tooltip" data-tip="XP ball">
            <Zap className="w-4 h-4" />
            <span className="font-bold">{state.xp}</span>
            <span className="text-xs opacity-70 hidden sm:inline">XP</span>
          </div>
          
          {/* Streak Display */}
          {state.streak > 0 && (
            <div className="badge badge-secondary gap-1 p-3 tooltip" data-tip="Kunlik streak">
              <Trophy className="w-4 h-4" />
              <span className="font-bold">{state.streak}</span>
              <span className="text-xs opacity-70 hidden sm:inline">kun</span>
            </div>
          )}

          {/* Achievement badge count */}
          {(state.achievements?.filter(a => a.unlocked && a.justUnlocked)?.length || 0) > 0 && (
            <div className="badge badge-success gap-1 p-3 animate-pulse tooltip" data-tip="Yangi yutuqlar!">
              <Award className="w-4 h-4" />
              <span className="font-bold">{state.achievements.filter(a => a.unlocked && a.justUnlocked).length}</span>
            </div>
          )}
        </div>
      </div>

      <div className="navbar-end gap-1">
        {/* Theme Toggle */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
          className="btn btn-ghost btn-sm btn-circle tooltip"
          data-tip={state.theme === 'dark' ? 'Yorug\' rejim' : 'Qorong\'i rejim'}
        >
          {state.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-warning" />
          ) : (
            <Moon className="w-4 h-4 text-base-content" />
          )}
        </button>

        {currentLang && (
          <>
            {/* AI Tutor Button */}
            <button
              onClick={onToggleTutor}
              className={`btn btn-ghost btn-sm btn-circle tooltip ${state.isTutorOpen ? 'bg-primary/20' : ''}`}
              data-tip="AI Tutor"
            >
              <MessageCircle className={`w-4 h-4 ${state.isTutorOpen ? 'text-primary' : ''}`} />
            </button>
          </>
        )}
        
        {/* Home Button */}
        <button
          onClick={() => dispatch({ type: 'SELECT_LANGUAGE', payload: null })}
          className="btn btn-ghost btn-sm btn-circle tooltip"
          data-tip="Bosh sahifa"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
