import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { THEMES } from '../data/themes';
import { FaPalette as Palette, FaCheck as Check, FaRandom as Shuffle, FaSearch as Search } from 'react-icons/fa';
import { LuSparkles, LuSnowflake } from 'react-icons/lu';

export default function ThemePicker() {
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'light' | 'dark'
  const [search, setSearch] = useState('');
  const [animatedBg, setAnimatedBg] = useState(() => {
    try { return localStorage.getItem('lingohub_animated_bg') !== 'off'; } catch { return true; }
  });
  const panelRef = useRef(null);

  const currentTheme = THEMES.find(t => t.id === state.theme) || THEMES[0];

  const toggleAnimatedBg = () => {
    const next = !animatedBg;
    setAnimatedBg(next);
    try {
      localStorage.setItem('lingohub_animated_bg', next ? 'on' : 'off');
      document.documentElement.classList.toggle('animated-bg-off', !next);
    } catch { /* noop */ }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const setTheme = (id) => {
    dispatch({ type: 'SET_THEME', payload: id });
    setOpen(false);
  };

  const pickRandom = () => {
    const random = THEMES[Math.floor(Math.random() * THEMES.length)];
    setTheme(random.id);
  };

  const filtered = THEMES.filter(t => {
    const matchesFilter = filter === 'all' || t.category === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="relative" ref={panelRef}>
      {/* Palette button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`btn btn-ghost btn-sm btn-circle tooltip ${open ? 'bg-primary/20' : ''}`}
        data-tip="Mavzu tanlash"
      >
        <Palette className={`w-4 h-4 ${open ? 'text-primary' : ''}`} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-12 z-[60] w-[22rem] max-w-[92vw] bg-base-100 border border-base-300 rounded-2xl shadow-2xl p-4 animate-slideIn">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              35 xil mavzu
            </h3>
            <button
              onClick={pickRandom}
              className="btn btn-xs btn-primary btn-outline gap-1"
              title="Tasodifiy mavzu"
            >
              <Shuffle className="w-3 h-3" /> Tasodifiy
            </button>
          </div>

          {/* Animatsion fon tugmasi */}
          <button
            onClick={toggleAnimatedBg}
            className={`w-full flex items-center gap-2.5 rounded-xl border px-3 py-2 mb-3 transition-all duration-200 group ${
              animatedBg
                ? 'border-primary/40 bg-primary/10'
                : 'border-base-300 bg-base-200/50 hover:border-base-content/30'
            }`}
            title="Saytning animatsion orqa fonini yogish/o'chirish"
          >
            <span className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${animatedBg ? 'bg-primary/20 text-primary' : 'bg-base-300/60 text-base-content/50'}`}>
              {animatedBg ? <LuSparkles className="w-4.5 h-4.5" /> : <LuSnowflake className="w-4.5 h-4.5" />}
            </span>
            <span className="flex-1 text-left">
              <span className="block text-xs font-bold">Animatsion fon</span>
              <span className="block text-[10px] opacity-50">Aurora + yulduzlar orqa fon</span>
            </span>
            <span
              className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${
                animatedBg ? 'bg-primary' : 'bg-base-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                  animatedBg ? 'left-[18px]' : 'left-0.5'
                }`}
              />
            </span>
          </button>

          {/* Current theme indicator */}
          <div className="flex items-center gap-2 mb-3 p-2 rounded-xl bg-base-200">
            <div data-theme={currentTheme.id} className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-primary border border-base-100" />
              <span className="w-4 h-4 rounded-full bg-secondary border border-base-100" />
              <span className="w-4 h-4 rounded-full bg-accent border border-base-100" />
            </div>
            <span className="text-xs font-semibold">{currentTheme.name}</span>
            <span className="text-[10px] opacity-50 ml-auto">{currentTheme.id}</span>
          </div>

          {/* Search */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mavzu qidirish..."
              className="input input-sm input-bordered w-full pl-8 text-xs"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 mb-3">
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'light', label: "Yorug'" },
              { id: 'dark', label: "Qorong'i" },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`btn btn-xs ${filter === f.id ? 'btn-primary' : 'btn-ghost'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Theme grid with live previews */}
          <div className="grid grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
            {filtered.map(t => {
              const active = t.id === state.theme;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`relative rounded-xl border-2 transition-all duration-200 p-1.5 text-left group ${
                    active
                      ? 'border-primary shadow-lg shadow-primary/20'
                      : 'border-base-300 hover:border-base-content/40 hover:-translate-y-0.5'
                  }`}
                  title={`${t.name} (${t.id})`}
                >
                  {/* Live mini preview using the actual theme */}
                  <div data-theme={t.id} className="rounded-lg overflow-hidden">
                    <div className="h-8 bg-base-100 flex items-center justify-center gap-1 px-1">
                      <span className="w-3 h-3 rounded-full bg-primary border border-base-content/10" />
                      <span className="w-3 h-3 rounded-full bg-secondary border border-base-content/10" />
                      <span className="w-3 h-3 rounded-full bg-accent border border-base-content/10" />
                    </div>
                    <div className="bg-base-200 text-base-content flex items-center justify-between px-1.5 py-0.5">
                      <span className="text-[9px] font-semibold truncate">{t.name}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-success/70 flex-shrink-0" />
                    </div>
                  </div>

                  {active && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-content flex items-center justify-center shadow">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="col-span-4 py-8 text-center text-xs opacity-50">
                Mavzu topilmadi
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
