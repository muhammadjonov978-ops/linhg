import { useState } from 'react';
import { X, LogOut, User, LogIn, CheckCircle, Sparkles } from 'lucide-react';

const USER_STORAGE_KEY = 'lingohub_user';

function loadSavedUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUser(u) {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
  } catch (e) {
    console.warn('Failed to save user:', e);
  }
}

// Oddiy (Google'siz) kirish — faqat ism kiritiladi.
// Profil brauzerda saqlanadi, taraqqiyot bilan birga qoladi.
export default function GoogleAuthModal({ isOpen, onClose }) {
  const [user, setUser] = useState(loadSavedUser);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const signOut = () => {
    setUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear user:', e);
    }
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    const clean = String(name || '').trim();
    if (clean.length < 2) {
      setError('Iltimos, ismingizni kiriting (kamida 2 ta harf)');
      return;
    }
    const profile = {
      sub: `local-${Date.now()}`,
      name: clean,
      givenName: clean,
      picture: '',
    };
    saveUser(profile);
    setUser(profile);
    setError('');
    setSaved(true);
    setName('');
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-base-100 rounded-3xl shadow-2xl max-w-md w-full animate-[fadeIn_0.3s_ease-out] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 btn btn-ghost btn-circle btn-sm z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {user ? (
          /* ---------- LOGGED IN PROFILE ---------- */
          <div className="p-8 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold text-white mb-4 overflow-hidden">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name?.charAt(0).toUpperCase()
              )}
            </div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm opacity-60 mb-1">Xush kelibsiz!</p>
            <div className="badge badge-success badge-sm gap-1 mb-6 mt-2">
              <CheckCircle className="w-3 h-3" /> Tizimga kirdingiz
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={signOut} className="btn btn-error btn-sm gap-2">
                <LogOut className="w-4 h-4" /> Chiqish
              </button>
              <button onClick={onClose} className="btn btn-ghost btn-sm">Yopish</button>
            </div>
          </div>
        ) : (
          /* ---------- SIGN IN FORM (Google'siz) ---------- */
          <div className="p-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">Hisobga kirish</h2>
            <p className="text-sm opacity-60 text-center mb-6">
              Ismingizni yozing — taraqqiyotingiz shu brauzerda saqlanadi
            </p>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  placeholder="Ismingizni kiriting"
                  autoFocus
                  className="input input-bordered w-full pl-10 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {error && (
                <div className="alert alert-error text-sm py-2.5 animate-[fadeIn_0.3s_ease-out]">
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={String(name || '').trim().length < 2}
                className="btn btn-primary w-full gap-2 btn-wave"
              >
                <LogIn className="w-4 h-4" />
                Kirish
              </button>
            </form>

            <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] opacity-50">
              <Sparkles className="w-3 h-3 text-warning" />
              Hech qanday parol kerak emas — shunchaki ism yozing
            </div>
          </div>
        )}

        {/* Muvaffaqiyatli kirish animatsiyasi */}
        {saved && (
          <div className="absolute inset-0 z-20 bg-base-100/90 backdrop-blur-sm flex flex-col items-center justify-center animate-[fadeIn_0.3s_ease-out]">
            <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mb-3">
              <CheckCircle className="w-9 h-9 text-success animate-[scaleIn_0.4s_ease-out]" />
            </div>
            <p className="font-bold text-lg">Muvaffaqiyatli kirdingiz!</p>
            <p className="text-sm opacity-60">Xush kelibsiz, {user?.name} 👋</p>
          </div>
        )}
      </div>
    </div>
  );
}
