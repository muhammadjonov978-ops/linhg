import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  adminLogin, verifyAdminSession, adminFetchAccounts, adminCreateAccount,
  adminDeleteAccount, adminFetchActivity, UNIVERSAL_USERNAME, ADMIN_SESSION_KEY as SESSION_KEY,
} from '../data/adminUsers';
import { useSiteConfig, saveConfig } from '../data/siteConfig';
import { useI18n } from '../i18n';
import { languages } from '../data/languages';
import Flag from '../components/Flag';
import { subscribeAdminCoins, giveAdminCoins, MAX_LOG, MAX_GIFT } from '../lib/adminCoins';
import {
  startPresence, setPresenceLocation, subscribePresence,
} from '../utils/presence';
import { subscribeVisits, refreshVisits } from '../utils/visits';
import { fetchServerStats } from '../lib/server';
import {
  FaShieldAlt as Shield, FaKey as KeyRound, FaUser as UserIcon, FaEye as Eye,
  FaEyeSlash as EyeOff, FaSignOutAlt as LogOut, FaArrowLeft as ArrowLeft,
  FaCopy as Copy, FaCheck as Check, FaHeartbeat as Activity, FaUsers as Users,
  FaBroadcastTower as Radio, FaClock as Clock, FaCrown as Crown,
  FaUserPlus as UserPlus, FaTrash as Trash2, FaFont as Type,
  FaSave as Save, FaSync as RefreshCw, FaSearch as Search,
  FaUpload as Upload, FaLink as Link2, FaTimes as X, FaChevronRight as ChevronRight,
  FaFileExcel as FileSpreadsheet, FaChartLine as TrendingUp,
  FaMousePointer as MousePointerClick, FaChartBar as BarChart3,
  FaGift as Gift, FaSpinner as Loader2, FaPaperPlane as PaperPlane,
  FaTelegramPlane as TelegramPlane, FaExclamationTriangle as AlertIcon, FaGlobe as Globe,
  FaUserClock as UserClock, FaServer as ServerIcon, FaHistory as HistoryIcon,
  FaTachometerAlt as Gauge, FaBars as MenuIcon,
  FaSms as SmsIcon, FaMobileAlt as MobileAlt,
} from 'react-icons/fa';

const LOG_KEY = 'lingohub_admin_log';
const GSC_KEY = 'lingohub_gsc_data';

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
  const { t } = useI18n();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Login endi SERVER'da tekshiriladi (api/admin/login) — parol brauzer kodida yo'q.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await adminLogin(username, password);
    setBusy(false);
    if (res.ok) {
      const session = { ...res.user, token: res.token, loginAt: Date.now(), warning: res.warning };
      writeJSON(SESSION_KEY, session);
      const log = readJSON(LOG_KEY, []);
      log.unshift({ time: Date.now(), username: res.user.username, ok: true });
      writeJSON(LOG_KEY, log.slice(0, 100));
      onSuccess(session);
    } else {
      setError(
        res.code === 'not_configured'
          ? "Admin panel server'da sozlanmagan. Vercel sozlamalariga ADMIN_PASSWORD ni qo'shing (README'ga qarang)."
          : (res.error || 'Login yoki parol noto\u2018g\u2018ri!')
      );
      const log = readJSON(LOG_KEY, []);
      log.unshift({ time: Date.now(), username: username || '(bo\u2018sh)', ok: false });
      writeJSON(LOG_KEY, log.slice(0, 100));
      setPassword('');
    }
  };

  return (
    <div data-theme="dark" className="admin-pro min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dekorativ fon */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute top-1/3 right-10 w-40 h-40 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-[fadeInUp_0.5s_ease-out]">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-3 animate-[bounceIn_0.6s_ease-out]">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">{t('admin.title')}</h1>
          <p className="text-sm text-white/50 mt-1">{t('admin.subtitle')}</p>
        </div>

        <div className="admin-pro-card p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#3b82f6]/[0.06] blur-2xl pointer-events-none" />
          <form onSubmit={handleSubmit} className="space-y-4 relative">
            <div>
              <label htmlFor="admin-login" className="label text-xs font-medium text-white/60">{t('admin.login')}</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="admin-login"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('admin.loginPlaceholder')}
                  className="input input-bordered w-full pl-10 bg-white/[0.03] border-white/10 focus:outline-none focus:border-[#3b82f6] transition-colors"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="label text-xs font-medium text-white/60">{t('admin.password')}</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="admin-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('admin.passwordPlaceholder')}
                  className="input input-bordered w-full pl-10 pr-10 bg-white/[0.03] border-white/10 focus:outline-none focus:border-[#3b82f6] transition-colors"
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

            <button type="submit" disabled={busy} className="btn btn-primary w-full gap-2 btn-wave border-0 bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:brightness-105 disabled:opacity-60">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {busy ? t('admin.checking') : t('admin.signIn')}
            </button>
          </form>

          {/* Xavfsizlik belgilari */}
          <div className="flex flex-wrap justify-center gap-2 mt-5 relative">
            {['🔒', '🛡️', '⚡'].map((e, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-[10px] text-white/40 bg-white/[0.03] border border-white/10 rounded-full px-2.5 py-1">
                {e} Server</span>
            ))}
          </div>

          <a href="#/" className="btn btn-ghost btn-sm mt-3 gap-2 text-xs text-white/60 w-full">
            <ArrowLeft className="w-3.5 h-3.5" /> {t('admin.backToSite')}
          </a>
        </div>
      </div>
    </div>
  );
}

