import { useState, useEffect, useRef } from 'react';
import {
  FaTimes as X, FaDownload as Download, FaAward as Award,
  FaCheckCircle as CheckCircle, FaPrint as Print, FaMedal as Medal,
  FaTelegram as Telegram, FaWhatsapp as Whatsapp, FaShareAlt as ShareAlt,
} from 'react-icons/fa';
import { shareToTelegram, shareToWhatsApp, shareToX, copyToClipboard } from '../lib/share';

// Canvas orqali chiroyli sertifikat chizadi va PNG sifatida qaytaradi.
function drawCertificate(canvas, { userName, langName, langFlag, percent, dateStr }) {
  const W = 1200;
  const H = 850;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Fon gradienti
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0f172a');
  bg.addColorStop(0.5, '#1e3a5f');
  bg.addColorStop(1, '#0f172a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Yulduzchalar
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.25})`;
    ctx.beginPath();
    ctx.arc(x, y, 1 + Math.random() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ichki chegara (oltin rang)
  ctx.strokeStyle = 'rgba(251,191,36,0.7)';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.strokeStyle = 'rgba(251,191,36,0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(56, 56, W - 112, H - 112);

  // Yuqori emblem
  const cx = W / 2;
  ctx.fillStyle = '#fbbf24';
  ctx.font = '64px serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏆', cx, 130);

  // Sarlavha
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 44px Georgia, serif';
  ctx.fillText('SERTIFIKAT', cx, 205);

  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '20px Arial';
  ctx.fillText('Lingohub • 130+ tilda interaktiv o\'rganish platformasi', cx, 245);

  // "Ushbu sertifikat..." matni
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '22px Arial';
  ctx.fillText('Ushbu sertifikat quyidagi o\'quvchiga beriladi:', cx, 310);

  // Foydalanuvchi ismi (katta, oltin)
  ctx.fillStyle = '#fde68a';
  ctx.font = 'bold 56px Georgia, serif';
  ctx.fillText(userName || 'O\'quvchi', cx, 390);

  // Til va natija
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '24px Arial';
  ctx.fillText(`${langFlag || ''} ${langName || 'Til'} kursini ${percent}% natija bilan muvaffaqiyatli tugatdi`, cx, 455);

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '18px Arial';
  ctx.fillText('Til o\'rganishda izchillik va sabr-toqat — muvaffaqiyat kaliti!', cx, 500);

  // Sana
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '18px Arial';
  ctx.fillText(`Sana: ${dateStr}`, cx, 640);

  // Imzo chizig'i
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 140, 700);
  ctx.lineTo(cx - 20, 700);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '15px Arial';
  ctx.fillText('Lingohub jamoasi', cx - 80, 725);

  ctx.beginPath();
  ctx.moveTo(cx + 20, 700);
  ctx.lineTo(cx + 140, 700);
  ctx.stroke();
  ctx.fillText('Direktor', cx + 80, 725);

  return canvas.toDataURL('image/png');
}

export default function CertificateModal({ userName, lang, percent, onClose }) {
  const [shareMsg, setShareMsg] = useState('');

  const handleShare = (fn) => {
    const text = `🎓 ${userName || 'Men'} Lingohub'da ${lang?.flag} ${lang?.name} kursini ${Math.round(percent || 0)}% natija bilan tugatdim! Siz ham sinab ko'ring — 130+ til bepul!`;
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://lingohub.uz';
    fn(`${url}/#/`, text);
    setShareMsg('✅ Havola ulashish oynasida ochildi!');
    setTimeout(() => setShareMsg(''), 3000);
  };

  const handleCopyLink = async () => {
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://lingohub.uz';
    const ok = await copyToClipboard(`${url}/#/`);
    setShareMsg(ok ? '✅ Havola nusxalandi!' : 'Nusxalash muvaffaqiyatsiz');
    setTimeout(() => setShareMsg(''), 3000);
  };

  const canvasRef = useRef(null);
  const [imgSrc, setImgSrc] = useState('');
  const [downloaded, setDownloaded] = useState(false);

  const dateStr = new Date().toLocaleDateString('uz-UZ', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    const src = drawCertificate(canvasRef.current, {
      userName,
      langName: lang?.name,
      langFlag: lang?.flag,
      percent: Math.max(0, Math.min(100, Math.round(percent || 0))),
      dateStr,
    });
    setImgSrc(src);
  }, [userName, lang, percent, dateStr]);

  const handleDownload = () => {
    if (!imgSrc) return;
    const a = document.createElement('a');
    a.href = imgSrc;
    a.download = `Lingohub-Sertifikat-${lang?.id || 'til'}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handlePrint = () => {
    const w = window.open('', '_blank', 'width=900,height=650');
    if (!w) return;
    w.document.write(`<html><head><title>Sertifikat</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#0f172a">
      <img src="${imgSrc}" style="max-width:96%;border-radius:12px" /></body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div
        className="relative bg-base-100 rounded-3xl shadow-2xl max-w-3xl w-full my-4 animate-[fadeInUp_0.35s_ease-out] overflow-hidden border border-primary/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-base-300 bg-gradient-to-r from-primary/10 to-secondary/10">
          <h3 className="font-bold flex items-center gap-2">
            <Medal className="w-5 h-5 text-warning" /> Sertifikat tayyor! 🎉
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-xs btn-circle">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* Ko'rinmas canvas — PNG yaratish uchun */}
          <canvas ref={canvasRef} className="hidden" />

          {imgSrc ? (
            <img
              src={imgSrc}
              alt="Lingohub sertifikati"
              className="w-full rounded-2xl shadow-2xl border border-base-300 animate-[scaleIn_0.4s_ease-out]"
            />
          ) : (
            <div className="h-80 flex items-center justify-center">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          )}

          {/* Natija statistikasi */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-success/10 border border-success/20 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-success">{percent}%</p>
              <p className="text-[10px] opacity-60">Natija</p>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-primary">{lang?.flag}</p>
              <p className="text-[10px] opacity-60">{lang?.name}</p>
            </div>
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-warning">100</p>
              <p className="text-[10px] opacity-60">Dars</p>
            </div>
          </div>

          {/* Tugmalar */}
          <div className="flex flex-wrap gap-2 mt-5">
            <button onClick={handleDownload} className="btn btn-primary flex-1 gap-2 btn-wave">
              {downloaded ? (
                <><CheckCircle className="w-4 h-4" /> Yuklab olindi!</>
              ) : (
                <><Download className="w-4 h-4" /> PNG yuklab olish</>
              )}
            </button>
            <button onClick={handlePrint} className="btn btn-ghost gap-2 border border-base-300">
              <Print className="w-4 h-4" /> Chop etish
            </button>
          </div>

          {/* Ulashish */}
          <div className="mt-4 p-4 bg-base-200/60 rounded-2xl border border-base-300">
            <p className="text-xs font-semibold flex items-center gap-1.5 mb-2">
              <ShareAlt className="w-3.5 h-3.5 text-primary" /> Yutug'ingizni ulashing 🎉
            </p>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleShare(shareToTelegram)}
                className="btn btn-sm bg-[#229ED9] hover:bg-[#1d8bc0] text-white gap-1.5"
              >
                <Telegram className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare(shareToWhatsApp)}
                className="btn btn-sm bg-[#25D366] hover:bg-[#1fb958] text-white gap-1.5"
              >
                <Whatsapp className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare(shareToX)}
                className="btn btn-sm bg-base-200 hover:bg-base-300 border border-base-300"
              >
                <Award className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopyLink}
                className="btn btn-sm btn-ghost border border-base-300"
                title="Havolani nusxalash"
              >
                <Download className="w-4 h-4 rotate-180" />
              </button>
            </div>
            {shareMsg && (
              <p className="text-[10px] text-success mt-2 animate-fadeInUp">{shareMsg}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
