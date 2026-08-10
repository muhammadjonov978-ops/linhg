import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getEarnedCertificates, getCertGoals } from '../lib/certificates';
import CertificateModal from '../components/CertificateModal';
import {
  FaArrowLeft as ArrowLeft, FaMedal as Medal, FaDownload as Download,
  FaTrophy as Trophy, FaFire as Flame, FaBullseye as Target,
} from 'react-icons/fa';

const TYPE_COLORS = { course: '#fbbf24', milestone: '#34d399', cefr: '#818cf8', streak: '#f97316' };

function loadSavedUser() {
  try {
    const raw = localStorage.getItem('lingohub_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function CertificatesPage({ onBack }) {
  const { state } = useApp();
  const [viewing, setViewing] = useState(null);
  const [showGoals, setShowGoals] = useState(true);

  const earned = useMemo(() => getEarnedCertificates(state), [state]);
  const goals = useMemo(() => getCertGoals(state), [state]);

  const userName = loadSavedUser()?.name || 'O\'quvchi';

  const groupByType = (list) => {
    const map = {};
    list.forEach((c) => {
      if (!map[c.type]) map[c.type] = [];
      map[c.type].push(c);
    });
    return map;
  };

  const grouped = useMemo(() => groupByType(earned), [earned]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn btn-ghost btn-sm btn-circle" title="Orqaga">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl shadow-lg shadow-amber-500/25">
            <Medal className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold flex items-center gap-2">
              Sertifikatlar <span className="text-sm opacity-60">· {earned.length} ta</span>
            </h1>
            <p className="text-xs opacity-60">Yutuqlaringiz uchun sertifikatlar yig'ing 🏅</p>
          </div>
        </div>
        {goals.length > 0 && (
          <button
            onClick={() => setShowGoals((v) => !v)}
            className="btn btn-sm btn-ghost border border-base-300 gap-1.5"
          >
            <Target className="w-4 h-4 text-primary" />
            {showGoals ? 'Maqsadlarni yashirish' : 'Keyingi maqsadlar'}
          </button>
        )}
      </div>

      {/* Earned certificates */}
      {earned.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 p-10 text-center">
          <div className="text-5xl mb-3">🎯</div>
          <h3 className="font-bold text-lg mb-1">Hali sertifikat yo'q</h3>
          <p className="text-sm opacity-60 mb-4">
            Darslarni tugating, daraja testini topshiring yoki streak saqlang — sertifikat oling!
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([type, certs]) => {
          const color = TYPE_COLORS[type] || '#888';
          const typeNames = { course: 'Kurs', milestone: 'Bosqich', cefr: 'Daraja', streak: 'Streak' };
          return (
            <div key={type}>
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: `${color}20`, color }}>
                  {type === 'streak' ? <Flame className="w-4 h-4" /> : <Trophy className="w-4 h-4" />}
                </span>
                <h3 className="font-bold text-sm">{typeNames[type] || type} sertifikatlari</h3>
                <span className="text-[10px] opacity-40">· {certs.length} ta</span>
                <div className="flex-1 h-px bg-base-300" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {certs.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setViewing(c)}
                    className="card bg-base-100 border border-base-300 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group relative overflow-hidden"
                  >
                    {/* Rangli chiziq */}
                    <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${c.color}, ${c.color}88)` }} />
                    <div className="card-body p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${c.color}18` }}>
                          {c.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm leading-tight">{c.title}</p>
                          <p className="text-[10px] opacity-50 mt-0.5">{c.subtitle}</p>
                          <p className="text-[9px] opacity-40 mt-1">
                            {new Date(c.date).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <Download className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity ml-auto flex-shrink-0" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Goals */}
      {showGoals && goals.length > 0 && (
        <div className="card bg-base-100 border border-base-300 p-5">
          <h3 className="font-bold text-sm flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-primary" /> Keyingi maqsadlar
          </h3>
          <p className="text-[10px] opacity-50 mb-4">Bularni bajarib, yana sertifikat oling!</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {goals.map((g) => (
              <div key={g.id} className="bg-base-200/60 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{g.icon}</span>
                  <p className="text-xs font-semibold flex-1">{g.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-base-300 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, g.progress)}%`, background: g.color }}
                    />
                  </div>
                  <span className="text-[10px] font-bold tabular-nums" style={{ color: g.color }}>
                    {g.current}/{g.target}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sertifikat modal */}
      {viewing && (
        <CertificateModal
          userName={userName}
          cert={viewing}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}
