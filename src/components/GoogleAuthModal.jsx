import { useState, useEffect } from 'react';
import {
  HAS_FIREBASE, signInWithGoogle, signOutGoogle,
  registerWithEmail, loginWithEmail, sendPasswordReset,
} from '../firebase';
import { FcGoogle } from 'react-icons/fc';
import {
  FaTimes as X, FaSignOutAlt as LogOut, FaUser as User,
  FaSignInAlt as LogIn, FaCheckCircle as CheckCircle, FaMagic as Sparkles,
  FaEnvelope as Envelope, FaLock as Lock, FaUserPlus as UserPlus,
  FaSpinner as Loader2,
} from 'react-icons/fa';

const USER_STORAGE_KEY = 'lingohub_user';

// Navbar kabi boshqa komponentlar ham foydalanuvchi o'zgarishini bilishi uchun
export const USER_EVENT = 'lingohub-user-changed';
function notifyUserChanged() {
  try {
    window.dispatchEvent(new Event(USER_EVENT));
  } catch { /* noop */ }
}

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
    notifyUserChanged();
  } catch (e) {
    console.warn('Failed to save user:', e);
  }
}

function firebaseErrorText(code) {
  const map = {
    'auth/email-already-in-use': 'Bu email allaqachon ro\'yxatdan o\'tgan. Kirish tugmasini bosing.',
    'auth/invalid-email': 'Email manzili noto\'g\'ri.',
    'auth/weak-password': 'Parol juda qisqa — kamida 6 ta belgi.',
    'auth/user-not-found': 'Bunday foydalanuvchi topilmadi. Avval ro\'yxatdan o\'ting.',
    'auth/wrong-password': 'Parol noto\'g\'ri.',
    'auth/invalid-credential': 'Email yoki parol noto\'g\'ri.',
    'auth/too-many-requests': 'Juda ko\'p urinish. Iltimos, birozdan keyin qayta urinib ko\'ring.',
    'auth/network-request-failed': 'Tarmoq xatosi. Internetni tekshiring.',
    'auth/popup-closed-by-user': 'Google oynasi yopildi. Qayta urinib ko\'ring.',
  };
  return map[code] || `Xatolik yuz berdi: ${code || 'noma\'lum'}`;
}

/**
 * Ro'yxatdan o'tish / kirish — faqat Google yoki email+parol orqali.
 * Hech qanday demo (ism bilan kirish) rejimi yo'q.
 */
