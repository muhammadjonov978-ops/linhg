import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { GOOGLE_CLIENT_ID, HAS_GOOGLE_AUTH } from '../config';
import { X, LogOut, User, Loader2, Shield, CheckCircle } from 'lucide-react';

const USER_STORAGE_KEY = 'lingohub_user';

function loadSavedUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function decodeJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function GoogleAuthModal({ isOpen, onClose }) {
  const { dispatch } = useApp();
  const [user, setUser] = useState(loadSavedUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const saveUser = (u) => {
    setUser(u);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
    } catch (e) {
      console.warn('Failed to save user:', e);
    }
  };

  const signOut = () => {
    setUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear user:', e);
    }
    // Also revoke GIS session if available
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.disableAutoSelect();
        window.google.accounts.id.revoke(user?.sub || '', () => {});
      } catch (e) { /* noop */ }
    }
  };

  // Load Google Identity Services script once
  useEffect(() => {
    if (!HAS_GOOGLE_AUTH || typeof window === 'undefined') return;
    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => setScriptLoaded(true);
    document.head.appendChild(s);
  }, []);

  const handleCredential = useCallback((response) => {
    const payload = decodeJwt(response?.credential);
    if (!payload) {
      setError("Google javobini o'qib bo'lmadi. Qayta urinib ko'ring.");
      setLoading(false);
      return;
    }
    const profile = {
      sub: payload.sub,
      name: payload.name || 'Foydalanuvchi',
      email: payload.email || '',
      picture: payload.picture || '',
      givenName: payload.given_name || '',
    };
    saveUser(profile);
    setError('');
    setLoading(false);
    onClose();
  }, [onClose]);

  // Render Google button when modal opens
  useEffect(() => {
    if (!isOpen || !HAS_GOOGLE_AUTH || !scriptLoaded) return;
    if (!window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
        auto_select: false,
      });
      const container = document.getElementById('google-signin-button');
      if (container) {
        container.innerHTML = '';
        window.google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          width: 280,
          shape: 'pill',
          text: 'continue_with',
        });
      }
    } catch (e) {
      setError("Google tugmasi ishga tushmadi: " + (e?.message || 'noma\'lum xato'));
    }
  }, [isOpen, scriptLoaded, handleCredential]);

  if (!isOpen) return null;

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
          /* Logged in profile */
          <div className="p-8 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl mb-4 overflow-hidden">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm opacity-60 mb-1">{user.email}</p>
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
          /* Sign in form */
          <div className="p-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">Hisobga kirish</h2>
            <p className="text-sm opacity-60 text-center mb-6">
              Google orqali ro'yxatdan o'ting yoki kiring — taraqqiyotingiz xavfsiz saqlanadi
            </p>

            {HAS_GOOGLE_AUTH ? (
              <div className="flex flex-col items-center gap-3">
                {loading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                <div id="google-signin-button" className="min-h-[40px] flex justify-center" />
                {error && <p className="text-xs text-error">{error}</p>}
                <p className="text-[11px] opacity-50 flex items-center gap-1 mt-2">
                  <Shield className="w-3 h-3 text-success" />
                  Google sizning hisobingizni himoya qiladi
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="alert alert-warning text-sm text-left mb-4">
                  Google kirish hozircha yoqilmagan. Buni yoqish uchun:
                  <ol className="list-decimal ml-4 mt-2 space-y-1 text-xs">
                    <li>Google Cloud Console'da OAuth Client ID yarating</li>
                    <li>Uni <code className="badge badge-ghost">.env</code> faylida <code>VITE_GOOGLE_CLIENT_ID</code> ga qo'ying</li>
                    <li>Saytni qayta yuklang</li>
                  </ol>
                </div>
                <button onClick={onClose} className="btn btn-primary w-full">Yopish</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
