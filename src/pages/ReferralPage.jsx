import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  FaArrowLeft as ArrowLeft, FaCopy as Copy, FaCheckCircle as CheckCircle,
  FaTelegram as Telegram, FaWhatsapp as Whatsapp, FaTwitter as Twitter,
  FaUsers as Users, FaGift as Gift, FaCoins as Coins, FaLink as LinkIcon,
} from 'react-icons/fa';
import {
  getReferralCode, getReferralLink, getLocalInviteVisits,
  fetchInviteCount, markInviteMade, getInvitesMade, claimInviterReward,
} from '../lib/referral';
import { shareToTelegram, shareToWhatsApp, shareToX, copyToClipboard } from '../lib/share';

const BONUS = 50;

export default function ReferralPage({ onBack }) {
  const { state } = useApp();
  const [code] = useState(getReferralCode);
  const [link] = useState(() => getReferralLink());
  const [copied, setCopied] = useState(false);
  const [cloudCount, setCloudCount] = useState(null);
  const [shared, setShared] = useState(false);

  const [rewardToast, setRewardToast] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchInviteCount(code).then((n) => {
      if (!cancelled && n !== null) setCloudCount(n);
    });
    // Yangi takliflar uchun inviter mukofoti (+30 tanga / taklif)
    claimInviterReward(dispatch).then(({ reward }) => {
      if (!cancelled && reward > 0) {
        setRewardToast(`🎉 Yangi takliflar uchun +${reward} tanga!`);
        setTimeout(() => setRewardToast(''), 5000);
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const localVisits = getLocalInviteVisits(code);
  const invitesMade = getInvitesMade();
  // Haqiqiy hisob: bulutda ro'yxatdan o'tgan takliflar; bo'lmasa mahalliy ko'rsatkich
  const totalInvites = cloudCount !== null ? Math.max(cloudCount, invitesMade) : Math.max(localVisits, invitesMade);

  const handleCopy = async () => {
    const ok = await copyToClipboard(link);
    if (ok) {
      setCopied(true);
      markInviteMade();
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = (fn) => {
    markInviteMade();
    setShared(true);
    setTimeout(() => setShared(false), 2500);
    fn(link, "Lingohub'da 130+ tilni bepul o'rganing! 🌍 Meni taklif qildi — siz ham kelib qo'shiling:");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="btn btn-ghost btn-sm btn-circle" title="Orqaga">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/25">
          <Gift className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold">Do'st taklif qilish 🎁</h1>
          <p className="text-xs opacity-60">Taklif qiling — ikkalangiz ham tanga oling!</p>
        </div>
      </div>

      {/* Bonus banner */}
      <div className="card bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border border-emerald-500/30 p-5 text-center">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-500">+{BONUS}</div>
            <div className="text-[10px] opacity-60 flex items-center justify-center gap-1"><Coins className="w-3 h-3" /> Do'stingizga</div>
          </div>
          <span className="text-2xl opacity-40">🤝</span>
          <div className="text-center">
            <div className="text-2xl font-black text-warning">+{Math.round(BONUS * 0.6)}</div>
            <div className="text-[10px] opacity-60 flex items-center justify-center gap-1"><Coins className="w-3 h-3" /> Sizga</div>
          </div>
        </div>
        <p className="text-xs opacity-60 mt-2">Do'stingiz link orqali kirganda +{BONUS} tanga oladi, hisob yaratib birinchi darsni tugatganda sizga ham +30 tanga! 🚀</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card bg-base-100 border border-base-300 p-3 text-center">
          <p className="text-xl font-bold text-primary flex items-center justify-center gap-1"><Users className="w-4 h-4" /> {totalInvites}</p>
          <p className="text-[10px] opacity-50">Taklif qilinganlar</p>
        </div>
        <div className="card bg-base-100 border border-base-300 p-3 text-center">
          <p className="text-xl font-bold text-warning flex items-center justify-center gap-1"><Coins className="w-4 h-4" /> {state.coins}</p>
          <p className="text-[10px] opacity-50">Tangalaringiz</p>
        </div>
        <div className="card bg-base-100 border border-base-300 p-3 text-center">
          <p className="text-xl font-bold text-secondary">#{code}</p>
          <p className="text-[10px] opacity-50">Shaxsiy kod</p>
        </div>
      </div>

      {/* Link card */}
      <div className="card bg-base-100 border border-base-300 p-5">
        <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
          <LinkIcon className="w-4 h-4 text-primary" /> Sizning taklif havolangiz
        </h3>
        <div className="flex gap-2">
          <input
            readOnly
            value={link}
            onFocus={(e) => e.target.select()}
            className="input input-bordered input-sm flex-1 bg-base-200 font-mono text-xs"
          />
          <button onClick={handleCopy} className="btn btn-primary btn-sm gap-1.5">
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Nusxalandi!' : 'Nusxalash'}
          </button>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <button onClick={() => handleShare(shareToTelegram)} className="btn btn-sm bg-[#229ED9] hover:bg-[#1d8bc0] text-white gap-1.5">
            <Telegram className="w-4 h-4" /> Telegram
          </button>
          <button onClick={() => handleShare(shareToWhatsApp)} className="btn btn-sm bg-[#25D366] hover:bg-[#1fb958] text-white gap-1.5">
            <Whatsapp className="w-4 h-4" /> WhatsApp
          </button>
          <button onClick={() => handleShare(shareToX)} className="btn btn-sm bg-base-200 hover:bg-base-300 gap-1.5">
            <Twitter className="w-4 h-4" /> X
          </button>
        </div>
        {shared && (
          <p className="text-xs text-success mt-2 flex items-center gap-1 animate-fadeInUp">
            <CheckCircle className="w-3 h-3" /> Rahmat! Havolangiz tarqatildi. 🎉
          </p>
        )}
      </div>

      {rewardToast && (
        <div className="p-4 bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border border-emerald-500/30 rounded-2xl text-center text-sm font-bold text-success animate-fadeInUp">
          {rewardToast}
        </div>
      )}

      {/* How it works */}
      <div className="card bg-base-100 border border-base-300 p-5">
        <h3 className="font-bold text-sm mb-3">Qanday ishlaydi?</h3>
        <div className="space-y-3">
          {[
            { icon: '1️⃣', text: 'Havolani do\'stlaringizga yuboring (Telegram, WhatsApp yoki nusxalash)' },
            { icon: '2️⃣', text: 'Do\'stingiz havola orqali kirganda avtomatik +50 tanga oladi' },
            { icon: '3️⃣', text: 'U hisob yaratib birinchi darsini tugatganda sizga ham +30 tanga bonus' },
            { icon: '4️⃣', text: 'Qancha ko\'p taklif qilsangiz, shuncha ko\'p tanga!' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="text-xl">{step.icon}</span>
              <span className="opacity-75">{step.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
