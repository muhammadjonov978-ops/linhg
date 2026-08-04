import { useState, useEffect } from 'react';
import { ADMIN_USERS, findAdminUser } from '../data/adminUsers';
import {
  startPresence, setPresenceLocation, subscribePresence,
} from '../utils/presence';
import { HAS_FIREBASE } from '../firebase';
import {
  Shield, KeyRound, User as UserIcon, Eye, EyeOff, LogOut, ArrowLeft,
  Copy, Check, Activity, Users, Radio, Lock, Clock, AlertTriangle,
  Globe, Server, Wifi, WifiOff, Crown, BadgeCheck,
} from 'lucide-react';

const AUTH_KEY = 'lingohub_admin_auth';
const SESSION_KEY = 'lingohub_admin_session';
const LOG_KEY = 'lingohub_admin_log';

const LOCK_MINUTES = 5; // noto'g'ri urinishdan keyin bloklanish vaqti
const LOCK_MS = LOCK_MINUTES * 60 * 1000;

// ---- localStorage helpers ----
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Failed to save:', e);
  }
}


function formatClock(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* fallback */
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="btn btn-ghost btn-xs gap-1 tooltip"
      data-tip={label}
    >
      {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Nusxalandi' : 'Nusxalash'}
    </button>
  );
}

// ================= LOGIN SCREEN =================
function LoginScreen({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(() => readJSON(AUTH_KEY, { failed: 0, lockUntil: 0 }));
  const [now, setNow] = useState(Date.now());

  // Live countdown for lockout
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const lockRemaining = attempts.lockUntil - now;
  const isLocked = lockRemaining > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLocked) return;

    const user = findAdminUser(username, password);
    if (user) {
      // Success → reset failed attempts
      writeJSON(AUTH_KEY, { failed: 0, lockUntil: 0 });
      const session = {
        username: user.username,
        name: user.name,
        role: user.role,
        loginAt: Date.now(),
      };
      writeJSON(SESSION_KEY, session);
      const log = readJSON(LOG_KEY, []);
      log.unshift({ time: Date.now(), username: user.username, ok: true });
      writeJSON(LOG_KEY, log.slice(0, 100));
      onSuccess(session);
    } else {
      // Wrong credentials → lock for 5 minutes
      const failed = attempts.failed + 1;
      const next = { failed, lockUntil: Date.now() + LOCK_MS };
      writeJSON(AUTH_KEY, next);
      setAttempts(next);
      setError('Login yoki parol noto\u2018g\u2018ri! 5 daqiqadan keyin qayta urinib ko\u2018ring.');
      const log = readJSON(LOG_KEY, []);
      log.unshift({ time: Date.now(), username: username || '(bo\u2018sh)', ok: false });
      writeJSON(LOG_KEY, log.slice(0, 100));
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 via-base-100 to-base-200 p-4">
      <div className="w-full max-w-md">
        {/* Logo / header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30 mb-3 animate-[bounceIn_0.6s_ease-out]">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Admin Panel
            </span>
          </h1>
          <p className="text-sm opacity-60 mt-1">Lingohub boshqaruv tizimi</p>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-xl animate-[fadeInUp_0.5s_ease-out]">
          <div className="card-body p-6 md:p-8">
            {isLocked ? (
              /* ---------- LOCKED STATE ---------- */
              <div className="text-center py-4 animate-[fadeIn_0.3s_ease-out]">
                <div className="w-20 h-20 mx-auto rounded-full bg-error/10 flex items-center justify-center mb-4">
                  <Lock className="w-9 h-9 text-error" />
                </div>
                <h2 className="text-lg font-bold text-error mb-1">Hisob bloklandi</h2>
                <p className="text-sm opacity-70 mb-4">
                  Juda ko\u2018p noto\u2018g\u2018ri urinishlar qayd etildi. Qayta urinish:
                </p>
                <div className="font-mono text-4xl font-bold text-error tabular-nums tracking-wider mb-4 animate-pulse">
                  {formatClock(lockRemaining)}
                </div>
                <div className="w-full bg-base-200 rounded-full h-2 mb-6 overflow-hidden">
                  <div
                    className="h-full bg-error rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${Math.max(0, (lockRemaining / LOCK_MS) * 100)}%` }}
                  />
                </div>
                <p className="text-xs opacity-50">
                  {LOCK_MINUTES} daqiqadan keyin yana urinib ko\u2018rishingiz mumkin
                </p>
              </div>
            ) : (
              /* ---------- LOGIN FORM ---------- */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="admin-login" className="label text-xs font-medium opacity-70">Login</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
                    <input
                      id="admin-login"
                      name="login"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Loginni kiriting"
                      className="input input-bordered w-full pl-10 focus:outline-none focus:border-primary transition-colors"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="admin-password" className="label text-xs font-medium opacity-70">Parol</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
                    <input
                      id="admin-password"
                      name="password"
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Parolni kiriting"
                      className="input input-bordered w-full pl-10 pr-10 focus:outline-none focus:border-primary transition-colors"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-error text-sm py-2.5 animate-[fadeIn_0.3s_ease-out]">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-full gap-2 btn-wave">
                  <Shield className="w-4 h-4" />
                  Kirish
                </button>

                {attempts.failed > 0 && (
                  <p className="text-[11px] text-center opacity-50">
                    Noto\u2018g\u2018ri urinishlar: {attempts.failed}
                  </p>
                )}
              </form>
            )}

            <a href="#/" className="btn btn-ghost btn-sm mt-2 gap-2 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" /> Saytga qaytish
            </a>
          </div>
        </div>

        <p className="text-center text-[11px] opacity-40 mt-4">
          Noto\u2018g\u2018ri parol kiritilsa hisob {LOCK_MINUTES} daqiqaga bloklanadi
        </p>
      </div>
    </div>
  );
}

