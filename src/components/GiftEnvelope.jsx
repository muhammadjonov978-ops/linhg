import { useState } from 'react';
import { Mail, X, Sparkles } from 'lucide-react';

// Xat matni — konvert ichidan chiqadigan sovg'a taklifi
// (5000 tanga yig'ib 2 ta pullik til ochish — CoinRewardBanner bilan bir xil)
const LETTER_TEXT = 'Salom, aziz o\'quvchi! Lingohub\'da 5000 tanga yig\'sang, biz senga 2 ta pullik tilimizni BEPUL sovg\'a qilamiz. Muvaffaqiyatlar tilaymiz!';

// Xat bir marta o'qilgach, qizil nuqta yo'qoladi (localStorage'da saqlanadi)
const SEEN_KEY = 'lingohub_letter_seen';

function isLetterSeen() {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function markLetterSeen() {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* ignore */
  }
}

export default function GiftEnvelope() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSealed, setIsSealed] = useState(true); // konvert muhrlangan holatdan ochiladi
  const [seen, setSeen] = useState(isLetterSeen());

  const openEnvelope = () => {
    setIsSealed(false);
    if (!seen) {
      setSeen(true);
      markLetterSeen();
    }
  };

  const openModal = () => {
    setIsOpen(true);
    setIsSealed(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    // Keyingi ochishda yana muhrlangan konvert chiqadi
    setTimeout(() => setIsSealed(true), 300);
  };

  return (
    <>
      {/* Tepadagi konvert tugmasi */}
      <button
        onClick={openModal}
        className="btn btn-ghost btn-sm gap-1.5 tooltip relative"
        data-tip={seen ? 'Maxsus xat' : 'Sizga xat bor! 💌'}
      >
        <span className="relative">
          <Mail className={`w-4 h-4 text-warning ${seen ? '' : 'animate-bounce'}`} />
          {!seen && (
            <>
              <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-error rounded-full border border-base-100 animate-ping" />
              <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-error rounded-full border border-base-100" />
            </>
          )}
        </span>
        <span className="hidden sm:inline text-xs">Xat</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />

          <div className="relative bg-base-100 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-[scaleIn_0.35s_ease-out]">
            {/* Sarlavha */}
            <div className="bg-gradient-to-r from-warning via-amber-500 to-secondary p-4 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Sizga maxsus xat keldi!
              </h3>
              <button
                onClick={closeModal}
                className="btn btn-ghost btn-circle btn-sm text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center">
              {/* Konvert */}
              <div
                onClick={openEnvelope}
                className={`relative w-64 h-40 cursor-pointer select-none transition-transform duration-300 ${
                  isSealed ? 'hover:scale-105' : ''
                }`}
                title="Konvertni oching"
              >
                {/* Konvert tanasi */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 rounded-lg shadow-xl overflow-hidden">
                  {/* Konvert ichki tomoni */}
                  <div className="absolute inset-2 bg-amber-200/60 rounded-md" />
                  {/* Xat (ichkarida) */}
                  <div
                    className={`absolute left-3 right-3 top-2 bottom-2 bg-white rounded-md shadow-md transition-all duration-700 ease-out ${
                      isSealed ? 'translate-y-0' : '-translate-y-16'
                    }`}
                  >
                    <div className="h-full flex flex-col items-center justify-center px-3">
                      <span className="text-[10px] text-amber-500 font-bold tracking-widest">★ ★ ★</span>
                      <span className="text-[8px] text-neutral-400 text-center mt-1 leading-tight">
                        Sehrli til sovg'asi
                      </span>
                    </div>
                  </div>

                  {/* Konvert qopqog'i (uchburchak) */}
                  <div
                    className={`absolute inset-x-0 top-0 h-1/2 transition-all duration-700 origin-top ${
                      isSealed ? 'rotate-0' : 'rotate-x-open'
                    }`}
                    style={{
                      background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)',
                      clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                      transformOrigin: 'top center',
                      transition: 'transform 0.7s ease-out',
                    }}
                  />

                  {/* Muhr */}
                  <div
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-lg flex items-center justify-center border-2 border-red-400/50 transition-all duration-500 ${
                      isSealed ? 'scale-100' : 'scale-0 rotate-180 opacity-0'
                    }`}
                  >
                    <span className="text-white text-lg">♥</span>
                  </div>
                </div>
              </div>

              {isSealed ? (
                <p className="mt-4 text-sm opacity-60 animate-fadeIn">
                  Konvertni bosib oching 👆
                </p>
              ) : (
                <div className="mt-5 w-full animate-fadeInUp">
                  {/* Xat — chiroyli qo'lyozma shrift bilan */}
                  <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-inner">
                    {/* Xat bezaklari */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1">
                      <span className="text-amber-400 text-xs">✦</span>
                      <span className="text-amber-500 text-sm">✦</span>
                      <span className="text-amber-400 text-xs">✦</span>
                    </div>
                    <div className="absolute top-3 right-3 text-amber-300 text-sm">✉</div>

                    <p className="text-center text-lg leading-relaxed text-neutral-800 italic mx-auto max-w-sm letter-script">
                      “{LETTER_TEXT}”
                    </p>

                    <div className="mt-4 flex items-center justify-center gap-2">
                      <span className="h-px w-12 bg-amber-300" />
                      <span className="text-amber-500 text-sm">💌</span>
                      <span className="h-px w-12 bg-amber-300" />
                    </div>
                    <p className="text-center text-xs text-amber-600 font-semibold mt-2">
                      Lingohub jamoasi
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
