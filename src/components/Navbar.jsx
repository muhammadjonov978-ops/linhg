import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { languages } from '../data/languages';
import { Home, MessageCircle, Trophy, Coins, Award, LogIn, User, Shield, Briefcase } from 'lucide-react';
import ThemePicker from './ThemePicker';
import GoogleAuthModal, { USER_EVENT } from './GoogleAuthModal';
import GiftEnvelope from './GiftEnvelope';

function loadSavedUser() {
  try {
    const raw = localStorage.getItem('lingohub_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Navbar({ onToggleTutor }) {
  const { state, dispatch } = useApp();
  const [showAuth, setShowAuth] = useState(false);
  const [savedUser, setSavedUser] = useState(loadSavedUser);

  // GoogleAuthModal kirish/chiqish qilganda Navbar'ni ham yangilaydi
  useEffect(() => {
    const refresh = () => setSavedUser(loadSavedUser());
    window.addEventListener(USER_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(USER_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const currentLang = languages.find(l => l.id === state.selectedLanguage);

  return (
    <nav className="navbar bg-base-100/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-base-200">
      <div className="navbar-start">
        <a href="/" onClick={(e) => {
          e.preventDefault();
          if (window.location.hash.startsWith('#/portfolio')) {
            window.location.hash = '#/';
          }
          dispatch({ type: 'SELECT_LANGUAGE', payload: null });
        }} className="btn btn-ghost text-xl gap-2 px-2">
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
          {/* Coins Display */}
          <div className="badge badge-primary gap-1 p-3 tooltip" data-tip="Tanga ball">
            <Coins className="w-4 h-4" />
            <span className="font-bold">{state.coins}</span>
            <span className="text-xs opacity-70 hidden sm:inline">🪙</span>
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
        {/* Ochiladigan konvert — xat */}
        <GiftEnvelope />

        {/* Google sign-in / profile */}
        {savedUser ? (
          <button
            onClick={() => setShowAuth(true)}
            className="btn btn-ghost btn-sm gap-2 tooltip"
            data-tip={savedUser.name || 'Hisob'}
          >
            <span className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-primary/20">
              {savedUser.picture ? (
                <img src={savedUser.picture} alt={savedUser.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-primary" />
              )}
            </span>
            <span className="hidden sm:inline text-xs font-medium">{savedUser.givenName || savedUser.name}</span>
          </button>
        ) : (
          <button
            onClick={() => setShowAuth(true)}
            className="btn btn-ghost btn-sm gap-1.5 tooltip"
            data-tip="Google bilan kirish"
          >
            <LogIn className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline text-xs">Kirish</span>
          </button>
        )}

        {/* Admin Panel Button */}
        <a
          href="#/admin"
          className="btn btn-ghost btn-sm gap-1.5 tooltip"
          data-tip="Admin panel"
        >
          <Shield className="w-4 h-4 text-secondary" />
          <span className="hidden sm:inline text-xs">Admin</span>
        </a>

        {/* Portfolio Button */}
        <a
          href="#/portfolio"
          className="btn btn-ghost btn-sm gap-1.5 tooltip"
          data-tip="Portfolio"
        >
          <Briefcase className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline text-xs">Portfolio</span>
        </a>

        {/* Theme Picker (35 themes) */}
        <ThemePicker />

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
          onClick={() => {
            if (window.location.hash.startsWith('#/portfolio')) {
              window.location.hash = '#/';
            }
            dispatch({ type: 'SELECT_LANGUAGE', payload: null });
          }}
          className="btn btn-ghost btn-sm btn-circle tooltip"
          data-tip="Bosh sahifa"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* Google auth modal */}
      <GoogleAuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </nav>
  );
}