// ================= DASHBOARD =================
function Dashboard({ session, onLogout }) {
  const [presence, setPresence] = useState({ total: 0, site: 0, admin: 0, mode: 'local' });
  const [log] = useState(() => readJSON(LOG_KEY, []));

  // Track this visitor as "admin" while the dashboard is open,
  // then move back to "site" when leaving (presence keeps running).
  useEffect(() => {
    startPresence('admin');
    const unsub = subscribePresence((s) => {
      setPresence(s);
    });
    return () => {
      unsub();
      setPresenceLocation('site');
    };
  }, []);

  const isOwner = session.role === 'owner';
  const totalAccounts = ADMIN_USERS.length;

  const statCards = [
    {
      label: 'Hozir onlayn',
      value: presence.total,
      icon: Radio,
      color: 'success',
      note: presence.mode === 'firebase' ? 'Haqiqiy (Firebase)' : 'Demo rejim',
    },
    {
      label: 'Saytda',
      value: presence.site,
      icon: Globe,
      color: 'primary',
      note: 'sayt tashrifchilari',
    },
    {
      label: 'Admin panelda',
      value: presence.admin,
      icon: Users,
      color: 'secondary',
      note: 'hozir boshqaruvda',
    },
    {
      label: 'Hisoblar soni',
      value: totalAccounts,
      icon: BadgeCheck,
      color: 'warning',
      note: '21 ta admin hisob',
    },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      {/* Top bar */}
      <nav className="navbar bg-base-100/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-base-200">
        <div className="navbar-start">
          <a href="#/" className="btn btn-ghost btn-sm gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Saytga qaytish</span>
          </a>
        </div>
        <div className="navbar-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Admin Panel
            </span>
          </div>
        </div>
        <div className="navbar-end gap-2">
          <div className="badge badge-ghost gap-1.5 p-3 hidden sm:flex">
            {isOwner ? (
              <Crown className="w-3.5 h-3.5 text-warning" />
            ) : (
              <UserIcon className="w-3.5 h-3.5 text-primary" />
            )}
            <span className="text-xs font-bold">{session.name}</span>
            {isOwner && <span className="text-[10px] opacity-50">(egasi)</span>}
          </div>
          <button onClick={onLogout} className="btn btn-error btn-sm gap-2">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Chiqish</span>
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Hero */}
        <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
          <div className="card-body p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Live number */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-success" />
                  </span>
                  <span className="text-xs font-medium opacity-70 uppercase tracking-wider">
                    Hozir onlayn
                  </span>
                </div>
                <div className="flex items-end justify-center md:justify-start gap-3">
                  <span
                    key={presence.total}
                    className="text-6xl md:text-7xl font-extrabold text-success tabular-nums animate-[scaleIn_0.4s_ease-out] gradient-text-live"
                    style={{ backgroundImage: 'linear-gradient(90deg, hsl(var(--su)), hsl(var(--p)), hsl(var(--a)))' }}
                  >
                    {presence.total}
                  </span>
                  <span className="text-xl opacity-50 pb-3">kishi</span>
                </div>
                <p className="text-xs opacity-60 mt-2 flex items-center justify-center md:justify-start gap-1.5">
                  {presence.mode === 'firebase' ? (
                    <>
                      <Wifi className="w-3.5 h-3.5 text-success" />
                      Firebase orqali real vaqt — barcha qurilmalarda ishlaydi
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3.5 h-3.5 text-warning" />
                      Demo rejim (bu brauzer ichida). Firebase sozlang — <code className="badge badge-ghost badge-sm">.env</code>
                    </>
                  )}
                </p>
              </div>

              {/* Mini live breakdown */}
              <div className="grid grid-cols-2 gap-3 w-full md:w-72">
                <div className="bg-success/5 border border-success/20 rounded-xl p-3 text-center">
                  <Globe className="w-4 h-4 text-success mx-auto mb-1" />
                  <p className="text-2xl font-bold text-success tabular-nums">{presence.site}</p>
                  <p className="text-[10px] opacity-60">Saytda</p>
                </div>
                <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-3 text-center">
                  <Shield className="w-4 h-4 text-secondary mx-auto mb-1" />
                  <p className="text-2xl font-bold text-secondary tabular-nums">{presence.admin}</p>
                  <p className="text-[10px] opacity-60">Admin panelda</p>
                </div>
                <div className="col-span-2 bg-base-200 rounded-xl p-3 flex items-center justify-center gap-2 text-xs opacity-70">
                  <Activity className="w-3.5 h-3.5" />
                  Yangilanmoqda: har 20 soniyada
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`card bg-base-100 border border-base-300 shadow-sm stat-card-hover animate-[fadeInUp_0.5s_ease-out]`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="card-body p-5">
                  <div className={`w-10 h-10 rounded-xl bg-${card.color}/10 flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 text-${card.color}`} />
                  </div>
                  <p className="text-2xl font-extrabold tabular-nums">{card.value}</p>
                  <p className="text-xs font-medium opacity-70">{card.label}</p>
                  <p className="text-[10px] opacity-40">{card.note}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Accounts table */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Admin hisoblar</h3>
                  <p className="text-[11px] opacity-50">{totalAccounts} ta foydalanuvchi tizimga kirishi mumkin</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-base-300">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="bg-base-200 text-xs">
                    <th className="w-10">#</th>
                    <th>Foydalanuvchi</th>
                    <th>Ism</th>
                    <th>Rol</th>
                    <th className="text-right">Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {ADMIN_USERS.map((u, i) => (
                    <tr key={u.username} className="hover:bg-base-200/50 transition-colors">
                      <td className="text-xs opacity-50">{i + 1}</td>
                      <td className="font-mono text-xs font-bold">{u.username}</td>
                      <td className="text-xs">{u.name}</td>
                      <td>
                        {u.role === 'owner' ? (
                          <span className="badge badge-warning badge-sm gap-1">
                            <Crown className="w-3 h-3" /> Egas
                          </span>
                        ) : (
                          <span className="badge badge-ghost badge-sm">Admin</span>
                        )}
                      </td>
                      <td className="text-right">
                        <CopyButton text={u.username} label="Loginni nusxalash" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Login log */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-info" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Kirish tarixi</h3>
                <p className="text-[11px] opacity-50">So\u2018nggi urinishlar (oxirgi 100)</p>
              </div>
            </div>

            {log.length === 0 ? (
              <p className="text-sm opacity-40 text-center py-6">Hozircha urinishlar yo\u2018q</p>
            ) : (
              <div className="max-h-72 overflow-y-auto rounded-xl border border-base-300 divide-y divide-base-200">
                {log.slice(0, 30).map((entry, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-xs">
                    <span
                      className={`badge badge-sm gap-1 ${
                        entry.ok ? 'badge-success' : 'badge-error'
                      }`}
                    >
                      {entry.ok ? '✓ Muvaffaqiyatli' : '✗ Xato'}
                    </span>
                    <span className="font-mono font-bold">{entry.username}</span>
                    <span className="opacity-40 ml-auto tabular-nums">
                      {new Date(entry.time).toLocaleString('uz-UZ', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Firebase setup hint */}
        {!HAS_FIREBASE && (
          <div className="alert alert-warning text-sm">
            <Server className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold mb-1">Haqiqiy live hisoblagich uchun Firebase sozlang</p>
              <p className="text-xs opacity-80">
                Hozir demo rejim — faqat shu brauzer ichidagi tablar sanaladi. Firebase proyekt
                oching va <code className="badge badge-ghost badge-sm font-mono">VITE_FIREBASE_*</code>{' '}
                qiymatlarni <code className="badge badge-ghost badge-sm font-mono">.env</code> faylga qo\u2018ying.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ================= MAIN =================
export default function AdminPanel() {
  const [session, setSession] = useState(() => readJSON(SESSION_KEY, null));

  const handleLogout = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* noop */
    }
    setSession(null);
  };

  return session ? (
    <Dashboard session={session} onLogout={handleLogout} />
  ) : (
    <LoginScreen onSuccess={setSession} />
  );
}