// ================= ACCOUNTS TAB =================
// Yaratilgan hisoblar ENDI HAQIQIY ishlaydi — server'da saqlanadi (Redis /
// in-memory), darhol login qilish mumkin. Parol faqat server'da turadi.
function AccountsTab({ config, onSave, session }) {
  const { t } = useI18n();
  const token = session?.token || '';
  const isOwner = session?.role === 'owner';
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [serverAccounts, setServerAccounts] = useState(null); // null = serverdan yuklanmagan
  const [storeMode, setStoreMode] = useState('');

  // Serverdan HAQIQIY hisoblarni yuklaymiz (fallback: localStorage config)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await adminFetchAccounts(token);
      if (cancelled) return;
      if (res.ok) {
        setServerAccounts(res.accounts || []);
        setStoreMode(res.storeMode || '');
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ko'rsatiladigan ro'yxat: server yuklangan bo'lsa u, aks holda config
  const accounts = serverAccounts ?? config.accounts ?? [];

  // Boshqa tablar (CoinsTab) sinxron qolishi uchun config keshi yangilanadi
  const refreshConfigCache = (list) => {
    const safe = (list || [])
      .filter((a) => a && typeof a.username === 'string')
      .map((a) => ({ username: a.username, name: a.name || a.username, role: a.role || 'admin' }));
    onSave({ ...config, accounts: safe });
  };

  const addAccount = async () => {
    const username = String(newUser.username || '').trim().toLowerCase();
    const password = String(newUser.password || '');
    const name = String(newUser.name || '').trim();
    if (username.length < 2) { setMsg(t('admin.errMinLogin')); return; }
    if (password.length < 4) { setMsg(t('admin.errMinPass')); return; }
    if (accounts.some((a) => a.username?.toLowerCase() === username)) { setMsg(t('admin.errExists')); return; }
    setBusy(true);
    setMsg('');
    const res = await adminCreateAccount(token, { username, password, name });
    setBusy(false);
    if (res.ok) {
      setServerAccounts(res.accounts || []);
      if (res.storeMode) setStoreMode(res.storeMode);
      refreshConfigCache(res.accounts);
      setNewUser({ username: '', password: '', name: '' });
      setMsg(t('admin.added'));
    } else {
      setMsg(`❌ ${res.error || 'Xato yuz berdi'}`);
    }
    setTimeout(() => setMsg(''), 3500);
  };

  const removeAccount = async (username) => {
    const account = accounts.find((a) => a.username === username);
    if (account?.role === 'owner' || account?.source === 'env') return;
    setBusy(true);
    setMsg('');
    const res = await adminDeleteAccount(token, username);
    setBusy(false);
    if (res.ok) {
      setServerAccounts(res.accounts || []);
      if (res.storeMode) setStoreMode(res.storeMode);
      refreshConfigCache(res.accounts);
      setMsg(t('admin.removed'));
    } else {
      setMsg(`❌ ${res.error || 'Xato yuz berdi'}`);
    }
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Saqlash rejimi ko'rsatkichi */}
      {storeMode && (
        <div className={`rounded-xl px-4 py-2.5 text-[11px] flex flex-wrap items-center gap-2 border ${
          storeMode === 'redis'
            ? 'bg-[#16a34a]/10 border-[#16a34a]/40 text-[#4ade80]'
            : 'bg-[#2563eb]/10 border-[#2563eb]/40 text-[#7dd3fc]'
        }`}>
          <ServerIcon className="w-3.5 h-3.5 shrink-0" />
          {storeMode === 'redis' ? t('admin.storeRedis') : t('admin.storeMemory')}
        </div>
      )}

      {/* Add form — faqat egasi uchun */}
      {isOwner && (
        <div className="rounded-xl bg-gradient-to-br from-[#3b82f6]/[0.08] to-transparent border border-white/10 p-4">
          <h3 className="font-bold text-sm flex items-center gap-2 mb-2 text-white">
            <UserPlus className="w-4 h-4 text-[#3b82f6]" /> {t('admin.accountsTitle')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              placeholder={t('admin.usernamePlaceholder')}
              className="input input-bordered input-sm bg-white/[0.03] border-white/10"
            />
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder={t('admin.password')}
              className="input input-bordered input-sm bg-white/[0.03] border-white/10"
              autoComplete="new-password"
            />
            <input
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder={t('admin.namePlaceholder')}
              className="input input-bordered input-sm bg-white/[0.03] border-white/10"
            />
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <button
              onClick={addAccount}
              disabled={busy}
              className="btn btn-primary btn-sm gap-1.5 border-0 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              {t('admin.addAccount')}
            </button>
            {msg && <span className="text-xs text-white/70">{msg}</span>}
          </div>
          <p className="text-[11px] text-white/40 leading-relaxed mt-2">
            {t('admin.realAccountsNote')}
          </p>
        </div>
      )}

      {/* Accounts table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="table table-sm w-full">
          <thead>
            <tr className="bg-white/[0.04] text-xs text-white/60">
              <th className="w-10">#</th>
              <th>{t('admin.username')}</th>
              <th>{t('admin.name')}</th>
              <th>{t('admin.role')}</th>
              <th className="text-right">{t('admin.action')}</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((u, i) => (
              <tr key={u.username} className="hover:bg-white/[0.03] transition-colors">
                <td className="text-xs text-white/40">{i + 1}</td>
                <td className="font-mono text-xs font-bold text-white">{u.username}</td>
                <td className="text-xs text-white/70">
                  {u.name}
                  {u.source === 'env' && (
                    <span className="ml-1.5 text-[9px] uppercase tracking-wide text-white/25">({t('admin.envAccount')})</span>
                  )}
                </td>
                <td>
                  {u.role === 'owner' ? (
                    <span className="badge badge-warning badge-sm gap-1 border-0"><Crown className="w-3 h-3" /> {t('admin.owner')}</span>
                  ) : (
                    <span className="badge badge-ghost badge-sm bg-white/[0.06] border-white/10 text-white/70">{t('admin.adminRole')}</span>
                  )}
                </td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <CopyButton text={u.username} label={t('admin.copyLogin')} />
                    {u.role !== 'owner' && u.source !== 'env' && isOwner && (
                      <button
                        onClick={() => removeAccount(u.username)}
                        disabled={busy}
                        className="btn btn-ghost btn-xs btn-circle text-error tooltip disabled:opacity-40"
                        data-tip={t('admin.delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-sm text-white/30 py-6">—</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!isOwner && (
        <p className="text-[11px] text-white/40">🔒 {t('admin.onlyOwner')}</p>
      )}
    </div>
  );
}

// ================= LANGUAGES TAB =================
// Barcha tillar BEPUL — narxlar olib tashlangan. Bu tab saytda mavjud tillar
// haqida umumiy ma'lumotni ko'rsatadi.
function LanguagesTab() {
  const { state } = useApp();

  // Har bir til uchun taraqqiyot
  const langStats = languages.map((l) => {
    const keys = Object.keys(state.progress).filter((k) =>
      k.startsWith(`${l.id}-lesson-`) && state.progress[k]?.completed
    );
    return { lang: l, completed: keys.length };
  });

  const totalCompleted = langStats.reduce((s, x) => s + x.completed, 0);
  const activeLearners = languages.reduce((s, l) => s + (l.totalLearners || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/25 p-4">
          <p className="text-2xl font-extrabold text-white tabular-nums">{languages.length}</p>
          <p className="text-[10px] text-white/40 mt-1">Jami tillar</p>
        </div>
        <div className="rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/25 p-4">
          <p className="text-2xl font-extrabold text-white tabular-nums">{totalCompleted}</p>
          <p className="text-[10px] text-white/40 mt-1">Bajarilgan darslar</p>
        </div>
        <div className="rounded-xl bg-[#60a5fa]/10 border border-[#60a5fa]/25 p-4">
          <p className="text-2xl font-extrabold text-white tabular-nums">{(activeLearners / 1000).toFixed(0)}K+</p>
          <p className="text-[10px] text-white/40 mt-1">O'quvchilar</p>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
          <p className="text-2xl font-extrabold text-white tabular-nums">100%</p>
          <p className="text-[10px] text-white/40 mt-1">Bepul — hammasi ochiq</p>
        </div>
      </div>

      {/* Languages grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {langStats.map(({ lang, completed }) => (
          <div
            key={lang.id}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-3 hover:border-[#3b82f6]/40 hover:bg-white/[0.04] transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              <Flag lang={lang} size={24} />
              <div className="min-w-0">
                <p className="text-xs font-bold truncate text-white">{lang.name}</p>
                <p className="text-[10px] text-white/40 truncate">{(lang.totalLearners || 0).toLocaleString('uz-UZ')} o'quvchi</p>
              </div>
            </div>
            <div className="mt-2 h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((completed / 100) * 100))}%` }}
              />
            </div>
            <p className="text-[10px] text-white/35 mt-1.5">{completed}/100 dars</p>
          </div>
        ))}
      </div>
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
    { key: 'heroTitle', label: 'Bosh sarlavha', hint: 'Misol: 130+ Tilda Erkin Gaplashing' },
    { key: 'heroSubtitle', label: 'Ostki matn', hint: 'Bosh sahifa ta\u2019rifi' },
    { key: 'featureTitle', label: 'Bo\u2018limlar sarlavhasi', hint: 'Misol: 5 ta Asosiy Bo\u2018lim' },
    { key: 'featureDesc', label: 'Yutuqlar matni', hint: 'Mashqlar va yutuqlar haqida matn' },
    { key: 'footerText', label: 'Sayt pastki matni (footer)', hint: 'Misol: 130+ tilda interaktiv...' },
  ];

  return (
    <div className="space-y-3 max-w-2xl">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="label text-xs font-medium text-white/60 py-1">{f.label}</label>
          <input
            value={texts[f.key] ?? ''}
            onChange={set(f.key)}
            placeholder={f.hint}
            className="input input-bordered w-full bg-white/[0.03] border-white/10 focus:outline-none focus:border-[#3b82f6] transition-colors"
          />
        </div>
      ))}
      <div className="flex items-center gap-3 pt-1">
        <button onClick={save} className="btn btn-primary btn-sm gap-1.5 border-0 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white">
          <Save className="w-3.5 h-3.5" /> Saqlash
        </button>
        {msg && <span className="text-xs text-success font-medium">{msg}</span>}
      </div>
    </div>
  );
}

// ================= TELEGRAM TAB (bot holati + test xabar) =================
function TelegramTab() {
  const [info, setInfo] = useState(null);
  const [testText, setTestText] = useState('Salom! 👋 Bu Lingohub admin panelidan yuborilgan test xabar ✅');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    fetch('/api/telegram/info')
      .then((r) => r.json())
      .then((d) => setInfo(d))
      .catch(() => setInfo({ ok: false, configured: false, error: 'Serverga ulanishmadi' }));
  };
  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const sendTest = async () => {
    setBusy(true);
    setMsg('');
    try {
      // Admin sessiya tokenini yuboramiz — faqat adminlar xabar yubora oladi
      const session = readJSON(SESSION_KEY, null);
      const res = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
        body: JSON.stringify({ text: testText }),
      });
      const data = await res.json().catch(() => null);
      setMsg(
        data?.ok
          ? '✅ Xabar yuborildi — Telegram botni tekshiring!'
          : `❌ ${data?.error || 'Xato yuz berdi'}`
      );
    } catch {
      setMsg('❌ Serverga ulanishmadi');
    } finally {
      setBusy(false);
    }
  };

  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/telegram/webhook` : '';

  return (
    <div className="space-y-4">
      {/* Status card */}
      <div className="rounded-xl bg-gradient-to-br from-[#38bdf8]/15 to-[#0ea5e9]/[0.05] border border-[#38bdf8]/30 p-4 sm:p-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#38bdf8]/10 blur-2xl pointer-events-none" />
        <div className="flex flex-wrap items-center gap-3 relative">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#38bdf8] to-[#0ea5e9] flex items-center justify-center shadow-lg shadow-[#38bdf8]/30 shrink-0">
            <TelegramPlane className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              Telegram Bot
              {info?.configured ? (
                <span className="badge badge-success badge-xs gap-1 border-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" /> Faol
                </span>
              ) : (
                <span className="badge badge-error badge-xs gap-1 border-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Sozlanmagan
                </span>
              )}
            </h3>
            <p className="text-[11px] text-white/50 mt-0.5">
              {info?.username
                ? `@${info.username} — bot tayyor, xabarlarni qabul qilmoqda`
                : (info?.error || 'Holat tekshirilmoqda...')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 relative">
          <div className="rounded-lg bg-black/25 border border-white/10 px-3 py-2.5">
            <p className="text-[10px] text-white/40">Webhook</p>
            <p className="text-xs font-bold text-white truncate">
              {info?.webhookUrl ? '✅ O\u2018rnatilgan' : (info?.configured === false ? '—' : '⚠️ O\u2018rnatilmagan')}
            </p>
          </div>
          <div className="rounded-lg bg-black/25 border border-white/10 px-3 py-2.5">
            <p className="text-[10px] text-white/40">Egasining chat ID</p>
            <p className="text-xs font-bold text-white">{info?.hasOwnerChat ? '✅ Bor' : '⚠️ Yo\u2018q'}</p>
          </div>
          <div className="rounded-lg bg-black/25 border border-white/10 px-3 py-2.5">
            <p className="text-[10px] text-white/40">Kutilayotgan xabarlar</p>
            <p className="text-xs font-bold text-white">{info?.pendingCount ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Test message */}
      <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4">
        <h3 className="font-bold text-sm flex items-center gap-2 mb-2 text-white">
          <PaperPlane className="w-4 h-4 text-[#38bdf8]" /> Test xabar yuborish
        </h3>
        <p className="text-[11px] text-white/40 mb-3 leading-relaxed">
          Botga <b className="text-[#38bdf8]">/start</b> yuborgan barcha chatlarga (va egasiga) xabar boradi.
          Yangi to\u2018lovlar bo\u2018lganda bot avtomatik xabar yuboradi. 💰
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="input input-bordered input-sm flex-1 min-w-[220px] bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus:border-[#38bdf8] transition-colors"
          />
          <button
            onClick={sendTest}
            disabled={busy}
            className="btn btn-primary btn-sm gap-1.5 border-0 bg-gradient-to-r from-[#38bdf8] to-[#0ea5e9] text-white hover:brightness-110 disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PaperPlane className="w-3.5 h-3.5" />}
            {busy ? 'Yuborilmoqda...' : 'Yuborish'}
          </button>
        </div>
        {msg && <div className="text-xs font-medium mt-2 animate-[fadeIn_0.3s_ease-out]">{msg}</div>}
      </div>

      {/* Webhook setup guide */}
      <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4">
        <h3 className="font-bold text-sm flex items-center gap-2 mb-2 text-white">
          <Link2 className="w-4 h-4 text-[#a78bfa]" /> Webhook sozlash
        </h3>
        <p className="text-[11px] text-white/40 mb-3 leading-relaxed">
          Bot buyruqlari ishlashi uchun webhook o\u2018rnatilgan bo\u2018lishi kerak. Mahalliy
          kompyuterda bitta buyruq yetarli:
        </p>
        <div className="rounded-lg bg-black/40 border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <span className="text-[10px] font-mono text-white/40">terminal</span>
            <CopyButton text="node scripts/set-telegram-webhook.mjs" label="Buyruqni nusxalash" />
          </div>
          <pre className="px-3 py-2.5 text-[11px] font-mono text-white/70 overflow-x-auto whitespace-pre-wrap">node scripts/set-telegram-webhook.mjs {webhookUrl || ''}</pre>
        </div>
        <p className="text-[11px] text-white/40 mt-2.5 leading-relaxed">
          Vercel'da ishlayotgan bo\u2018lsa — <b className="text-white/70">TELEGRAM_BOT_TOKEN</b> va ixtiyoriy{' '}
          <b className="text-white/70">TELEGRAM_CHAT_ID</b> env o\u2018zgaruvchilarini qo\u2018shing, so\u2018ng yuqoridagi
          skriptni ishga tushiring. Botga <b className="text-[#38bdf8]">/start</b> yuborish orqali chat ID avtomatik eslab qolinadi.
        </p>
      </div>
    </div>
  );
}

// ================= SMS ESLATMA (Eskiz.uz — dars o'tkazib yuborilganda) =================
function SmsTab() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [health, setHealth] = useState(null);

  // Eskiz sozlanganmi? — /api/health dan bilamiz (har 30s yangilanadi)
  useEffect(() => {
    const load = () => {
      fetch('/api/health')
        .then((r) => r.json())
        .then((d) => setHealth(d?.services || null))
        .catch(() => setHealth(null));
    };
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const send = async () => {
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          message: message.trim() || "Assalomu alaykum! 👋 Lingohub'da dars qilmadingiz. Bugun kamida 1 ta dars bajaring! 🔥 Sayt: lingohub.uz",
        }),
      });
      const data = await res.json().catch(() => null);
      setMsg(
        data?.ok
          ? '✅ SMS yuborildi! Telefoningizni tekshiring.'
          : `❌ ${data?.error || 'Xato yuz berdi'}`
      );
    } catch {
      setMsg('❌ Serverga ulanishmadi');
    } finally {
      setBusy(false);
    }
  };

  const smsOn = health?.sms === true;

  return (
    <div className="space-y-4">
      {/* Status card */}
      <div className="rounded-xl bg-gradient-to-br from-[#34d399]/15 to-[#10b981]/[0.05] border border-[#34d399]/30 p-4 sm:p-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#34d399]/10 blur-2xl pointer-events-none" />
        <div className="flex flex-wrap items-center gap-3 relative">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#34d399] to-[#10b981] flex items-center justify-center shadow-lg shadow-[#34d399]/30 shrink-0">
            <SmsIcon className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              SMS eslatma (Eskiz.uz)
              {smsOn ? (
                <span className="badge badge-success badge-xs gap-1 border-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" /> Faol
                </span>
              ) : (
                <span className="badge badge-error badge-xs gap-1 border-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Sozlanmagan
                </span>
              )}
            </h3>
            <p className="text-[11px] text-white/50 mt-0.5">
              Foydalanuvchi 24 soat dars qilmasa — saytda raqam so'raladi va shu raqamga SMS boradi
            </p>
          </div>
        </div>

        {!smsOn && (
          <div className="rounded-lg bg-black/25 border border-white/10 px-3 py-2.5 mt-4 relative">
            <p className="text-[11px] text-white/60 leading-relaxed">
              ⚠️ <b className="text-white">Eskiz.uz sozlanmagan.</b> Vercel → Settings → Environment Variables ga qo'shing:
              <span className="font-mono text-[#4ade80]"> ESKIZ_EMAIL</span> (Eskiz login),
              <span className="font-mono text-[#4ade80]"> ESKIZ_PASSWORD</span> (Eskiz parol).
              Hisob: <b className="text-white/80">eskiz.uz</b> — bepul ro'yxatdan o'tish mumkin. README'ga qarang.
            </p>
          </div>
        )}
      </div>

      {/* Test SMS formasi */}
      <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4">
        <h3 className="font-bold text-sm flex items-center gap-2 mb-2 text-white">
          <MobileAlt className="w-4 h-4 text-[#34d399]" /> SMS yuborish (test)
        </h3>
        <p className="text-[11px] text-white/40 mb-3 leading-relaxed">
          Istalgan raqamga eslatma SMS yuboring — masalan o'z raqamingizga test qiling.
          Har raqamga kuniga 3 ta, har qurilmadan 10 ta SMS limiti bor (spam himoyasi).
        </p>
        <div className="space-y-2.5">
          <div className="relative">
            <MobileAlt className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              className="input input-bordered input-sm w-full pl-9 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus:border-[#34d399] transition-colors"
            />
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Xabar matni (bo'sh qoldirsangiz — standart eslatma yuboriladi)"
            rows={3}
            className="textarea textarea-bordered textarea-sm w-full bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus:border-[#34d399] transition-colors resize-none"
          />
          <button
            onClick={send}
            disabled={busy || !phone.trim()}
            className="btn btn-primary btn-sm gap-1.5 border-0 bg-gradient-to-r from-[#34d399] to-[#10b981] text-white hover:brightness-110 disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <SmsIcon className="w-3.5 h-3.5" />}
            {busy ? 'Yuborilmoqda...' : 'SMS yuborish'}
          </button>
        </div>
        {msg && <div className="text-xs font-medium mt-2 animate-[fadeIn_0.3s_ease-out]">{msg}</div>}
      </div>
    </div>
  );
}

