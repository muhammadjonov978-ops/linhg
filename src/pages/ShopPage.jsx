import { useMemo, useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import HeroAvatar from '../components/HeroAvatar';
import { SHOP_CATEGORIES, SHOP_ITEMS, RARITY_META, getShopItem } from '../data/shop';
import {
  FaCoins as Coins, FaShoppingBag as ShoppingBag, FaCheck as Check,
  FaMagic as Sparkles, FaLock as Lock, FaTimes as X,
} from 'react-icons/fa';

function rarityCard(item) {
  const meta = RARITY_META[item.rarity] || RARITY_META.oddiy;
  const legendary = item.rarity === 'afsonaviy';
  return {
    ...meta,
    cardRing: legendary
      ? 'border-amber-400/50 shadow-lg shadow-amber-500/10'
      : item.rarity === 'nodir'
        ? 'border-sky-400/40 shadow-md shadow-sky-500/5'
        : 'border-base-300',
  };
}

export default function ShopPage() {
  const { state, dispatch } = useApp();
  const [activeCat, setActiveCat] = useState('all');
  const [previewItemId, setPreviewItemId] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const [burst, setBurst] = useState(0); // sotib olinganda konfetti

  const owned = useMemo(() => new Set(state.inventory || []), [state.inventory]);
  const equipped = state.equipped || {};

  const showToast = (msg, kind = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ msg, kind });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Tanlangan itemni ko'rib chiqish uchun avatarda vaqtinchalik kiyish
  const previewItem = getShopItem(previewItemId);

  const previewEquipped = previewItem
    ? { ...equipped, [previewItem.category]: previewItem.id }
    : equipped;

  const buyItem = (item) => {
    if (owned.has(item.id)) {
      equipItem(item);
      return;
    }
    if (state.coins < item.price) {
      showToast(`Tangalar yetarli emas! Yana ${item.price - state.coins} 🪙 kerak`, 'error');
      return;
    }
    dispatch({ type: 'BUY_SHOP_ITEM', payload: item.id });
    dispatch({ type: 'EQUIP_SHOP_ITEM', payload: item.id });
    setPreviewItemId(item.id);
    if (item.rarity === 'afsonaviy') setBurst(b => b + 1);
    showToast(`${item.name} xarid qilindi! 🎉`);
  };

  const equipItem = (item) => {
    if (!owned.has(item.id)) return;
    dispatch({ type: 'EQUIP_SHOP_ITEM', payload: item.id });
    setPreviewItemId(item.id);
    showToast(`${item.name} kiyildi ✨`);
  };

  const clearPreview = () => setPreviewItemId(null);

  const filtered = activeCat === 'all'
    ? SHOP_ITEMS
    : SHOP_ITEMS.filter(i => i.category === activeCat);

  const stats = {
    ownedCount: owned.size,
    totalCount: SHOP_ITEMS.length,
  };

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-5 animate-fadeInUp">
      {/* Sarlavha */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/25 gold-glow">
            <ShoppingBag className="w-6 h-6 text-amber-950" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Qahramon Magazini</h1>
            <p className="text-sm opacity-70">O'zingning qahramoningni tanga bilan bezat! 🪙</p>
          </div>
        </div>

        {/* Tanga balansi */}
        <div className="flex items-center gap-2 badge badge-primary badge-lg p-3 border-0 shadow-lg shadow-primary/20">
          <Coins className="w-5 h-5 animate-coin-spin" />
          <span className="font-bold text-lg">{state.coins}</span>
          <span className="text-xs opacity-70">🪙 balans</span>
        </div>

        {/* Admin rejimi — hamma narsa tekin */}
        {state.isAdmin && (
          <div className="flex items-center gap-2 badge badge-secondary badge-lg p-3 border-0 shadow-lg shadow-secondary/20">
            <Sparkles className="w-4 h-4" />
            <span className="font-bold text-sm">Admin — hamma narsa tekin</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 items-start">
        {/* ===== Avatar ko'rinishi ===== */}
        <div className="lg:sticky lg:top-20">
          <div className="card bg-base-100 border border-base-300 overflow-hidden shadow-xl">
            <div className="relative bg-gradient-to-b from-primary/15 via-base-200 to-base-200 p-6 flex flex-col items-center">
              {/* Orqa fon yulduzlari */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                <span className="absolute top-4 left-8 text-lg">✦</span>
                <span className="absolute top-16 right-10 text-sm">✧</span>
                <span className="absolute bottom-20 left-6 text-sm">✦</span>
                <span className="absolute bottom-8 right-16 text-lg">✧</span>
              </div>

              <HeroAvatar equipped={previewEquipped} size={190} animate={!previewItem} previewNote={previewItem ? 'Ko\'rib chiqish' : null} />

              {previewItem && (
                <button
                  onClick={clearPreview}
                  className="absolute top-3 right-3 btn btn-ghost btn-xs btn-circle bg-base-100/70 backdrop-blur"
                  title="Ko'rib chiqishni yopish"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="card-body p-4 gap-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" /> Kiyilgan narsalar
                </h3>
                <span className="text-xs opacity-60">{stats.ownedCount}/{stats.totalCount} to'plangan</span>
              </div>

              {/* Kiyilgan narsalar ro'yxati */}
              <div className="space-y-1.5 text-sm">
                {SHOP_CATEGORIES.map(cat => {
                  const item = getShopItem(equipped[cat.id]);
                  return (
                    <div key={cat.id} className="flex items-center justify-between rounded-xl bg-base-200/60 px-3 py-1.5 border border-base-300/60">
                      <span className="flex items-center gap-2 opacity-80">
                        <span>{cat.icon}</span>
                        <span className="text-xs">{cat.name}</span>
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-xs">
                        {item?.emoji} {item?.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {previewItem && (
                <div className="alert alert-info py-2 text-xs">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>
                    <b>{previewItem.name}</b> — {owned.has(previewItem.id) ? 'kiyish mumkin' : 'xarid qilinsa kiyish mumkin'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Qanday tanga topiladi */}
          <div className="card bg-base-100 border border-base-300 mt-4 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide opacity-60 mb-2">🪙 Tanga qayerdan topiladi?</h4>
            <ul className="text-xs space-y-1.5 opacity-80">
              <li className="flex justify-between"><span>Darsda to'g'ri javob</span><b>+15</b></li>
              <li className="flex justify-between"><span>Kunlik vazifa</span><b>+25..50</b></li>
              <li className="flex justify-between"><span>Yutuqlar</span><b>+50..1000</b></li>
            </ul>
          </div>
        </div>

        {/* ===== Itemlar ===== */}
        <div className="space-y-4">
          {/* Kategoriyalar */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCat('all')}
              className={`btn btn-sm ${activeCat === 'all' ? 'btn-primary' : 'btn-ghost bg-base-100 border border-base-300'}`}
            >
              🛍️ Barchasi
            </button>
            {SHOP_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`btn btn-sm ${activeCat === cat.id ? 'btn-primary' : 'btn-ghost bg-base-100 border border-base-300'}`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* Itemlar grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map(item => {
              const isOwned = owned.has(item.id);
              const isEquipped = equipped[item.category] === item.id;
              // Admin uchun hamma narsa tekin — tanga talab qilinmaydi
              const canAfford = state.isAdmin || state.coins >= item.price;
              const meta = rarityCard(item);
              const isPreview = previewItemId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setPreviewItemId(item.id)}
                  className={`
                    card card-shine bg-base-100 border cursor-pointer transition-all duration-300
                    hover:-translate-y-1 hover:shadow-xl
                    ${meta.cardRing}
                    ${isPreview ? 'ring-2 ring-primary shadow-lg' : ''}
                    ${isEquipped ? 'ring-1 ring-success/60' : ''}
                  `}
                >
                  <figure className="p-4 pb-1 flex flex-col items-center gap-2 bg-base-200/50">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl ${isEquipped ? 'bg-success/10' : 'bg-base-100'} border ${isEquipped ? 'border-success/40' : 'border-base-300'} shadow-inner`}>
                      <span className={isEquipped ? '' : ''}>{item.emoji}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`badge badge-xs ${meta.badge} gap-1`}>{meta.name}</span>
                      {isEquipped && (
                        <span className="badge badge-xs badge-success gap-1">
                          <Check className="w-2.5 h-2.5" /> Kiyilgan
                        </span>
                      )}
                    </div>
                  </figure>

                  <div className="card-body p-3 gap-2">
                    <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>

                    {isOwned ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); equipItem(item); }}
                        disabled={isEquipped}
                        className={`btn btn-sm w-full ${isEquipped ? 'btn-ghost opacity-60 cursor-default' : 'btn-success'}`}
                      >
                        {isEquipped ? (
                          <><Check className="w-4 h-4" /> Kiyilgan</>
                        ) : (
                          <>Kiyish</>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); buyItem(item); }}
                        disabled={!canAfford}
                        className={`btn btn-sm w-full gap-1.5 ${canAfford ? 'btn-primary' : 'btn-outline opacity-50'}`}
                        title={canAfford ? '' : 'Tangalar yetarli emas'}
                      >
                        {state.isAdmin ? <Sparkles className="w-3.5 h-3.5" /> : canAfford ? <Coins className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        <span>{state.isAdmin ? 'Tekin' : item.price}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="card bg-base-100 border border-base-300 p-10 text-center opacity-60">
              Bu bo'limda hozircha narsa yo'q.
            </div>
          )}
        </div>
      </div>

      {/* ===== Toast ===== */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] badge badge-lg p-4 gap-2 shadow-2xl animate-bounceIn ${toast.kind === 'error' ? 'badge-error' : 'badge-success'}`}>
          {toast.kind === 'error' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          <span className="whitespace-nowrap">{toast.msg}</span>
        </div>
      )}

      {/* Afsonaviy xarid uchun konfetti */}
      {burst > 0 && <ConfettiBurst key={burst} />}
    </div>
  );
}

function ConfettiBurst() {
  const pieces = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      color: ['#fbbf24', '#f472b6', '#22d55e', '#38bdf8', '#a78bfa', '#f87171'][i % 6],
      dur: 2.2 + Math.random() * 1.2,
    }))
  , []);
  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece rounded-sm"
          style={{
            left: `${p.left}%`,
            background: p.color,
            width: 8 + (i % 3) * 3,
            height: 8 + (i % 3) * 3,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
