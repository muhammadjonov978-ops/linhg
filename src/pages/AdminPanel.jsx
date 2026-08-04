import { useState, useEffect } from 'react';
import { findAdminUser } from '../data/adminUsers';
import { useSiteConfig, saveConfig, getLangPrice } from '../data/siteConfig';
import { languages } from '../data/languages';
import {
  startPresence, setPresenceLocation, subscribePresence,
} from '../utils/presence';
import {
  Shield, KeyRound, User as UserIcon, Eye, EyeOff, LogOut, ArrowLeft,
  Copy, Check, Activity, Users, Radio, Clock, Crown,
  UserPlus, Trash2, Coins, Type, Save, RotateCcw,
} from 'lucide-react';

const SESSION_KEY = 'lingohub_admin_session';
const LOG_KEY = 'lingohub_admin_log';

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

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
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
    <button onClick={handleCopy} className="btn btn-ghost btn-xs gap-1 tooltip" data-tip={label}>
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = findAdminUser(username, password);
    if (user) {
      const session = { username: user.username, name: user.name, role: user.role, loginAt: Date.now() };
      writeJSON(SESSION_KEY, session);
      const log = readJSON(LOG_KEY, []);
      log.unshift({ time: Date.now(), username: user.username, ok: true });
      writeJSON(LOG_KEY, log.slice(0, 100));
      onSuccess(session);
    } else {
      setError('Login yoki parol noto\u2018g\u2018ri!');
      const log = readJSON(LOG_KEY, []);
      log.unshift({ time: Date.now(), username: username || '(bo\u2018sh)', ok: false });
      writeJSON(LOG_KEY, log.slice(0, 100));
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 via-base-100 to-base-200 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30 mb-3 animate-[bounceIn_0.6s_ease-out]">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Admin Panel</span>
          </h1>
          <p className="text-sm opacity-60 mt-1">Lingohub boshqaruv tizimi</p>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-xl animate-[fadeInUp_0.5s_ease-out]">
          <div className="card-body p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="admin-login" className="label text-xs font-medium opacity-70">Login</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    id="admin-login"
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
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full gap-2 btn-wave">
                <Shield className="w-4 h-4" /> Kirish
              </button>
            </form>

            <a href="#/" className="btn btn-ghost btn-sm mt-4 gap-2 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" /> Saytga qaytish
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= ACCOUNTS TAB =================
function AccountsTab({ config, onSave }) {
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '' });
  const [msg, setMsg] = useState('');

  const addAccount = () => {
    const username = String(newUser.username || '').trim().toLowerCase();
    const password = String(newUser.password || '').trim();
    const name = String(newUser.name || '').trim();
    if (username.length < 2 || password.length < 2) {
      setMsg('Login va parol kamida 2 ta belgidan iborat bo\u2018lishi kerak');
      return;
    }
    if (config.accounts.some((a) => a.username.toLowerCase() === username)) {
      setMsg('Bu login allaqachon mavjud');
      return;
    }
    onSave({
      ...config,
      accounts: [...config.accounts, { username, password, name: name || username, role: 'admin' }],
    });
    setNewUser({ username: '', password: '', name: '' });
    setMsg('✅ Hisob qo\u2018shildi');
    setTimeout(() => setMsg(''), 2500);
  };

  const removeAccount = (username) => {
    const account = config.accounts.find((a) => a.username === username);
    if (account?.role === 'owner') return;
    onSave({ ...config, accounts: config.accounts.filter((a) => a.username !== username) });
  };

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="card bg-base-200/60 border border-base-300">
        <div className="card-body p-4">
          <h3 className="font-bold text-sm flex items-center gap-2 mb-2">
            <UserPlus className="w-4 h-4 text-primary" /> Yangi hisob qo\u2018shish
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              placeholder="Login"
              className="input input-bordered input-sm"
            />
            <input
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Parol"
              className="input input-bordered input-sm"
            />
            <input
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="Ism"
              className="input input-bordered input-sm"
            />
          </div>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={addAccount} className="btn btn-primary btn-sm gap-1.5">
              <UserPlus className="w-3.5 h-3.5" /> Qo\u2018shish
            </button>
            {msg && <span className="text-xs">{msg}</span>}
          </div>
        </div>
      </div>

      {/* Accounts table */}
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
            {config.accounts.map((u, i) => (
              <tr key={u.username} className="hover:bg-base-200/50 transition-colors">
                <td className="text-xs opacity-50">{i + 1}</td>
                <td className="font-mono text-xs font-bold">{u.username}</td>
                <td className="text-xs">{u.name}</td>
                <td>
                  {u.role === 'owner' ? (
                    <span className="badge badge-warning badge-sm gap-1"><Crown className="w-3 h-3" /> Egas</span>
                  ) : (
                    <span className="badge badge-ghost badge-sm">Admin</span>
                  )}
                </td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <CopyButton text={u.username} label="Loginni nusxalash" />
                    {u.role !== 'owner' && (
                      <button
                        onClick={() => removeAccount(u.username)}
                        className="btn btn-ghost btn-xs btn-circle text-error tooltip"
                        data-tip="O\u2018chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ================= PRICES TAB =================
function PricesTab({ config, onSave }) {
  const [prices, setPrices] = useState(() => {
    const map = {};
    languages.forEach((l) => { map[l.id] = getLangPrice(config, l); });
    return map;
  });
  const [msg, setMsg] = useState('');

  const save = () => {
    onSave({ ...config, prices });
    setMsg('✅ Narxlar saqlandi');
    setTimeout(() => setMsg(''), 2500);
  };

  const reset = () => {
    const map = {};
    languages.forEach((l) => { map[l.id] = l.price || 0; });
    setPrices(map);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs opacity-60">Har bir til uchun narxni kiriting (0 — bepul). Saqlangandan keyin saytda darhol qo\u2018llanadi.</p>
        <div className="flex gap-2">
          <button onClick={reset} className="btn btn-ghost btn-xs gap-1.5">
            <RotateCcw className="w-3 h-3" /> Tiklash
          </button>
          <button onClick={save} className="btn btn-primary btn-xs gap-1.5">
            <Save className="w-3.5 h-3.5" /> Saqlash
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {languages.map((l) => (
          <div key={l.id} className="bg-base-200/60 border border-base-300 rounded-xl p-3 flex items-center gap-2">
            <span className="text-2xl">{l.flag}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{l.name}</p>
              <input
                type="number"
                min="0"
                step="1000"
                value={prices[l.id] ?? 0}
                onChange={(e) => setPrices({ ...prices, [l.id]: Math.max(0, Number(e.target.value) || 0) })}
                className="input input-bordered input-xs w-full mt-1"
              />
            </div>
            <Coins className="w-3.5 h-3.5 text-warning shrink-0" />
          </div>
        ))}
      </div>

      {msg && <div className="text-xs font-medium text-success">{msg}</div>}
    </div>
  );
}

// ================= TEXTS TAB =================
function TextsTab({ config, onSave }) {
  const [texts, setTexts] = useState(() => ({ ...config.texts }));
  const [msg, setMsg] = useState('');

  const set = (key) => (e) => setTexts({ ...texts, [key]: e.target.value });

  const save = () => {
    onSave({ ...config, texts });
    setMsg('✅ Matnlar saqlandi');
    setTimeout(() => setMsg(''), 2500);
  };

  const fields = [
    { key: 'heroBadge', label: 'Yuqori yorliq (badge)', hint: 'Misol: Interaktiv til o\u2018rganish' },
    { key: 'heroTitle', label: 'Bosh sarlavha', hint: 'Misol: 27 Tilda Erkin Gaplashing' },
    { key: 'heroSubtitle', label: 'Ostki matn', hint: 'Bosh sahifa ta\u2019rifi' },
    { key: 'featureTitle', label: 'Bo\u2018limlar sarlavhasi', hint: 'Misol: 5 ta Asosiy Bo\u2018lim' },
    { key: 'featureDesc', label: 'Yutuqlar matni', hint: 'Mashqlar va yutuqlar haqida matn' },
    { key: 'footerText', label: 'Sayt pastki matni (footer)', hint: 'Misol: 27 tilda interaktiv...' },
  ];

  return (
    <div className="space-y-3 max-w-2xl">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="label text-xs font-medium opacity-70 py-1">{f.label}</label>
          <input
            value={texts[f.key] ?? ''}
            onChange={set(f.key)}
            placeholder={f.hint}
            className="input input-bordered w-full focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      ))}
      <div className="flex items-center gap-3 pt-1">
        <button onClick={save} className="btn btn-primary btn-sm gap-1.5">
          <Save className="w-3.5 h-3.5" /> Saqlash
        </button>
        {msg && <span className="text-xs text-success font-medium">{msg}</span>}
      </div>
    </div>
  );
}

// ================= DASHBOARD =================
function Dashboard({ session, onLogout }) {
  const config = useSiteConfig();
  const [presence, setPresence] = useState({ total: 0, site: 0, admin: 0, mode: 'local' });
  const [log] = useState(() => readJSON(LOG_KEY, []));
  const [tab, setTab] = useState('hisoblar');

  useEffect(() => {
    startPresence('admin');
    const unsub = subscribePresence((s) => setPresence(s));
    return () => {
      unsub();
      setPresenceLocation('site');
    };
  }, []);

  const isOwner = session.role === 'owner';
  const accounts = config.accounts || [];

  const handleSaveConfig = (next) => saveConfig(next);

  const statCards = [
    { label: 'Hozir onlayn', value: presence.total, icon: Radio, color: 'success', note: 'live — barcha qurilmalarda' },
    { label: 'Saytda', value: presence.site, icon: Users, color: 'primary', note: 'sayt tashrifchilari' },
    { label: 'Admin panelda', value: presence.admin, icon: Users, color: 'secondary', note: 'hozir boshqaruvda' },
    { label: 'Hisoblar soni', value: accounts.length, icon: Users, color: 'warning', note: `${accounts.length} ta hisob` },
  ];

  const tabs = [
    { id: 'hisoblar', label: 'Hisoblar', icon: Users },
    { id: 'tillar', label: 'Til narxlari', icon: Coins },
    { id: 'matnlar', label: 'Sayt matnlari', icon: Type },
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
            <span className="font-bold text-sm bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Admin Panel</span>
          </div>
        </div>
        <div className="navbar-end gap-2">
          <div className="badge badge-ghost gap-1.5 p-3 hidden sm:flex">
            {isOwner ? <Crown className="w-3.5 h-3.5 text-warning" /> : <UserIcon className="w-3.5 h-3.5 text-primary" />}
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
        {/* Hero — live number */}
        <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
          <div className="card-body p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-success" />
                  </span>
                  <span className="text-xs font-medium opacity-70 uppercase tracking-wider">Hozir onlayn</span>
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
                <p className="text-xs opacity-60 mt-2">
                  {presence.mode === 'firebase'
                    ? 'Haqiqiy live son — barcha qurilmalarda birga ko\u2018rinadi'
                    : 'Live son — hozir saytda qancha oyna ochiq'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full md:w-72">
                <div className="bg-success/5 border border-success/20 rounded-xl p-3 text-center">
                  <Users className="w-4 h-4 text-success mx-auto mb-1" />
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
              <div key={card.label} className="card bg-base-100 border border-base-300 shadow-sm stat-card-hover animate-[fadeInUp_0.5s_ease-out]" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="card-body p-5">
                  <div className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-2xl font-extrabold tabular-nums">{card.value}</p>
                  <p className="text-xs font-medium opacity-70">{card.label}</p>
                  <p className="text-[10px] opacity-40">{card.note}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`btn btn-sm gap-1.5 transition-all ${tab === t.id ? 'btn-primary text-white' : 'btn-ghost'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5 md:p-6">
            {tab === 'hisoblar' && (
              <AccountsTab config={config} onSave={handleSaveConfig} />
            )}
            {tab === 'tillar' && (
              <PricesTab config={config} onSave={handleSaveConfig} />
            )}
            {tab === 'matnlar' && (
              <TextsTab config={config} onSave={handleSaveConfig} />
            )}
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
                    <span className={`badge badge-sm gap-1 ${entry.ok ? 'badge-success' : 'badge-error'}`}>
                      {entry.ok ? '✓ Muvaffaqiyatli' : '✗ Xato'}
                    </span>
                    <span className="font-mono font-bold">{entry.username}</span>
                    <span className="opacity-40 ml-auto tabular-nums">
                      {new Date(entry.time).toLocaleString('uz-UZ', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= MAIN =================
export default function AdminPanel() {
  const [session, setSession] = useState(() => readJSON(SESSION_KEY, null));

  const handleLogout = () => {
    try { localStorage.removeItem(SESSION_KEY); } catch { /* noop */ }
    setSession(null);
  };

  return session ? (
    <Dashboard session={session} onLogout={handleLogout} />
  ) : (
    <LoginScreen onSuccess={setSession} />
  );
}