// ================= SERVER STATISTIKA TAB (o'yinlashtirish — Redis) =================
function GamificationTab({ session }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetchServerStats(session?.token || '');
    if (res?.ok) {
      setStats(res);
      setError('');
    } else if (res?.ok === false) {
      setError(res.error || "Server statistika o'qib bo'lmadi");
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const cards = stats ? [
    { label: 'Bugungi darslar', value: stats.lessonsToday, icon: '📚', color: '#3b82f6' },
    { label: 'Kechagi darslar', value: stats.lessonsYesterday, icon: '📖', color: '#60a5fa' },
    { label: 'Bugungi tashriflar', value: stats.visitsToday, icon: '👥', color: '#34d399' },
    { label: 'Jami foydalanuvchilar', value: stats.users, icon: '🧑‍🎓', color: '#fbbf24' },
  ] : [];

  return (
    <div className="space-y-4">
      {/* Status card */}
      <div className="rounded-xl bg-gradient-to-br from-[#a78bfa]/15 to-[#7c3aed]/[0.05] border border-[#a78bfa]/30 p-4 sm:p-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#a78bfa]/10 blur-2xl pointer-events-none" />
        <div className="flex flex-wrap items-center gap-3 relative">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-[#a78bfa]/30 shrink-0">
            <Gauge className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              Server statistika (o'yinlashtirish)
              {stats?.mode === 'redis' ? (
                <span className="badge badge-success badge-xs gap-1 border-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" /> Redis — jonli
                </span>
              ) : stats ? (
                <span className="badge badge-warning badge-xs gap-1 border-0">Demo rejim</span>
              ) : (
                <span className="badge badge-ghost badge-xs border-0">Yuklanmoqda...</span>
              )}
            </h3>
            <p className="text-[11px] text-white/50 mt-0.5">
              Darslar, tashriflar va foydalanuvchilar — serverda to'planadi (Redislarda)
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-black/25 border border-white/10 px-3 py-2.5 mt-4 relative">
            <p className="text-[11px] text-white/60 leading-relaxed">⚠️ {error}</p>
          </div>
        )}
      </div>

      {/* Asosiy ko'rsatkichlar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl bg-white/[0.02] border border-white/10 p-4 relative overflow-hidden group hover:border-white/20 transition-colors">
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-[0.07] group-hover:opacity-15 transition-opacity" style={{ background: c.color }} />
            <span className="text-xl">{c.icon}</span>
            <p className="text-2xl font-extrabold text-white tabular-nums mt-1" style={{ color: c.color }}>
              {loading ? '...' : Number(c.value || 0).toLocaleString('uz-UZ')}
            </p>
            <p className="text-[10px] text-white/40 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Ommabop tillar + faol soatlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Tillar */}
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-[#34d399]" />
            <h4 className="text-xs font-bold text-white">Bugun ommabop tillar</h4>
          </div>
          {!stats || stats.topLangs?.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-6">Hali ma'lumot yo'q</p>
          ) : (
            <div className="divide-y divide-white/5">
              {stats.topLangs.map((l, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-xs">
                  <span className="font-bold text-white/40 tabular-nums w-5">{i + 1}</span>
                  <span className="flex-1 font-semibold text-white/80">{l.lang}</span>
                  <span className="font-extrabold text-[#34d399] tabular-nums">{l.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Soatlar */}
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#a78bfa]" />
            <h4 className="text-xs font-bold text-white">Eng faol soatlar (bugun)</h4>
          </div>
          {!stats || stats.topHours?.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-6">Hali ma'lumot yo'q</p>
          ) : (
            <div className="divide-y divide-white/5">
              {stats.topHours.map((h, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-xs">
                  <span className="font-bold text-white/40 tabular-nums w-5">{i + 1}</span>
                  <span className="flex-1 font-semibold text-white/80">{h.hour}:00</span>
                  <span className="font-extrabold text-[#a78bfa] tabular-nums">{h.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] text-white/35 leading-relaxed">
        💡 Ma'lumotlar serverda to'planadi: har bir dars tugaganda, saytga tashrif
        kelganda va til tanlanganda. Redis sozlanmagan bo'lsa — demo rejim (bitta instansiya).
      </p>
    </div>
  );
}

// ================= COINS TAB (adminlar bir-biriga 100 000 gacha bepul coin beradi) =================
function CoinsTab({ config, session }) {
  const { dispatch } = useApp();
  const [data, setData] = useState({ balances: {}, log: [], mode: 'local' });
  const [target, setTarget] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => subscribeAdminCoins((d) => setData(d)), []);

  // Hozir kirgan admin — o'ziga coin berish uchun
  const SELF = session?.username || UNIVERSAL_USERNAME;

  // Adminlar ro'yxati — universal egasi + config'da qo'shilgan hisoblar.
  // Eski 'shox' hisobi dublikat ko'rinmasligi uchun filtrlanadi.
  const LEGACY_OWNER = 'shox';
  const admins = [
    { username: UNIVERSAL_USERNAME, name: 'Shox', role: 'owner' },
    ...(config.accounts || []).filter((a) => a && typeof a.username === 'string' && a.username !== UNIVERSAL_USERNAME && a.username !== LEGACY_OWNER),
  ];
  // Hozir kirgan admin ro'yxatda bo'lmasa — qo'shamiz (o'ziga berishi uchun)
  if (!admins.some((a) => a.username === SELF)) {
    admins.push({ username: SELF, name: session?.name || 'Siz', role: 'admin' });
  }
  const adminRows = admins.map((a) => ({ ...a, balance: data.balances?.[a.username] ?? 0 }));

  const totalCoins = adminRows.reduce((s, a) => s + a.balance, 0);
  const isFirebase = data.mode === 'firebase';

  const handleGive = async (username) => {
    const amt = Math.floor(Number(amount));
    if (!Number.isFinite(amt) || amt <= 0) {
      setMsg('❌ Miqdor noto\u2018g\u2018ri — musbat butun son kiriting');
      return;
    }
    setBusy(true);
    setMsg('');
    const res = await giveAdminCoins(session?.username || 'admin', username, amt);
    setBusy(false);
    if (res.ok) {
      // Tanga haqiqiy balansga ham qo'shiladi — navbar/magazinda darhol
      // ko'rinadi (admin-hamyon + asosiy balans ikkalasi yangilanadi).
      // Diqqat: Firebase/Redis sozlanmasa bu faqat shu brauzer uchun.
      dispatch({ type: 'ADD_COINS', payload: amt });
      setMsg(`✅ ${username} ga +${amt.toLocaleString('uz-UZ')} tanga berildi`);
      setAmount('');
    } else {
      setMsg(`❌ ${res.error}`);
    }
    setTimeout(() => setMsg(''), 3000);
  };

  // O'zimga tez coin berish (100 000 gacha)
  const handleSelfGive = async () => {
    const amt = Math.floor(Number(amount));
    if (!Number.isFinite(amt) || amt <= 0) {
      setMsg('❌ Miqdor noto\u2018g\u2018ri — musbat butun son kiriting');
      return;
    }
    if (amt > MAX_GIFT) {
      setMsg(`❌ Maksimal ${MAX_GIFT.toLocaleString('uz-UZ')} tanga — 100 000 limit`);
      return;
    }
    setBusy(true);
    setMsg('');
    const res = await giveAdminCoins(SELF, SELF, amt);
    setBusy(false);
    if (res.ok) {
      // Tanga haqiqiy foydalanuvchi balansiga qo'shiladi — navbar va
      // magazinda darhol ko'rinadi (admin-hamyon + asosiy balans).
      dispatch({ type: 'ADD_COINS', payload: amt });
      const newBalance = Number.isFinite(Number(res.balance)) ? Number(res.balance) : null;
      setMsg(
        `✅ Sizga +${amt.toLocaleString('uz-UZ')} tanga berildi` +
        (newBalance !== null ? ` — balans: ${newBalance.toLocaleString('uz-UZ')} 🪙` : '')
      );
      setAmount('');
    } else {
      setMsg(`❌ ${res.error}`);
    }
    setTimeout(() => setMsg(''), 3500);
  };

  const fmtTime = (t) => new Date(t).toLocaleString('uz-UZ', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="space-y-4">
      {/* Rejim ko'rsatkichi */}
      <div className={`rounded-xl px-4 py-3 text-xs flex flex-wrap items-center gap-2 border ${isFirebase ? 'bg-[#16a34a]/10 border-[#16a34a]/40 text-[#4ade80]' : 'bg-[#2563eb]/10 border-[#2563eb]/40 text-[#7dd3fc]'}`}>
        {isFirebase ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]" />
            </span>
            <b>Realtime — Firebase</b>
            <span className="opacity-70">Coin balanslari barcha qurilmalarda saqlanadi va jonli yangilanadi</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-[#7dd3fc]" />
            <b>Demo rejim — shu brauzer</b>
            <span className="opacity-70">Firebase sozlanmagan. Coinlar faqat shu brauzerda saqlanadi. To\u2018liq ishlash uchun .env faylga VITE_FIREBASE_* kalitlarini kiriting.</span>
          </>
        )}
      </div>

      {/* ⚡ O'zimga tez coin berish (100 000 gacha) */}
      <div className="rounded-xl bg-gradient-to-br from-[#3b82f6]/20 to-[#2563eb]/[0.07] border border-[#3b82f6]/40 p-4 sm:p-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#3b82f6]/10 blur-2xl pointer-events-none" />
        <div className="flex flex-wrap items-center gap-2 mb-3 relative">
          <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center shadow-lg shadow-[#3b82f6]/30 shrink-0">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-bold text-sm text-white">O\u2018zimga coin berish</h3>
          <span className="badge badge-warning badge-sm gap-1 border-0 text-[10px]">
            <Gift className="w-3 h-3" /> 100 000 gacha
          </span>
          <span className="text-[10px] text-white/40 ml-auto hidden md:block">
            Hozirgi balans: <b className="text-[#3b82f6] tabular-nums">{(data.balances?.[SELF] ?? 0).toLocaleString('uz-UZ')} 🪙</b>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 relative">
          <div className="flex flex-wrap gap-1.5">
            {[1000, 10000, 50000, MAX_GIFT].map((n) => (
              <button
                key={n}
                onClick={() => { setTarget(''); setAmount(String(n)); }}
                className={`btn btn-xs border tabular-nums transition-colors ${
                  amount === String(n)
                    ? 'bg-[#3b82f6] border-[#3b82f6] text-white font-bold'
                    : 'bg-white/[0.04] border-white/15 text-white/70 hover:border-[#3b82f6]/60 hover:text-[#3b82f6]'
                }`}
              >
                +{n.toLocaleString('uz-UZ')}
              </button>
            ))}
          </div>
          <input
            type="number"
            min="1"
            max={MAX_GIFT}
            step="1"
            placeholder="Miqdor"
            value={amount}
            onChange={(e) => { setTarget(''); setAmount(e.target.value); }}
            className="input input-bordered input-sm w-36 bg-black/30 border-white/15 text-white placeholder:text-white/30 focus:border-[#3b82f6] transition-colors tabular-nums"
          />
          <button
            onClick={handleSelfGive}
            disabled={busy}
            className="btn btn-primary btn-sm gap-1.5 border-0 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white hover:brightness-105 shadow-lg shadow-[#3b82f6]/20 disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Gift className="w-3.5 h-3.5" />}
            {busy ? 'Berilmoqda...' : 'O\u2018zimga berish'}
          </button>
        </div>
        <p className="text-[10px] text-white/35 mt-3 relative">
          💡 Adminlar bir-biriga tekinga, bitta berishda ko\u2018pi bilan <b className="text-[#3b82f6]">100 000 tanga</b> bera oladi.
        </p>
      </div>

      {/* Jami balans */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/25 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/15 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-[#3b82f6]" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-white tabular-nums">{totalCoins.toLocaleString('uz-UZ')}</p>
            <p className="text-[10px] text-white/40">Barcha adminlar jami tangasi</p>
          </div>
        </div>
        <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-[#7dd3fc]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">100 000 gacha</p>
            <p className="text-[10px] text-white/40">Bitta berishda maksimal 100 000 tanga — tekinga</p>
          </div>
        </div>
        <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#60a5fa]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{adminRows.length} ta admin</p>
            <p className="text-[10px] text-white/40">Faqat adminlar o\u2018rtasida</p>
          </div>
        </div>
      </div>

      {/* Adminlar balansi + berish formasi */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="table table-sm w-full">
          <thead>
            <tr className="bg-white/[0.04] text-xs text-white/60">
              <th>Admin</th>
              <th>Rol</th>
              <th className="text-right">Balans (tanga)</th>
              <th className="text-right">Bepul berish</th>
            </tr>
          </thead>
          <tbody>
            {adminRows.map((a) => (
              <tr key={a.username} className="hover:bg-white/[0.03] transition-colors">
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-sm font-bold text-[#3b82f6]">
                      {String(a.name || a.username || '?').charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                        {a.username}
                        {a.username === SELF && (
                          <span className="badge badge-primary badge-xs gap-0.5 border-0 bg-[#3b82f6] text-white font-bold">
                            <UserIcon className="w-2 h-2" /> Siz
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-white/40 truncate">{a.name}</p>
                    </div>
                  </div>
                </td>
                <td>
                  {a.role === 'owner' ? (
                    <span className="badge badge-warning badge-sm gap-1 border-0"><Crown className="w-3 h-3" /> Egas</span>
                  ) : (
                    <span className="badge badge-ghost badge-sm bg-white/[0.06] border-white/10 text-white/70">Admin</span>
                  )}
                </td>
                <td className="text-right">
                  <span className="font-extrabold text-[#3b82f6] tabular-nums">
                    {a.balance.toLocaleString('uz-UZ')}
                  </span>
                  <span className="text-[10px] text-white/30 ml-1">🪙</span>
                </td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setTarget(a.username); setAmount(''); }}
                      className="btn btn-ghost btn-xs text-[10px] text-white/50 hover:text-[#3b82f6]"
                    >
                      Tanlash
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={MAX_GIFT}
                      step="1"
                      placeholder="Miqdor"
                      value={target === a.username ? amount : ''}
                      onChange={(e) => { setTarget(a.username); setAmount(e.target.value); }}
                      className="input input-bordered input-xs w-28 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30"
                    />
                    <button
                      onClick={() => handleGive(a.username)}
                      disabled={busy || target !== a.username}
                      className="btn btn-primary btn-xs gap-1.5 border-0 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white disabled:opacity-40"
                    >
                      {busy && target === a.username ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Gift className="w-3 h-3" />
                      )}
                      Berish
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {msg && <div className="text-xs font-medium text-success animate-[fadeIn_0.3s_ease-out]">{msg}</div>}

      {/* Berish tarixi */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
          <h4 className="text-xs font-bold text-white">So\u2018nggi berishlar</h4>
          <span className="text-[10px] text-white/35 ml-auto">oxirgi {MAX_LOG} ta</span>
        </div>
        {data.log.length === 0 ? (
          <p className="text-sm text-white/30 text-center py-6">Hozircha coin berilmagan</p>
        ) : (
          <div className="max-h-56 overflow-y-auto divide-y divide-white/5 chat-scroll">
            {data.log.slice(0, 20).map((entry, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-xs">
                <span className="w-7 h-7 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center shrink-0">
                  <Gift className="w-3 h-3 text-[#3b82f6]" />
                </span>
                <span className="font-mono font-bold text-white">{entry.from}</span>
                <span className="text-white/30">→</span>
                <span className="font-mono font-bold text-white">{entry.to}</span>
                <span className="font-extrabold text-[#3b82f6] tabular-nums">+{Number(entry.amount || 0).toLocaleString('uz-UZ')} 🪙</span>
                <span className="text-white/30 ml-auto tabular-nums">{fmtTime(entry.time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ================= GOOGLE SEARCH CONSOLE =================
// Search Console Performance export CSV ni parse qiladi.
function parseGSC(text) {
  const lines = text.trim().split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error("Faylda ma'lumot yo'q");

  const header = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const col = {
    dimension: header.findIndex((h) => h.includes('query') || h.includes('page')),
    date: header.findIndex((h) => h.includes('date')),
    clicks: header.findIndex((h) => h === 'clicks'),
    impressions: header.findIndex((h) => h === 'impressions'),
    position: header.findIndex((h) => h.includes('position')),
  };
  if (col.dimension < 0 || col.clicks < 0 || col.impressions < 0) {
    throw new Error('CSV formati tanilmadi. Search Console → Performance → Eksport fayli bo\u2018lishi kerak.');
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    const dim = cells[col.dimension];
    if (!dim || dim.toLowerCase() === 'total') continue;
    const clicks = Number(cells[col.clicks]);
    const impressions = Number(cells[col.impressions]);
    if (!Number.isFinite(clicks) || !Number.isFinite(impressions)) continue;
    rows.push({
      dimension: dim,
      date: col.date >= 0 ? cells[col.date] : null,
      clicks: clicks || 0,
      impressions: impressions || 0,
      position: col.position >= 0 ? (parseFloat(cells[col.position]) || 0) : 0,
    });
  }
  if (!rows.length) throw new Error("Ma'lumot qatorlari topilmadi");

  // Har bir so'rov/sahifa bo'yicha yig'indilar
  const byDim = new Map();
  let totClicks = 0;
  let totImpressions = 0;
  let posImpSum = 0;
  rows.forEach((r) => {
    totClicks += r.clicks;
    totImpressions += r.impressions;
    posImpSum += r.position * r.impressions;
    const cur = byDim.get(r.dimension) || { dimension: r.dimension, clicks: 0, impressions: 0, posImp: 0 };
    cur.clicks += r.clicks;
    cur.impressions += r.impressions;
    cur.posImp += r.position * r.impressions;
    byDim.set(r.dimension, cur);
  });

  const dimensions = [...byDim.values()]
    .map((d) => ({
      ...d,
      ctr: d.impressions ? d.clicks / d.impressions : 0,
      position: d.impressions ? d.posImp / d.impressions : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks);

  const dates = rows.map((r) => r.date).filter(Boolean);
  dates.sort();
  return {
    totalClicks: totClicks,
    totalImpressions: totImpressions,
    avgCtr: totImpressions ? totClicks / totImpressions : 0,
    avgPosition: totImpressions ? posImpSum / totImpressions : 0,
    dimensions: dimensions.slice(0, 20),
    dateFrom: dates[0] || null,
    dateTo: dates[dates.length - 1] || null,
  };
}

const GSC_WORKER_SNIPPET = `// Cloudflare Worker — Google Search Console proxy
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const site = url.searchParams.get('site') || 'sc-domain:lingohub.uz';
    const days = Number(url.searchParams.get('days') || 28);

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const fmt = (d) => d.toISOString().slice(0, 10);

    const res = await fetch(
      'https://searchconsole.googleapis.com/webmasters/v3/sites/' +
        encodeURIComponent(site) +
        '/searchAnalytics/query?key=' + env.GSC_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: fmt(start),
          endDate: fmt(end),
          dimensions: ['query'],
          rowLimit: 25,
        }),
      }
    );
    const json = await res.json();

    return new Response(JSON.stringify(json), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};`;

function ApiGuideModal({ onClose }) {
  const steps = [
    { title: 'Cloudflare Worker yarating', body: 'dash.cloudflare.com → Workers & Pages → Create → Create Worker. (Bepul loyiha kifoya.)' },
    { title: 'Kodni joylang', body: 'Quyidagi kodni Worker ichidagi kod maydoniga to\u2018liq joylang va Deploy tugmasini bosing.' },
    { title: 'API kalit qo\u2018shing', body: 'Google Cloud Console → APIs & Services → Search Console API → Credentials → API key yarating. Worker → Settings → Variables ga GSC_API_KEY nomi bilan joylang.' },
    { title: 'Saytni ulang', body: 'Loyihada .env faylga VITE_GSC_WORKER_URL=https://sizning-worker.workers.dev qo\u2018shing. Panel keyingi ochilishda ma\u2019lumotlarni avtomatik tortadi.' },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="admin-card w-full max-w-2xl max-h-[88vh] overflow-y-auto shadow-2xl animate-[fadeInUp_0.3s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/5">
          <h3 className="font-bold text-sm flex items-center gap-2 text-white">
            <Link2 className="w-4 h-4 text-[#a78bfa]" /> API · avto-sinxron — qo\u2018llanma
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-xs btn-circle text-white/60">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[#a78bfa]/15 border border-[#a78bfa]/30 text-[#a78bfa] text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-xs font-semibold text-white">{s.title}</p>
                  <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="rounded-xl bg-black/40 border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
              <span className="text-[10px] font-mono text-white/40">worker.js</span>
              <CopyButton text={GSC_WORKER_SNIPPET} label="Kodni nusxalash" />
            </div>
            <pre className="p-4 text-[11px] leading-relaxed text-white/70 overflow-x-auto font-mono whitespace-pre-wrap">
              {GSC_WORKER_SNIPPET}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function GSCResults({ data, onRemove }) {
  const fmtNum = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));
  const summary = [
    { icon: MousePointerClick, label: 'Jami kliklar', value: fmtNum(data.totalClicks), color: '#3b82f6' },
    { icon: BarChart3, label: 'Ko\u2018rsatuvlar', value: fmtNum(data.totalImpressions), color: '#4ade80' },
    { icon: TrendingUp, label: 'O\u2018rtacha CTR', value: `${(data.avgCtr * 100).toFixed(1)}%`, color: '#60a5fa' },
    { icon: Search, label: 'O\u2018rtacha pozitsiya', value: data.avgPosition.toFixed(1), color: '#c084fc' },
  ];

  return (
    <div className="border-t border-white/5 px-5 md:px-6 py-5 space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-sm font-bold text-white">Import natijasi</h4>
        {data.dateFrom && (
          <span className="text-[10px] text-white/40">
            {data.dateFrom} — {data.dateTo}
          </span>
        )}
        <button onClick={onRemove} className="ml-auto text-[11px] text-white/40 hover:text-error transition-colors inline-flex items-center gap-1">
          <Trash2 className="w-3 h-3" /> O\u2018chirish
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summary.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl bg-white/[0.02] border border-white/10 p-3">
              <Icon className="w-4 h-4 mb-2" style={{ color: s.color }} />
              <p className="text-xl font-extrabold text-white tabular-nums">{s.value}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="table table-xs w-full">
          <thead>
            <tr className="bg-white/[0.04] text-[10px] uppercase tracking-wide text-white/50">
              <th>So\u2018rov / Sahifa</th>
              <th className="text-right">Kliklar</th>
              <th className="text-right">Ko\u2018rsatuvlar</th>
              <th className="text-right">CTR</th>
              <th className="text-right">Pozitsiya</th>
            </tr>
          </thead>
          <tbody>
            {data.dimensions.map((d) => (
              <tr key={d.dimension} className="hover:bg-white/[0.03] transition-colors">
                <td className="max-w-[16rem] truncate text-white/80 text-xs">{d.dimension}</td>
                <td className="text-right text-white tabular-nums text-xs">{d.clicks}</td>
                <td className="text-right text-white/70 tabular-nums text-xs">{d.impressions}</td>
                <td className="text-right text-white/70 tabular-nums text-xs">{(d.ctr * 100).toFixed(1)}%</td>
                <td className="text-right text-white/70 tabular-nums text-xs">{d.position.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SearchConsoleSection() {
  const fileRef = useRef(null);
  const [data, setData] = useState(() => readJSON(GSC_KEY, null));
  const [error, setError] = useState('');
  const [apiOpen, setApiOpen] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseGSC(String(reader.result || ''));
        setData(parsed);
        writeJSON(GSC_KEY, parsed);
        setError('');
      } catch (e) {
        setError(e.message);
      }
    };
    reader.readAsText(file);
  };

  const openPicker = () => fileRef.current?.click();

  return (
    <div className="admin-card overflow-hidden">
      {/* Section header */}
      <div className="px-5 md:px-6 py-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
          <Search className="w-4 h-4 text-[#3b82f6]" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-sm text-white">Google Search (Search Console)</h3>
          <p className="text-[11px] text-white/40">Haqiqiy Google qidiruv statistikasi — kliklar, ko\u2018rsatuvlar, CTR, pozitsiya</p>
        </div>
        {data && (
          <button
            onClick={() => { setData(null); writeJSON(GSC_KEY, null); }}
            className="ml-auto text-[11px] text-white/40 hover:text-error transition-colors inline-flex items-center gap-1 shrink-0"
          >
            <Trash2 className="w-3 h-3" /> O\u2018chirish
          </button>
        )}
      </div>

      <div className="p-6 md:p-8 text-center">
        <button
          onClick={openPicker}
          className="admin-gsc-btn w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 hover:scale-105 active:scale-95 transition-transform"
          title="CSV import qilish"
        >
          <Search className="w-7 h-7 text-[#3b82f6]" />
        </button>

        <h2 className="text-lg font-bold text-white">Google Search ma'lumotlarini ulang</h2>
        <p className="text-xs text-white/50 max-w-2xl mx-auto mt-2 leading-relaxed">
          Bu bo\u2018lim Search Console'dagi haqiqiy Google qidiruv statistikasini ko\u2018rsatadi — kliklar, ko\u2018rsatuvlar, CTR, pozitsiya, so\u2018rovlar va sahifalar. Ikkita usul bor:
        </p>

        <div className="grid md:grid-cols-2 gap-4 mt-6 max-w-3xl mx-auto text-left">
          {/* CSV import */}
          <div className="admin-card-hover rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4 text-white/70" />
              </div>
              <h4 className="font-bold text-sm text-white">CSV import</h4>
            </div>
            <p className="text-[11px] text-white/50 mt-3 leading-relaxed">
              Search Console → Performance → Eksport tugmasini bosing va CSV'ni shu yerga joylang. Darhol ishlaydi, hech qanday sozlash kerak emas.
            </p>
            <button
              onClick={openPicker}
              className="mt-3 text-xs font-semibold text-[#3b82f6] inline-flex items-center gap-1 hover:gap-2 transition-all group"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Darhol ishlaydi
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* API auto-sync */}
          <div className="admin-card-hover rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                <Link2 className="w-4 h-4 text-[#a78bfa]" />
              </div>
              <h4 className="font-bold text-sm text-white">API · avto-sinxron</h4>
            </div>
            <p className="text-[11px] text-white/50 mt-3 leading-relaxed">
              Google Search Console API orqali ma\u2019lumotlar avtomatik yangilanadi. Cloudflare Worker proxy o\u2018rnatish kerak (qo\u2018llanma beriladi).
            </p>
            <button
              onClick={() => setApiOpen(true)}
              className="mt-3 text-xs font-semibold text-[#a78bfa] inline-flex items-center gap-1 hover:gap-2 transition-all group"
            >
              Avtomatik yangilanadi
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }}
        />
      </div>

      {error && (
        <div className="px-6 pb-5">
          <div className="alert alert-error text-xs py-2.5">
            <span>{error}</span>
          </div>
        </div>
      )}

      {data && <GSCResults data={data} onRemove={() => { setData(null); writeJSON(GSC_KEY, null); }} />}

      {apiOpen && <ApiGuideModal onClose={() => setApiOpen(false)} />}
    </div>
  );
}

// ================= TIZIM HOLATI (backend sozlamalari) =================
// /api/health orqali Redis, Payme, Click va admin login holatini ko'rsatadi.
function ServiceStatus() {
  const [health, setHealth] = useState(null);

  const load = () => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => { if (d?.ok) setHealth(d.services); })
      .catch(() => { /* api mahalliy rejimda yo'q — indikator ko'rsatilmaydi */ });
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  if (!health) return null;

  const items = [
    { key: 'redis', label: "To'lov bazasi (Redis)", ok: health.redis, hint: 'UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN' },
    { key: 'payme', label: 'Payme', ok: health.payme, hint: 'PAYME_MERCHANT_ID + PAYME_KEY' },
    { key: 'click', label: 'Click', ok: health.click, hint: 'CLICK_MERCHANT_ID + CLICK_SERVICE_ID + CLICK_SECRET_KEY' },
    { key: 'adminAuth', label: 'Admin login', ok: health.adminAuth, hint: 'ADMIN_USERNAME + ADMIN_PASSWORD' },
    { key: 'telegram', label: 'Telegram bot', ok: health.telegram, hint: 'TELEGRAM_BOT_TOKEN' },
  ];

  return (
    <div className="admin-card px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
      <span className="font-semibold text-white inline-flex items-center gap-1.5">
        <Activity className="w-3.5 h-3.5 text-[#3b82f6]" /> Tizim holati:
      </span>
      {items.map((s) => (
        <span
          key={s.key}
          title={s.hint}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 border cursor-help transition-colors ${
            s.ok
              ? 'bg-[#16a34a]/10 border-[#16a34a]/40 text-[#4ade80]'
              : 'bg-red-500/10 border-red-500/40 text-red-300'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-[#4ade80]' : 'bg-red-400'}`} />
          {s.label}: {s.ok ? '✅' : '❌'}
        </span>
      ))}
    </div>
  );
}

// ================= JONLI FAOLIYAT (kim kirganini jonli ko'rsatish) =================
// Serverdan /api/admin/activity orqali har 15 soniyada o'qiladi:
//  - bugungi kirishlar soni, jami kirishlar, hozir onlayn adminlar
//  - so'nggi urinishlar ro'yxati (kim, qachon, muvaffaqiyatlimi, IP)
// Server bo'lmasa — shu brauzerdagi localStorage log fallback sifatida.
function ActivitySection({ session, presenceAdmin }) {
  const { t } = useI18n();
  const token = session?.token || '';
  const [activity, setActivity] = useState(null); // { entries, total, today, mode }
  const [localLog] = useState(() => readJSON(LOG_KEY, []));

  const load = useCallback(async () => {
    const data = await adminFetchActivity(token);
    if (data) setActivity(data);
  }, [token]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000); // jonli — har 15 soniyada
    return () => clearInterval(timer);
  }, [load]);

  const isServer = Boolean(activity);
  const entries = activity?.entries?.length ? activity.entries : (localLog.length ? localLog : []);
  const today = isServer ? activity.today : null;
  const total = isServer ? activity.total : null;
  const mode = activity?.mode || '';

  const fmtTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleString('uz-UZ', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };
  const fmtAgo = (ts) => {
    const diff = Math.max(0, Date.now() - Number(ts));
    const s = Math.floor(diff / 1000);
    if (s < 60) return t('admin.secondsAgo', { n: s });
    const m = Math.floor(s / 60);
    if (m < 60) return t('admin.minutesAgo', { n: m });
    return t('admin.hoursAgo', { n: Math.floor(m / 60) });
  };

  const cards = [
    { icon: UserClock, label: t('admin.todayLogins'), value: isServer ? today : (localLog.filter((e) => e.ok && new Date(e.time).toDateString() === new Date().toDateString()).length), color: '#4ade80' },
    { icon: HistoryIcon, label: t('admin.totalLogins'), value: isServer ? total : localLog.length, color: '#60a5fa' },
    { icon: Users, label: t('admin.onlineAdmins'), value: presenceAdmin, color: '#3b82f6' },
  ];

  return (
    <div className="admin-card p-5 md:p-6 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#38bdf8]/[0.06] blur-3xl pointer-events-none" />
      {/* Sarlavha */}
      <div className="flex flex-wrap items-center gap-3 mb-4 relative">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#38bdf8]/20 to-[#0ea5e9]/[0.06] border border-[#38bdf8]/30 flex items-center justify-center">
          <UserClock className="w-5 h-5 text-[#38bdf8]" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            {t('admin.activityTitle')}
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold bg-[#16a34a]/15 border border-[#16a34a]/40 text-[#4ade80] rounded-full px-2 py-0.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#4ade80]" />
              </span>
              LIVE
            </span>
          </h3>
          <p className="text-[11px] text-white/40 mt-0.5">{t('admin.activityDesc')}</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] text-white/35">
          <ServerIcon className="w-3 h-3" />
          {mode === 'redis' ? 'Redis' : (isServer ? 'Server' : 'Local')}
        </span>
      </div>

      {/* Karta raqamlar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-xl bg-white/[0.02] border border-white/10 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0" style={{ boxShadow: `0 0 14px ${c.color}1a` }}>
                <Icon className="w-4 h-4" style={{ color: c.color }} />
              </div>
              <div className="min-w-0">
                <StatValue value={c.value} />
                <p className="text-[11px] text-white/60 mt-0.5 truncate">{c.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* So'nggi urinishlar */}
      <div className="mt-4 relative">
        <div className="flex items-center gap-2 mb-2">
          <HistoryIcon className="w-3.5 h-3.5 text-[#38bdf8]" />
          <h4 className="text-xs font-bold text-white">{t('admin.recentAttempts')}</h4>
          <span className="text-[10px] text-white/35 ml-auto">
            {isServer ? `${t('admin.loginHistory')} · server` : `${t('admin.loginHistory')} · local`}
          </span>
        </div>
        {entries.length === 0 ? (
          <p className="text-sm text-white/30 text-center py-6">{t('admin.activityEmpty')}</p>
        ) : (
          <div className="max-h-72 overflow-y-auto rounded-xl border border-white/10 divide-y divide-white/5 chat-scroll">
            {entries.slice(0, 30).map((entry, i) => (
              <div key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-xs">
                <span className={`badge badge-sm gap-1 ${entry.ok ? 'badge-success' : 'badge-error'}`}>
                  {entry.ok ? t('admin.success') : t('admin.fail')}
                </span>
                <span className="font-mono font-bold text-white">{entry.username}</span>
                {entry.ip && (
                  <span className="text-[10px] text-white/30 font-mono" title={t('admin.ip')}>
                    {entry.ip}
                  </span>
                )}
                <span className="text-white/30 ml-auto tabular-nums text-[11px]">
                  {fmtTime(entry.time)}
                  <span className="ml-2 text-white/20">({fmtAgo(entry.time)})</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ================= DASHBOARD =================
function StatValue({ value }) {
  // key o'zgarganda span qayta mount bo'ladi va stat-pop animatsiyasi o'ynaydi
  return (
    <span key={value} className="text-3xl font-extrabold text-white tabular-nums stat-pop">
      {value}
    </span>
  );
}

function Dashboard({ session, onLogout }) {
  const { t } = useI18n();
  const config = useSiteConfig();
  const [presence, setPresence] = useState({ total: 0, site: 0, admin: 0, mode: 'local' });
  const [visits, setVisits] = useState({ total: 0, today: 0, last7d: 0, unique: 0, mode: 'local' });
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    startPresence('admin');
    const unsubP = subscribePresence((s) => setPresence(s));
    const unsubV = subscribeVisits((v) => setVisits(v));
    // "Live 30s" — statistikani har 30 soniyada qayta o'qish
    const timer = setInterval(() => refreshVisits(), 30000);
    return () => {
      unsubP();
      unsubV();
      clearInterval(timer);
      setPresenceLocation('site');
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshVisits();
    } finally {
      setTimeout(() => setRefreshing(false), 450);
    }
  };

  const isOwner = session.role === 'owner';
  const liveMode = presence.mode === 'firebase' || visits.mode === 'firebase';

  const statCards = [
    { label: t('admin.totalVisits'), value: visits.total, icon: Eye, note: t('admin.noteAllTime'), color: '#818cf8' },
    { label: t('admin.today'), value: visits.today, icon: Activity, note: t('admin.noteToday'), color: '#34d399' },
    { label: t('admin.last7d'), value: visits.last7d, icon: Clock, note: t('admin.noteLast7'), color: '#38bdf8' },
    { label: t('admin.uniqueVisits'), value: visits.unique, icon: Users, note: t('admin.noteUnique'), color: '#c084fc' },
    { label: t('admin.languageCount'), value: languages.length, icon: Globe, note: t('admin.notePlatform'), color: '#fb7185' },
  ];

  const navItems = [
    { id: 'overview', label: t('admin.nav.overview'), icon: Gauge },
    { id: 'hisoblar', label: t('admin.tab.accounts'), icon: Users },
    { id: 'tillar', label: t('admin.tab.languages'), icon: Globe },
    { id: 'tanga', label: t('admin.tab.coins'), icon: Gift },
    { id: 'matnlar', label: t('admin.tab.texts'), icon: Type },
    { id: 'telegram', label: t('admin.tab.telegram'), icon: PaperPlane },
    { id: 'sms', label: 'SMS eslatma', icon: SmsIcon },
    { id: 'statistika', label: 'Server statistika', icon: Gauge },
    { id: 'aktivlik', label: t('admin.activityTitle'), icon: UserClock },
    { id: 'seo', label: t('admin.nav.seo'), icon: Search },
  ];

  const pageMeta = navItems.find((n) => n.id === tab) || navItems[0];

  const navigate = (id) => {
    setTab(id);
    setMobileNavOpen(false);
  };

  const renderSidebar = () => (
    <div className="admin-pro-sidebar h-full flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-extrabold text-white text-sm leading-tight tracking-tight">Lingohub</p>
          <p className="text-[10px] text-white/40 uppercase tracking-widest">Admin Panel</p>
        </div>
      </div>

      <div className="h-px bg-white/[0.06] mx-4" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto admin-pro-scroll px-3 py-4 space-y-1">
        <p className="px-2 pb-1 text-[9px] uppercase tracking-[0.18em] text-white/30 font-bold">Boshqaruv</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button key={item.id} onClick={() => navigate(item.id)} className={`admin-pro-nav-item ${active ? 'active' : ''}`}>
              <Icon className="admin-pro-nav-icon w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
              {item.id === 'hisoblar' && (
                <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/50">{config.accounts?.length || 0}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User card */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-white/10 flex items-center justify-center text-sm font-bold text-indigo-300 shrink-0">
            {String(session.name || session.username || 'A').charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{session.name || session.username}</p>
            <p className="text-[10px] text-white/40 truncate">{isOwner ? '👑 Egasi' : 'Admin'}</p>
          </div>
          <button onClick={onLogout} className="btn btn-ghost btn-xs btn-circle text-white/40 hover:text-red-400" title={t('admin.logout')}>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
        <a href="#/" className="mt-2 flex items-center gap-2 px-2 py-1.5 text-[11px] text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-3 h-3" /> {t('admin.backToSite')}
        </a>
      </div>
    </div>
  );

  return (
    <div data-theme="dark" className="admin-pro">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
          {renderSidebar()}
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileNavOpen && (
          <>
            <div className="admin-pro-overlay lg:hidden" onClick={() => setMobileNavOpen(false)} />
            <aside className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden animate-[fadeIn_0.2s_ease-out]">
              {renderSidebar()}
            </aside>
          </>
        )}

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* ===== TOPBAR ===== */}
          <header className="admin-pro-topbar sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 py-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="btn btn-ghost btn-sm btn-circle lg:hidden"
              title={t('admin.nav.overview')}
            >
              <MenuIcon className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <h1 className="text-sm md:text-base font-extrabold text-white tracking-tight truncate">
                {pageMeta.label}
              </h1>
              <p className="text-[10px] text-white/40 hidden sm:block">
                {isOwner ? 'admin' : session.username} · {session.name || session.username}
              </p>
            </div>

            <div className="ml-auto flex items-center gap-1.5 md:gap-2">
              {/* Live badge */}
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[11px] font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                {t('admin.liveBadge')}
              </span>

              {/* Yangilash */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] font-semibold text-white/80 hover:bg-white/[0.08] transition-all disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">{t('admin.refresh')}</span>
              </button>

              {/* Chiqish */}
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] font-semibold text-white/80 hover:bg-red-500/10 hover:border-red-400/40 hover:text-red-300 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{t('admin.logout')}</span>
              </button>
            </div>
          </header>

          {/* ===== CONTENT ===== */}
          <main className="flex-1 p-4 md:p-6 space-y-5">
            {tab === 'overview' && (
              <>
                {/* Standart parol ogohlantirishi */}
                {session.warning && (
                  <div className="admin-pro-card px-4 py-3 text-xs bg-amber-500/10 border border-amber-500/40 text-amber-200 flex items-start gap-2.5">
                    <AlertIcon className="w-4 h-4 shrink-0 mt-0.5" />
                    <span><b>⚠️ Standart parol ishlatilmoqda.</b> {session.warning}</span>
                  </div>
                )}

                {/* STAT CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                  {statCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.label}
                        className="admin-pro-stat p-4 animate-[fadeInUp_0.4s_ease-out]"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center mb-3"
                          style={{ boxShadow: `0 0 14px ${card.color}1a` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: card.color }} />
                        </div>
                        <StatValue value={card.value} />
                        <p className="text-xs font-medium text-white/70 mt-1">{card.label}</p>
                        <p className="text-[10px] text-white/35 mt-0.5">{card.note}</p>
                      </div>
                    );
                  })}
                </div>

                {/* TIZIM HOLATI */}
                <ServiceStatus />

                {/* LIVE STRIP */}
                <div className="admin-pro-card px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                  <span className="flex items-center gap-2 font-semibold text-white">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    {t('admin.onlineNow')}
                    <b className="text-emerald-400 tabular-nums">{presence.total}</b>
                  </span>
                  <span className="text-white/20">|</span>
                  <span className="text-white/50">
                    {t('admin.onSite')} <b className="text-white tabular-nums">{presence.site}</b>
                  </span>
                  <span className="text-white/20">|</span>
                  <span className="text-white/50">
                    {t('admin.inAdminPanel')} <b className="text-white tabular-nums">{presence.admin}</b>
                  </span>
                  <span className="ml-auto flex items-center gap-1.5 text-white/35 text-[10px]">
                    <Radio className="w-3 h-3" />
                    {liveMode ? t('admin.realtimeFirebase') : t('admin.liveDemo')}
                  </span>
                </div>

                {/* TEZKOR AMALLAR */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'hisoblar', icon: Users, label: t('admin.tab.accounts'), desc: 'Admin qo\'shish', color: '#818cf8' },
                    { id: 'tanga', icon: Gift, label: t('admin.tab.coins'), desc: 'Tanga berish', color: '#fbbf24' },
                    { id: 'telegram', icon: PaperPlane, label: t('admin.tab.telegram'), desc: 'Bot holati', color: '#38bdf8' },
                    { id: 'sms', icon: SmsIcon, label: 'SMS eslatma', desc: 'Eskiz.uz', color: '#34d399' },
                    { id: 'statistika', icon: Gauge, label: 'Server statistika', desc: 'Darslar · tashriflar', color: '#a78bfa' },
                    { id: 'aktivlik', icon: UserClock, label: t('admin.activityTitle'), desc: 'Jonli kuzatuv', color: '#34d399' },
                  ].map((a) => {
                    const Icon = a.icon;
                    return (
                      <button
                        key={a.id}
                        onClick={() => navigate(a.id)}
                        className="admin-pro-card p-4 text-left hover:-translate-y-0.5 transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0" style={{ boxShadow: `0 0 12px ${a.color}14` }}>
                            <Icon className="w-4 h-4" style={{ color: a.color }} />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-xs font-bold text-white truncate">{a.label}</span>
                            <span className="block text-[10px] text-white/40 truncate">{a.desc}</span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Boshqa bo'limlar */}
            {tab === 'hisoblar' && (
              <div className="admin-pro-card p-4 md:p-5">
                <AccountsTab config={config} onSave={saveConfig} session={session} />
              </div>
            )}
            {tab === 'tillar' && (
              <div className="admin-pro-card p-4 md:p-5">
                <LanguagesTab />
              </div>
            )}
            {tab === 'tanga' && (
              <div className="admin-pro-card p-4 md:p-5">
                <CoinsTab config={config} session={session} />
              </div>
            )}
            {tab === 'matnlar' && (
              <div className="admin-pro-card p-4 md:p-5">
                <TextsTab config={config} onSave={saveConfig} />
              </div>
            )}
            {tab === 'telegram' && (
              <div className="admin-pro-card p-4 md:p-5">
                <TelegramTab />
              </div>
            )}
            {tab === 'sms' && (
              <div className="space-y-4">
                <SmsTab />
              </div>
            )}
            {tab === 'statistika' && (
              <div className="space-y-4">
                <GamificationTab session={session} />
              </div>
            )}
            {tab === 'aktivlik' && <ActivitySection session={session} presenceAdmin={presence.admin} />}
            {tab === 'seo' && <SearchConsoleSection />}
          </main>
        </div>
      </div>
    </div>
  );
}

// ================= MAIN =================
export default function AdminPanel() {
  const { t } = useI18n();
  const [session, setSession] = useState(() => readJSON(SESSION_KEY, null));
  // Saqlangan sessiya mavjud bo'lsa — server'da tasdiqlash kerak.
  // Token'siz (eski/soxta) sessiyalar ham tekshiriladi va rad etiladi.
  const [checking, setChecking] = useState(() => Boolean(readJSON(SESSION_KEY, null)));
  const initialToken = useRef(session?.token || null);

  // Sessiyani server'da tekshiramiz — localStorage'ni soxtalashtirgan
  // foydalanuvchi bu yerda rad etiladi va chiqarib yuboriladi.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await verifyAdminSession(initialToken.current);
      if (cancelled) return;
      if (res.ok) {
        // Token'dan olingan eng so'nggi ma'lumotlar (ism/rol) bilan yangilaymiz
        setSession((prev) => ({ ...(prev || {}), ...res.user }));
      } else if (res.code !== 'network') {
        // Yaroqsiz yoki token'siz sessiya — o'chirib tashlaymiz va login ekranini ko'rsatamiz
        try { localStorage.removeItem(SESSION_KEY); } catch { /* noop */ }
        setSession(null);
      }
      setChecking(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const handleLogout = () => {
    try { localStorage.removeItem(SESSION_KEY); } catch { /* noop */ }
    setSession(null);
  };

  if (checking) {
    return (
      <div data-theme="dark" className="admin-pro min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <p className="text-sm font-semibold text-white/80 inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#3b82f6]" />
            {t('admin.sessionChecking')}
          </p>
        </div>
      </div>
    );
  }

  return session ? (
    <Dashboard session={session} onLogout={handleLogout} />
  ) : (
    <LoginScreen onSuccess={setSession} />
  );
}