export default function GoogleAuthModal({ isOpen, onClose }) {
  const [user, setUser] = useState(loadSavedUser);
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Escape tugmasi — modalni yopadi
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const finishLogin = (profile) => {
    saveUser(profile);
    setUser(profile);
    setError('');
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  };

  const signOut = async () => {
    setUser(null);
    try {
      await signOutGoogle();
      localStorage.removeItem(USER_STORAGE_KEY);
      notifyUserChanged();
    } catch (e) {
      console.warn('Failed to clear user:', e);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setBusy(true);
    try {
      const profile = await signInWithGoogle();
      if (!profile) {
        setError("Google ulanishi sozlanmagan. .env faylga Firebase kalitlarini qo'shing yoki email bilan ro'yxatdan o'ting.");
        return;
      }
      finishLogin(profile);
    } catch (e) {
      setError(firebaseErrorText(e?.code || e?.message));
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail || !String(password || '')) {
      setError('Email va parolni kiriting.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Email manzili noto\'g\'ri formatda.');
      return;
    }
    if (mode === 'register' && String(password).length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak.');
      return;
    }
    if (mode === 'register' && String(name || '').trim().length < 2) {
      setError('Ismingizni kiriting (kamida 2 ta harf).');
      return;
    }

    setError('');
    setBusy(true);
    try {
      const profile = mode === 'register'
        ? await registerWithEmail(String(name || '').trim(), cleanEmail, String(password))
        : await loginWithEmail(cleanEmail, String(password));
      if (!profile) {
        setError('Email tizimi sozlanmagan. .env faylga Firebase kalitlarini qo\'shing yoki Google bilan kiring.');
        return;
      }
      finishLogin(profile);
    } catch (e) {
      setError(firebaseErrorText(e?.code));
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async () => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Avval email manzilingizni kiriting.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const ok = await sendPasswordReset(cleanEmail);
      if (!ok) {
        setError('Parolni tiklash sozlanmagan. .env faylga Firebase kalitlarini qo\'shing yoki Google bilan kiring.');
        return;
      }
      setResetSent(true);
    } catch (e) {
      setError(firebaseErrorText(e?.code));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-base-100 rounded-3xl shadow-2xl max-w-md w-full animate-[fadeIn_0.3s_ease-out] overflow-hidden border border-primary/20 gold-glow">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 btn btn-ghost btn-circle btn-sm z-10 modal-close-focus"
          title="Yopish (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {user ? (
          /* ---------- LOGGED IN PROFILE ---------- */
          <div className="p-8 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8860b] flex items-center justify-center text-3xl font-bold text-black mb-4 overflow-hidden shadow-lg gold-glow">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name?.charAt(0).toUpperCase()
              )}
            </div>
            <h2 className="text-xl font-bold font-display">{user.name}</h2>
            <p className="text-sm opacity-60 mb-1">Xush kelibsiz!</p>
            <div className="badge badge-success badge-sm gap-1 mb-6 mt-2">
              <CheckCircle className="w-3 h-3" /> Tizimga kirdingiz
            </div>
            {user.email && (
              <p className="text-xs opacity-50 -mt-4 mb-4">{user.email}</p>
            )}
            <div className="flex gap-2 justify-center">
              <button onClick={signOut} className="btn btn-error btn-sm gap-2">
                <LogOut className="w-4 h-4" /> Chiqish
              </button>
              <button onClick={onClose} className="btn btn-ghost btn-sm">Yopish</button>
            </div>
          </div>
        ) : (
          /* ---------- SIGN IN / REGISTER ---------- */
          <div className="p-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2 font-display">
              {mode === 'register' ? 'Ro\'yxatdan o\'tish' : 'Hisobga kirish'}
            </h2>
            <p className="text-sm opacity-60 text-center mb-6">
              Google yoki email orqali kiring — taraqqiyotingiz saqlanadi
            </p>

            {/* Mode tabs */}
            <div className="tabs tabs-boxed justify-center mb-6 bg-base-200/70">
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className={`tab tab-sm ${mode === 'login' ? 'tab-active' : ''}`}
              >
                <LogIn className="w-3.5 h-3.5 mr-1" /> Kirish
              </button>
              <button
                onClick={() => { setMode('register'); setError(''); }}
                className={`tab tab-sm ${mode === 'register' ? 'tab-active' : ''}`}
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" /> Ro'yxatdan o'tish
              </button>
            </div>

            {/* GOOGLE SIGN-IN (haqiqiy) */}
            <button
              onClick={handleGoogleSignIn}
              disabled={busy}
              className="btn btn-outline w-full gap-3 border-base-300 hover:border-primary hover:bg-primary/10 transition-all mb-4"
            >
              {busy ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <FcGoogle className="w-5 h-5" />
              )}
              Google bilan {mode === 'register' ? 'ro\'yxatdan o\'tish' : 'kirish'}
            </button>

            <div className="flex items-center gap-3 mb-4 opacity-40 text-xs">
              <span className="flex-1 h-px bg-base-300" />
              yoki
              <span className="flex-1 h-px bg-base-300" />
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(''); }}
                    placeholder="Ismingiz"
                    autoFocus
                    className="input input-bordered w-full pl-10 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              )}

              <div className="relative">
                <Envelope className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); setResetSent(false); }}
                  placeholder="Email manzilingiz"
                  autoFocus={mode === 'login'}
                  autoComplete="email"
                  className="input input-bordered w-full pl-10 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder={mode === 'register' ? 'Parol (kamida 6 belgi)' : 'Parolingiz'}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  className="input input-bordered w-full pl-10 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {mode === 'login' && (
                <div className="flex justify-end -mt-1">
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={busy}
                    className="text-[11px] text-primary hover:underline transition-colors"
                  >
                    Parolni unutdingizmi?
                  </button>
                </div>
              )}

              {error && (
                <div className="alert alert-error text-sm py-2.5 animate-[fadeIn_0.3s_ease-out]">
                  <span>{error}</span>
                </div>
              )}

              {resetSent && (
                <div className="alert alert-success text-sm py-2.5 animate-[fadeIn_0.3s_ease-out]">
                  <span>✅ Parolni tiklash havolasi emailingizga yuborildi.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="btn btn-primary w-full gap-2 btn-wave border-0"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  mode === 'register' ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />
                )}
                {busy
                  ? (mode === 'register' ? 'Ro\'yxatdan o\'tkazilmoqda...' : 'Kirilmoqda...')
                  : (mode === 'register' ? 'Ro\'yxatdan o\'tish' : 'Kirish')}
              </button>
            </form>

            <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] opacity-50">
              <Sparkles className="w-3 h-3 text-warning" />
              {HAS_FIREBASE
                ? 'Progress brauzeringizda saqlanadi'
                : "Google/email uchun .env faylga Firebase kalitlari kerak — .env.example ga qarang"}
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
