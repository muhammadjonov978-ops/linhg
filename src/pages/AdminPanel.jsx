import { useState, useEffect, useRef } from 'react';
import { adminLogin, verifyAdminSession, UNIVERSAL_USERNAME } from '../data/adminUsers';
import { useSiteConfig, saveConfig, getLangPrice } from '../data/siteConfig';
import { languages } from '../data/languages';
import { subscribeAdminCoins, giveAdminCoins, MAX_LOG } from '../lib/adminCoins';
import {
  startPresence, setPresenceLocation, subscribePresence,
} from '../utils/presence';
import { subscribeVisits, refreshVisits } from '../utils/visits';
import {
  FaShieldAlt as Shield, FaKey as KeyRound, FaUser as UserIcon, FaEye as Eye,
  FaEyeSlash as EyeOff, FaSignOutAlt as LogOut, FaArrowLeft as ArrowLeft,
  FaCopy as Copy, FaCheck as Check, FaHeartbeat as Activity, FaUsers as Users,
  FaBroadcastTower as Radio, FaClock as Clock, FaCrown as Crown,
  FaUserPlus as UserPlus, FaTrash as Trash2, FaCoins as Coins, FaFont as Type,
  FaSave as Save, FaUndo as RotateCcw, FaSync as RefreshCw, FaSearch as Search,
  FaUpload as Upload, FaLink as Link2, FaTimes as X, FaChevronRight as ChevronRight,
  FaFileExcel as FileSpreadsheet, FaChartLine as TrendingUp,
  FaMousePointer as MousePointerClick, FaChartBar as BarChart3,
  FaGift as Gift, FaSpinner as Loader2, FaInfinity as InfinityIcon,
  FaExclamationTriangle as AlertIcon,
} from 'react-icons/fa';

