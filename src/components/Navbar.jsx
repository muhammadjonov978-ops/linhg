import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { languages } from '../data/languages';
import {
  FaHome as Home, FaCommentDots as MessageCircle, FaTrophy as Trophy,
  FaCoins as Coins, FaAward as Award, FaSignInAlt as LogIn, FaUser as User,
  FaShieldAlt as Shield, FaBriefcase as Briefcase, FaStore as Store,
  FaBars as MenuIcon, FaTimes as X,
} from 'react-icons/fa';
import ThemePicker from './ThemePicker';
import GoogleAuthModal, { USER_EVENT } from './GoogleAuthModal';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const goHome = (e) => {
    e.preventDefault();
    if (window.location.hash.startsWith('#/portfolio') || window.location.hash.startsWith('#/shop')) {
      window.location.hash = '#/';
    }
    dispatch({ type: 'SELECT_LANGUAGE', payload: null });
    setMobileMenuOpen(false);
  };

  const mobileNavItems = [
    {
      key: 'auth',
      label: savedUser ? (savedUser.givenName || savedUser.name) : 'Kirish',
      onClick: () => { setShowAuth(true); setMobileMenuOpen(false); },
      icon: savedUser ? <User className="w-4 h-4 text-primary" /> : <LogIn className="w-4 h-4 text-primary" />,
    },
    {
      key: 'admin',
      label: 'Admin',
      href: '#/admin',
      icon: <Shield className="w-4 h-4 text-secondary" />,
    },
    {
      key: 'portfolio',
      label: 'Portfolio',
      href: '#/portfolio',
      icon: <Briefcase className="w-4 h-4 text-primary" />,
    },
    {
      key: 'shop',
      label: 'Magazin',
      href: '#/shop',
      icon: <Store className="w-4 h-4 text-warning" />,
    },
    {
      key: 'home',
      label: 'Bosh sahifa',
      onClick: goHome,
      icon: <Home className="w-4 h-4" />,
    },
    ...(currentLang ? [{
      key: 'tutor',
      label: 'AI Tutor',
      onClick: () => { onToggleTutor(); setMobileMenuOpen(false); },
      icon: <MessageCircle className={`w-4 h-4 ${state.isTutorOpen ? 'text-primary' : ''}`} />,
    }] : []),
  ];

  return (
    <nav className="navbar bg-base-100/85 backdrop-blur-md sticky top-0 z-50 shadow-lg border-b border-primary/15 min-h-0 py-1.5">
      <div className="navbar-start gap-1">
        <a href="/" onClick={goHome} className="btn btn-ghost text-xl gap-2 px-2">
          <img
            src="/logo.png"
            alt="Lingohub"
            className="w-9 h-9 rounded-lg object-cover shadow-sm ring-1 ring-primary/40 gold-glow"
          />
          <span className="font-bold bg-gradient-to-r from-[#f5d27a] via-[#d4af37] to-[#fff3c4] bg-clip-text text-transparent hidden sm:inline font-display">
            Lingohub
          </span>
        </a>
      </div>

      <div className="navbar-center hidden lg:flex gap-2">
        {currentLang && (
          <div className="badge badge-lg gap-2 p-3 border border-primary/25 bg-primary/10">
            <span className="text-lg">{currentLang.flag}</span>
            <span className="font-medium">{currentLang.name}</span>
          </div>
        )}

        <div className="flex items-center gap-3 ml-4">
          {/* Coins Display */}
          <div className="badge badge-primary gap-1 p-3 tooltip border-0" data-tip="Tanga ball">
            <Coins className="w-4 h-4" />
            <span className="font-bold">{state.coins}</span>
          </div>

          {/* Streak Display */}
          {state.streak > 0 && (
            <div className="badge badge-secondary gap-1 p-3 tooltip border-0" data-tip="Kunlik streak">
              <Trophy className="w-4 h-4" />
              <span className="font-bold">{state.streak}</span>
              <span className="text-xs opacity-70 hidden sm:inline">kun</span>
            </div>
          )}

          {/* Achievement badge count */}
          {(state.achievements?.filter(a => a.unlocked && a.justUnlocked)?.length || 0) > 0 && (
            <div className="badge badge-success gap-1 p-3 animate-pulse tooltip border-0" data-tip="Yangi yutuqlar!">
              <Award className="w-4 h-4" />
              <span className="font-bold">{state.achievements.filter(a => a.unlocked && a.justUnlocked).length}</span>
            </div>
          )}
        </div>
      </div>

      <div className="navbar-end gap-1">
        {/* Google sign-in / profile (md+) */}
        {savedUser ? (
          <button
            onClick={() => setShowAuth(true)}
            className="btn btn-ghost btn-sm gap-2 tooltip hidden md:inline-flex"
            data-tip={savedUser.name || 'Hisob'}
          >
            <span className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-primary/20 ring-1 ring-primary/40">
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
            className="btn btn-ghost btn-sm gap-1.5 tooltip hidden md:inline-flex"
            data-tip="Google bilan kirish"
          >
            <LogIn className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline text-xs">Kirish</span>
          </button>
        )}

        {/* Admin Panel Button */}
        <a
          href="#/admin"
          className="btn btn-ghost btn-sm gap-1.5 tooltip hidden md:inline-flex"
          data-tip="Admin panel"
        >
          <Shield className="w-4 h-4 text-secondary" />
          <span className="hidden sm:inline text-xs">Admin</span>
        </a>

        {/* Portfolio Button */}
        <a
          href="#/portfolio"
          className="btn btn-ghost btn-sm gap-1.5 tooltip hidden md:inline-flex"
          data-tip="Portfolio"
        >
          <Briefcase className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline text-xs">Portfolio</span>
        </a>

        {/* Magazin Button */}
        <a
          href="#/shop"
          className="btn btn-ghost btn-sm gap-1.5 tooltip hidden md:inline-flex"
          data-tip="Qahramon magazini"
        >
          <Store className="w-4 h-4 text-warning" />
          <span className="hidden sm:inline text-xs">Magazin</span>
        </a>

        {/* Theme Picker */}
        <ThemePicker />

        {currentLang && (
          <button
            onClick={onToggleTutor}
            className={`btn btn-ghost btn-sm btn-circle tooltip hidden md:inline-flex ${state.isTutorOpen ? 'bg-primary/20' : ''}`}
            data-tip="AI Tutor"
          >
            <MessageCircle className={`w-4 h-4 ${state.isTutorOpen ? 'text-primary' : ''}`} />
          </button>
        )}

        {/* Home Button */}
        <button
          onClick={goHome}
          className="btn btn-ghost btn-sm btn-circle tooltip hidden md:inline-flex"
          data-tip="Bosh sahifa"
        >
          <Home className="w-4 h-4" />
        </button>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileMenuOpen(o => !o)}
          className="btn btn-ghost btn-sm btn-circle md:hidden"
          title="Menyu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-base-100/95 backdrop-blur-md border-b border-primary/15 shadow-2xl p-3 z-50 md:hidden animate-[fadeIn_0.25s_ease-out]">
          <div className="grid grid-cols-2 gap-2">
            {mobileNavItems.map(item => (
              <button
                key={item.key}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  else if (item.href) {
                    window.location.hash = item.href;
                    setMobileMenuOpen(false);
                  }
                }}
                className="btn btn-ghost btn-sm justify-start gap-2 border border-base-300/60 bg-base-200/40"
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Google auth modal */}
      <GoogleAuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </nav>
  );
}
