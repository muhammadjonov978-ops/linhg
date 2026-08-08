import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { languages } from '../data/languages';
import {
  FaHome as Home, FaCommentDots as MessageCircle,
  FaCoins as Coins, FaSignInAlt as LogIn, FaUser as User,
  FaShieldAlt as Shield, FaBriefcase as Briefcase, FaStore as Store,
  FaBars as MenuIcon, FaTimes as X, FaFire as Flame, FaBolt as Bolt,
  FaBell as Bell, FaGift as Gift,
} from 'react-icons/fa';
import ThemePicker from './ThemePicker';
import GoogleAuthModal, { USER_EVENT } from './GoogleAuthModal';
import Flag from './Flag';

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
  const [bellOpen, setBellOpen] = useState(false);
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

  // Qo'ng'iroq (bell): ochilmagan va hali olinmagan yutuqlar bildirishnoma sifatida ko'rsatiladi
  const claimable = (state.achievements || []).filter(a => a.unlocked && !a.claimed && (a.coinReward || a.xpReward));
  const handleClaim = (achievement) => {
    dispatch({
      type: 'CLAIM_ACHIEVEMENT',
      payload: { id: achievement.id, coinReward: achievement.coinReward ?? achievement.xpReward ?? 0 },
    });
  };

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
    <nav className="navbar bg-base-100/70 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-black/20 border-b border-primary/20 min-h-0 py-1.5">
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
          <div className="badge badge-lg gap-2 p-3 border border-primary/25 bg-primary/10 gold-glow">
            <Flag lang={currentLang} size={22} />
            <span className="font-medium">{currentLang.name}</span>
          </div>
        )}

        <div className="flex items-center gap-2 ml-4">
          {/* Streak Display */}
          {state.streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-base-100 border border-base-300 shadow-sm tooltip" data-tip="Kunlik streak">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-bold text-sm text-orange-500">{state.streak}</span>
            </div>
          )}

          {/* Coins Display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-base-100 border border-base-300 shadow-sm tooltip" data-tip="Tanga balansi">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-sm text-amber-500">{state.coins}</span>
          </div>

          {/* Energy Display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-base-100 border border-base-300 shadow-sm tooltip" data-tip="Kunlik energiya">
            <Bolt className="w-4 h-4 text-yellow-500" />
            <span className="font-bold text-sm text-yellow-600">{state.energy ?? 440}</span>
          </div>
        </div>
      </div>

      <div className="navbar-end gap-1">
        {/* Bildirishnoma qo'ng'irog'i */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setBellOpen(o => !o)}
            className={`btn btn-ghost btn-sm btn-circle tooltip ${bellOpen ? 'bg-primary/20 text-primary' : ''}`}
            data-tip="Bildirishnomalar"
          >
            <Bell className="w-4 h-4" />
            {claimable.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {claimable.length}
              </span>
            )}
          </button>

          {bellOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-base-100 rounded-2xl border border-base-300 shadow-2xl z-50 p-3 animate-[fadeIn_0.2s_ease-out]">
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="font-bold text-sm flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-primary" /> Bildirishnomalar
                  </h3>
                  <button onClick={() => setBellOpen(false)} className="btn btn-ghost btn-xs btn-circle">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                {claimable.length === 0 ? (
                  <p className="text-xs opacity-50 text-center py-4">Hozircha yangi bildirishnomalar yo'q ✨</p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto chat-scroll">
                    {claimable.map(a => (
                      <div key={a.id} className="flex items-center gap-2 p-2 rounded-xl bg-base-200/60 border border-base-300/60">
                        <span className="text-xl">{a.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate flex items-center gap-1">
                            <Gift className="w-3 h-3 text-warning shrink-0" /> {a.name}
                          </p>
                          <p className="text-[11px] opacity-50 truncate">+{a.coinReward ?? a.xpReward ?? 0} 🪙 yutuq sovg'asi</p>
                        </div>
                        <button
                          onClick={() => handleClaim(a)}
                          className="btn btn-xs btn-warning gap-1 btn-wave"
                        >
                          <Coins className="w-3 h-3" /> Olib olish
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

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