const SESSION_KEY = 'lingohub_admin_session';
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
      const session = { ...res.user, token: res.token, loginAt: Date.now() };
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
    <div data-theme="dark" className="admin-shell min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-[fadeInUp_0.5s_ease-out]">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#facc15] to-[#f59e0b] flex items-center justify-center shadow-lg shadow-[#facc15]/30 mb-3 animate-[bounceIn_0.6s_ease-out]">
            <Shield className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Admin Panel</h1>
          <p className="text-sm text-white/50 mt-1">Lingohub boshqaruv tizimi</p>
        </div>

        <div className="admin-card p-6 md:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-login" className="label text-xs font-medium text-white/60">Login</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="admin-login"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Loginni kiriting"
                  className="input input-bordered w-full pl-10 bg-white/[0.03] border-white/10 focus:outline-none focus:border-[#facc15] transition-colors"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="label text-xs font-medium text-white/60">Parol</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="admin-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Parolni kiriting"
                  className="input input-bordered w-full pl-10 pr-10 bg-white/[0.03] border-white/10 focus:outline-none focus:border-[#facc15] transition-colors"
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

            <button type="submit" disabled={busy} className="btn btn-primary w-full gap-2 btn-wave border-0 bg-gradient-to-r from-[#facc15] to-[#f59e0b] text-black hover:brightness-105 disabled:opacity-60">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {busy ? 'Tekshirilmoqda...' : 'Kirish'}
            </button>
          </form>

          <a href="#/" className="btn btn-ghost btn-sm mt-4 gap-2 text-xs text-white/60">
            <ArrowLeft className="w-3.5 h-3.5" /> Saytga qaytish
          </a>
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
      <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4">
        <h3 className="font-bold text-sm flex items-center gap-2 mb-2 text-white">
          <UserPlus className="w-4 h-4 text-[#facc15]" /> Yangi hisob qo\u2018shish
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            placeholder="Login"
            className="input input-bordered input-sm bg-white/[0.03] border-white/10"
          />
          <input
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            placeholder="Parol"
            className="input input-bordered input-sm bg-white/[0.03] border-white/10"
          />
          <input
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            placeholder="Ism"
            className="input input-bordered input-sm bg-white/[0.03] border-white/10"
          />
        </div>
        <div className="flex items-center gap-3 mt-2">
          <button onClick={addAccount} className="btn btn-primary btn-sm gap-1.5 border-0 bg-gradient-to-r from-[#facc15] to-[#f59e0b] text-black">
            <UserPlus className="w-3.5 h-3.5" /> Qo\u2018shish
          </button>
          {msg && <span className="text-xs text-white/70">{msg}</span>}
        </div>
      </div>

      {/* Accounts table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="table table-sm w-full">
          <thead>
            <tr className="bg-white/[0.04] text-xs text-white/60">
              <th className="w-10">#</th>
              <th>Foydalanuvchi</th>
              <th>Ism</th>
              <th>Rol</th>
              <th className="text-right">Amal</th>
            </tr>
          </thead>
          <tbody>
            {config.accounts.map((u, i) => (
              <tr key={u.username} className="hover:bg-white/[0.03] transition-colors">
                <td className="text-xs text-white/40">{i + 1}</td>
                <td className="font-mono text-xs font-bold text-white">{u.username}</td>
                <td className="text-xs text-white/70">{u.name}</td>
                <td>
                  {u.role === 'owner' ? (
                    <span className="badge badge-warning badge-sm gap-1 border-0"><Crown className="w-3 h-3" /> Egas</span>
                  ) : (
                    <span className="badge badge-ghost badge-sm bg-white/[0.06] border-white/10 text-white/70">Admin</span>
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
  // Server'dagi QAT'IY narxlar (api/_lib/prices.js) — farq bo'lsa ogohlantiramiz
  const [serverPrices, setServerPrices] = useState(null);

  useEffect(() => {
    fetch('/api/prices')
      .then((r) => r.json())
      .then((d) => { if (d?.ok) setServerPrices(d.prices); })
      .catch(() => { /* server narxlari olinmasa ogohlantirish ko'rsatilmaydi */ });
  }, []);

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

  // Panel narxi bilan server narxi farq qiladigan tillar
  const mismatches = serverPrices
    ? languages.filter((l) => {
        const sp = serverPrices[l.id];
        return typeof sp === 'number' && sp !== (prices[l.id] ?? 0);
      })
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/50">Har bir til uchun narxni kiriting (0 — bepul). Diqqat: to\u2018lov miqdori server\u2019dagi qat\u2019iy narxlar bilan tekshiriladi — bu yerda o\u2018zgargan narx faqat saytda ko\u2018rinadi.</p>
        <div className="flex gap-2">
          <button onClick={reset} className="btn btn-ghost btn-xs gap-1.5 text-white/60">
            <RotateCcw className="w-3 h-3" /> Tiklash
          </button>
          <button onClick={save} className="btn btn-primary btn-xs gap-1.5 border-0 bg-gradient-to-r from-[#facc15] to-[#f59e0b] text-black">
            <Save className="w-3.5 h-3.5" /> Saqlash
          </button>
        </div>
      </div>

      {mismatches.length > 0 && (
        <div className="rounded-xl px-4 py-3 text-xs bg-amber-500/10 border border-amber-500/40 text-[#fbbf24] flex items-start gap-2.5">
          <AlertIcon className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <b>Diqqat:</b> {mismatches.length} ta til narxi server bilan mos emas. To\u2018lov server\u2019dagi qat\u2019iy narxlar
            (api/_lib/prices.js) bo\u2018yicha tekshiriladi — serverda ham yangilanmasa, shu tillar uchun to\u2018lov
            “Til narxi noto\u2018g\u2018ri” deb rad etiladi.
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {languages.map((l) => {
          const sp = serverPrices?.[l.id];
          const differs = typeof sp === 'number' && sp !== (prices[l.id] ?? 0);
          return (
          <div key={l.id} className={`relative rounded-xl border p-3 flex items-center gap-2 ${differs ? 'border-amber-500/50 bg-amber-500/[0.06]' : 'bg-white/[0.02] border-white/10'}`}>
            <span className="text-2xl">{l.flag}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-white">{l.name}</p>
              <input
                type="number"
                min="0"
                step="1000"
                value={prices[l.id] ?? 0}
                onChange={(e) => setPrices({ ...prices, [l.id]: Math.max(0, Number(e.target.value) || 0) })}
                className="input input-bordered input-xs w-full mt-1 bg-white/[0.03] border-white/10"
              />
            </div>
            <Coins className="w-3.5 h-3.5 text-[#facc15] shrink-0" />
            {differs && (
              <span className="absolute -top-2 -right-2 badge badge-warning badge-xs border-0 font-bold shadow-lg">
                Server: {sp.toLocaleString('uz-UZ')}
              </span>
            )}
          </div>
          );
        })}
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
          <label className="label text-xs font-medium text-white/60 py-1">{f.label}</label>
          <input
            value={texts[f.key] ?? ''}
            onChange={set(f.key)}
            placeholder={f.hint}
            className="input input-bordered w-full bg-white/[0.03] border-white/10 focus:outline-none focus:border-[#facc15] transition-colors"
          />
        </div>
      ))}
      <div className="flex items-center gap-3 pt-1">
        <button onClick={save} className="btn btn-primary btn-sm gap-1.5 border-0 bg-gradient-to-r from-[#facc15] to-[#f59e0b] text-black">
          <Save className="w-3.5 h-3.5" /> Saqlash
        </button>
        {msg && <span className="text-xs text-success font-medium">{msg}</span>}
      </div>
    </div>
  );
}

// ================= COINS TAB (adminlar bir-biriga cheksiz coin beradi) =================
function CoinsTab({ config, session }) {
  const [data, setData] = useState({ balances: {}, log: [], mode: 'local' });
  const [target, setTarget] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => subscribeAdminCoins((d) => setData(d)), []);

  // Adminlar ro'yxati — universal egasi + config'da qo'shilgan hisoblar
  const admins = [
    { username: UNIVERSAL_USERNAME, name: 'Shox', role: 'owner' },
    ...(config.accounts || []).filter((a) => a.username !== UNIVERSAL_USERNAME),
  ].map((a) => ({ ...a, balance: data.balances?.[a.username] ?? 0 }));

  const totalCoins = admins.reduce((s, a) => s + a.balance, 0);
  const isFirebase = data.mode === 'firebase';

  const handleGive = async (username) => {
    const amt = Math.floor(Number(amount));
    if (!Number.isFinite(amt) || amt <= 0) {
      setMsg('❌ Miqdor noto\u2018g\u2018ri — musbat butun son kiriting');
      return;
    }
    setBusy(true);
    setMsg('');
    const res = await giveAdminCoins(session.username || 'admin', username, amt);
    setBusy(false);
    if (res.ok) {
      setMsg(`✅ ${username} ga +${amt.toLocaleString('uz-UZ')} tanga berildi`);
      setAmount('');
    } else {
      setMsg(`❌ ${res.error}`);
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const fmtTime = (t) => new Date(t).toLocaleString('uz-UZ', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="space-y-4">
      {/* Rejim ko'rsatkichi */}
      <div className={`rounded-xl px-4 py-3 text-xs flex flex-wrap items-center gap-2 border ${isFirebase ? 'bg-[#16a34a]/10 border-[#16a34a]/40 text-[#4ade80]' : 'bg-[#f59e0b]/10 border-[#f59e0b]/40 text-[#fbbf24]'}`}>
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
            <span className="w-2 h-2 rounded-full bg-[#fbbf24]" />
            <b>Demo rejim — shu brauzer</b>
            <span className="opacity-70">Firebase sozlanmagan. Coinlar faqat shu brauzerda saqlanadi. To\u2018liq ishlash uchun .env faylga VITE_FIREBASE_* kalitlarini kiriting.</span>
          </>
        )}
      </div>

      {/* Jami balans */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-[#facc15]/10 border border-[#facc15]/25 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#facc15]/15 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-[#facc15]" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-white tabular-nums">{totalCoins.toLocaleString('uz-UZ')}</p>
            <p className="text-[10px] text-white/40">Barcha adminlar jami tangasi</p>
          </div>
        </div>
        <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0">
            <InfinityIcon className="w-5 h-5 text-[#fbbf24]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Cheksiz berish</p>
            <p className="text-[10px] text-white/40">Hech qanday limit yo\u2018q — tekinga, istalgan miqdorda</p>
          </div>
        </div>
        <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#60a5fa]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{admins.length} ta admin</p>
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
              <th className="text-right">Cheksiz berish</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.username} className="hover:bg-white/[0.03] transition-colors">
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-sm font-bold text-[#facc15]">
                      {(a.name || a.username).charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-white">{a.username}</p>
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
                  <span className="font-extrabold text-[#facc15] tabular-nums">
                    {a.balance.toLocaleString('uz-UZ')}
                  </span>
                  <span className="text-[10px] text-white/30 ml-1">🪙</span>
                </td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setTarget(a.username); setAmount(''); }}
                      className="btn btn-ghost btn-xs text-[10px] text-white/50 hover:text-[#facc15]"
                    >
                      Tanlash
                    </button>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Miqdor"
                      value={target === a.username ? amount : ''}
                      onChange={(e) => { setTarget(a.username); setAmount(e.target.value); }}
                      className="input input-bordered input-xs w-28 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30"
                    />
                    <button
                      onClick={() => handleGive(a.username)}
                      disabled={busy || target !== a.username}
                      className="btn btn-primary btn-xs gap-1.5 border-0 bg-gradient-to-r from-[#facc15] to-[#f59e0b] text-black disabled:opacity-40"
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
                <span className="w-7 h-7 rounded-lg bg-[#facc15]/10 border border-[#facc15]/20 flex items-center justify-center shrink-0">
                  <Gift className="w-3 h-3 text-[#facc15]" />
                </span>
                <span className="font-mono font-bold text-white">{entry.from}</span>
                <span className="text-white/30">→</span>
                <span className="font-mono font-bold text-white">{entry.to}</span>
                <span className="font-extrabold text-[#facc15] tabular-nums">+{Number(entry.amount || 0).toLocaleString('uz-UZ')} 🪙</span>
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
    { icon: MousePointerClick, label: 'Jami kliklar', value: fmtNum(data.totalClicks), color: '#facc15' },
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
          <Search className="w-4 h-4 text-[#facc15]" />
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
          <Search className="w-7 h-7 text-[#facc15]" />
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
              className="mt-3 text-xs font-semibold text-[#facc15] inline-flex items-center gap-1 hover:gap-2 transition-all group"
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
    { key: 'adminAuth', label: 'Admin login', ok: health.adminAuth, hint: 'ADMIN_PASSWORD' },
  ];

  return (
    <div className="admin-card px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
      <span className="font-semibold text-white inline-flex items-center gap-1.5">
        <Activity className="w-3.5 h-3.5 text-[#facc15]" /> Tizim holati:
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
  const config = useSiteConfig();
  const [presence, setPresence] = useState({ total: 0, site: 0, admin: 0, mode: 'local' });
  const [visits, setVisits] = useState({ total: 0, today: 0, last7d: 0, unique: 0, mode: 'local' });
  const [refreshing, setRefreshing] = useState(false);
  const [log] = useState(() => readJSON(LOG_KEY, []));
  const [tab, setTab] = useState('hisoblar');

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
    { label: 'Jami tashrif', value: visits.total, icon: Eye, note: 'barcha vaqt davomida', color: '#facc15' },
    { label: 'Bugun', value: visits.today, icon: Activity, note: '00:00 dan hozirgacha', color: '#4ade80' },
    { label: '7 kun ichida', value: visits.last7d, icon: Clock, note: 'oxirgi 7 kun', color: '#60a5fa' },
    { label: 'Unikal tashrif', value: visits.unique, icon: Users, note: 'turli qurilmalar', color: '#c084fc' },
  ];

  const tabs = [
    { id: 'hisoblar', label: 'Hisoblar', icon: Users },
    { id: 'tillar', label: 'Til narxlari', icon: Coins },
    { id: 'tanga', label: 'Tanga berish', icon: Gift },
    { id: 'matnlar', label: 'Sayt matnlari', icon: Type },
  ];

  return (
    <div data-theme="dark" className="admin-shell">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-5">
        {/* ===== HEADER ===== */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#facc15] to-[#f59e0b] flex items-center justify-center shadow-lg shadow-[#facc15]/25 shrink-0">
              <Shield className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Admin Panel</h1>
              <p className="text-[11px] text-white/45 flex items-center gap-1.5 mt-0.5">
                <UserIcon className="w-3 h-3" />
                {isOwner ? 'admin' : session.username} · {session.name || session.username}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Live badge */}
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#16a34a]/15 border border-[#16a34a]/40 text-[#4ade80] text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]" />
              </span>
              Live 30s
            </span>

            {/* Yangilash */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-white/80 hover:bg-white/[0.09] hover:border-white/20 transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Yangilash
            </button>

            {/* Chiqish */}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-white/80 hover:bg-red-500/10 hover:border-red-400/40 hover:text-red-300 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Chiqish
            </button>

            {/* Orqaga */}
            <a
              href="#/"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-white/80 hover:bg-white/[0.09] hover:border-white/20 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Orqaga
            </a>
          </div>
        </header>

        {/* ===== TIZIM HOLATI ===== */}
        <ServiceStatus />

        {/* ===== STAT CARDS ===== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="admin-card admin-card-hover p-5 animate-[fadeInUp_0.5s_ease-out]"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div
                  className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center mb-4"
                  style={{ boxShadow: `0 0 14px ${card.color}14` }}
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

        {/* ===== LIVE STRIP (hozir onlayn) ===== */}
        <div className="admin-card px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <span className="flex items-center gap-2 font-semibold text-white">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]" />
            </span>
            Hozir onlayn:
            <b className="text-[#4ade80] tabular-nums">{presence.total}</b>
          </span>
          <span className="text-white/20">|</span>
          <span className="text-white/50">
            Saytda: <b className="text-white tabular-nums">{presence.site}</b>
          </span>
          <span className="text-white/20">|</span>
          <span className="text-white/50">
            Admin panelda: <b className="text-white tabular-nums">{presence.admin}</b>
          </span>
          <span className="ml-auto flex items-center gap-1.5 text-white/35 text-[10px]">
            <Radio className="w-3 h-3" />
            {liveMode ? 'Realtime — barcha qurilmalar (Firebase)' : 'Live — shu brauzer (demo rejim)'}
          </span>
        </div>

        {/* ===== GOOGLE SEARCH SECTION ===== */}
        <SearchConsoleSection />

        {/* ===== TABS ===== */}
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#facc15] to-[#f59e0b] text-black shadow-lg shadow-[#facc15]/20'
                    : 'bg-white/[0.04] border border-white/10 text-white/60 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="admin-card p-5 md:p-6">
          {tab === 'hisoblar' && <AccountsTab config={config} onSave={saveConfig} />}
          {tab === 'tillar' && <PricesTab config={config} onSave={saveConfig} />}
          {tab === 'tanga' && <CoinsTab config={config} session={session} />}
          {tab === 'matnlar' && <TextsTab config={config} onSave={saveConfig} />}
        </div>

        {/* ===== LOGIN LOG ===== */}
        <div className="admin-card p-5 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-[#38bdf8]/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#38bdf8]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Kirish tarixi</h3>
              <p className="text-[11px] text-white/40">So\u2018nggi urinishlar (oxirgi 100)</p>
            </div>
          </div>

          {log.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-6">Hozircha urinishlar yo\u2018q</p>
          ) : (
            <div className="max-h-72 overflow-y-auto rounded-xl border border-white/10 divide-y divide-white/5">
              {log.slice(0, 30).map((entry, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-xs">
                  <span className={`badge badge-sm gap-1 ${entry.ok ? 'badge-success' : 'badge-error'}`}>
                    {entry.ok ? '✓ Muvaffaqiyatli' : '✗ Xato'}
                  </span>
                  <span className="font-mono font-bold text-white">{entry.username}</span>
                  <span className="text-white/30 ml-auto tabular-nums">
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
  );
}

// ================= MAIN =================
export default function AdminPanel() {
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
      <div data-theme="dark" className="admin-shell min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#facc15] to-[#f59e0b] flex items-center justify-center shadow-lg shadow-[#facc15]/25">
            <Shield className="w-7 h-7 text-black" />
          </div>
          <p className="text-sm font-semibold text-white/80 inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#facc15]" />
            Sessiya tekshirilmoqda...
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
