import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { languages } from '../data/languages';
import { useSiteConfig, getSiteText } from '../data/siteConfig';
import {
  FaBookOpen as BookOpen, FaHeadphones as Headphones, FaPencilAlt as Pencil,
  FaMicrophone as Mic, FaArrowRight as ArrowRight, FaChartLine as TrendingUp,
  FaAward as Award, FaUsers as Users, FaMagic as Sparkles,
  FaCoins as Coins, FaShieldAlt as Shield, FaTrophy as Trophy, FaFire as Flame,
  FaGraduationCap as GraduationCap, FaSearch as Search, FaTimes as X,
  FaGlobe as Globe,
} from 'react-icons/fa';
import StypingAdBanner from '../components/StypingAdBanner';

const features = [
  { icon: GraduationCap, title: 'Alifbo', desc: "Harflarni o'rganish" },
  { icon: BookOpen, title: 'Reading', desc: "Matn o'qish va tushunish" },
  { icon: Headphones, title: 'Listening', desc: 'Tinglab tushunish' },
  { icon: Pencil, title: 'Writing', desc: 'Yozma mashqlar' },
  { icon: Mic, title: 'Speaking', desc: 'Talaffuz mashqi' },
];

// Region filtering groups for 135+ languages
const REGIONS = [
  { id: 'all', label: '🌍 Barchasi' },
  { id: 'popular', label: '🔥 Ommabop' },
  { id: 'europe', label: '🇪🇺 Yevropa' },
  { id: 'asia', label: '🌏 Osiyo' },
  { id: 'africa', label: '🌍 Afrika' },
  { id: 'americas', label: '🌎 Amerika' },
];

const POPULAR_IDS = new Set([
  'english', 'spanish', 'french', 'german', 'russian', 'uzbek',
  'korean', 'japanese', 'chinese', 'arabic', 'hindi', 'turkish',
  'italian', 'portuguese', 'persian', 'urdu', 'indonesian',
]);

const REGION_IDS = {
  europe: new Set([
    'english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'russian',
    'polish', 'swedish', 'norwegian', 'danish', 'finnish', 'greek', 'romanian',
    'czech', 'ukrainian', 'dutch', 'hungarian', 'croatian', 'serbian', 'bosnian',
    'slovenian', 'slovak', 'estonian', 'latvian', 'lithuanian', 'icelandic',
    'irish', 'maltese', 'albanian', 'macedonian', 'belarusian', 'bulgarian',
    'welsh', 'scottish', 'basque', 'catalan', 'galician', 'occitan', 'breton',
    'corsican', 'frisian', 'luxembourgish', 'feroese', 'sami', 'sorbian',
    'romani', 'latin', 'esperanto', 'zazaki',
  ]),
  asia: new Set([
    'korean', 'japanese', 'chinese', 'arabic', 'hindi', 'turkish', 'thai',
    'vietnamese', 'indonesian', 'hebrew', 'uzbek', 'kazakh', 'kyrgyz', 'tajik',
    'turkmen', 'azerbaijani', 'armenian', 'georgian', 'urdu', 'bengali',
    'punjabi', 'marathi', 'tamil', 'telugu', 'kannada', 'malayalam', 'gujarati',
    'odia', 'nepali', 'sinhala', 'burmese', 'khmer', 'lao', 'malay', 'filipino',
    'mongolian', 'persian', 'pashto', 'kurdish', 'uyghur', 'cantonese',
    'taiwanese', 'kashmiri', 'sindhi', 'assamese', 'divehi', 'tibetan',
    'tamazight', 'konkani', 'manipuri', 'balochi', 'ainu',
  ]),
  africa: new Set([
    'swahili', 'amharic', 'somali', 'hausa', 'yoruba', 'igbo', 'zulu', 'xhosa',
    'afrikaans', 'shona', 'kinyarwanda', 'malagasy', 'wolof', 'twi', 'bambara',
    'tigrinya', 'oromo',
  ]),
  americas: new Set([
    'quechua', 'guarani', 'aymara', 'haitian', 'inuktitut', 'navajo',
    'hawaiian', 'mapudungun', 'jamaican', 'cree', 'nahuatl', 'maori',
    'samoan', 'tongan', 'fijian', 'tahitian',
  ]),
};

export default function HomePage() {
  const { state, dispatch } = useApp();
  const config = useSiteConfig();
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('all');

  const handleLanguageSelect = (langId) => {
    dispatch({ type: 'SELECT_LANGUAGE', payload: langId });
  };

  // Calculate total stats
  const totalCompletedLessons = Object.values(state.progress).filter(p => p.completed).length;
  const achievementsUnlocked = state.achievements?.filter(a => a.unlocked)?.length || 0;

  // Filter languages by search + region
  const filteredLanguages = useMemo(() => {
    const q = search.trim().toLowerCase();
    return languages.filter(lang => {
      if (region === 'popular' && !POPULAR_IDS.has(lang.id)) return false;
      if (region === 'europe' && !REGION_IDS.europe.has(lang.id)) return false;
      if (region === 'asia' && !REGION_IDS.asia.has(lang.id)) return false;
      if (region === 'africa' && !REGION_IDS.africa.has(lang.id)) return false;
      if (region === 'americas' && !REGION_IDS.americas.has(lang.id)) return false;
      if (q) {
        const hay = `${lang.name} ${lang.description} ${lang.id}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [search, region]);

  const regionCounts = {
    popular: POPULAR_IDS.size,
    europe: REGION_IDS.europe.size,
    asia: REGION_IDS.asia.size,
    africa: REGION_IDS.africa.size,
    americas: REGION_IDS.americas.size,
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-base-200 via-base-100 to-base-200">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 text-6xl animate-float">🌍</div>
          <div className="absolute top-40 right-20 text-5xl animate-float" style={{ animationDelay: '1s' }}>🗣️</div>
          <div className="absolute bottom-40 left-1/4 text-4xl animate-float" style={{ animationDelay: '2s' }}>📚</div>
          <div className="absolute bottom-20 right-1/3 text-5xl animate-float" style={{ animationDelay: '0.5s' }}>✨</div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="badge badge-primary badge-lg gap-2 px-4 py-3 shadow-lg shadow-primary/20">
                <Sparkles className="w-4 h-4" />
                {getSiteText(config, 'heroBadge', 'Interaktiv til o\u2018rganish')}
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 font-display">
              <span className="gold-text">
                {getSiteText(config, 'heroTitle', '130+ Tilda Erkin Gaplashing')}
              </span>
            </h1>
            <p className="text-lg md:text-xl opacity-70 max-w-2xl mx-auto mb-8">
              {getSiteText(config, 'heroSubtitle', "Reading, Listening, Writing va Speaking — 4 ta asosiy ko'nikmani interaktiv mashqlar orqali rivojlantiring")}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {[
                { icon: Users, text: "550K+ o'quvchilar", color: '#d4af37' },
                { icon: Globe, text: `${languages.length}+ xil til`, color: '#facc15' },
                { icon: Shield, text: '100 ta dars', color: '#d4af37' },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-base-100/70 border border-base-300/70 backdrop-blur-sm shadow-sm hover:border-primary/40 transition-all duration-300"
                >
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                  <span className="font-bold text-sm">{s.text}</span>
                </div>
              ))}
            </div>

            {/* User's personal stats if active */}
            {(totalCompletedLessons > 0 || achievementsUnlocked > 0) && (
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                {(state.coins ?? 0) > 0 && (
                  <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
                    <Coins className="w-4 h-4 text-primary" />
                    <span className="text-sm">{state.coins} 🪙</span>
                  </div>
                )}
                {totalCompletedLessons > 0 && (
                  <div className="flex items-center gap-2 bg-success/5 px-4 py-2 rounded-xl border border-success/10">
                    <Trophy className="w-4 h-4 text-success" />
                    <span className="text-sm">{totalCompletedLessons} ta dars tugallangan</span>
                  </div>
                )}
                {state.streak > 0 && (
                  <div className="flex items-center gap-2 bg-warning/5 px-4 py-2 rounded-xl border border-warning/10">
                    <Flame className="w-4 h-4 text-warning" />
                    <span className="text-sm">{state.streak} kun streak</span>
                  </div>
                )}
                {achievementsUnlocked > 0 && (
                  <div className="flex items-center gap-2 bg-accent/5 px-4 py-2 rounded-xl border border-accent/10">
                    <Award className="w-4 h-4 text-accent" />
                    <span className="text-sm">{achievementsUnlocked} ta yutuq</span>
                  </div>
                )}
              </div>
            )}

            {/* Search bar */}
            <div className="max-w-xl mx-auto mb-5">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`${languages.length} tildan qidiring... (masalan: ingliz, koreys)`}
                  className="input input-bordered w-full pl-12 pr-10 py-3 h-12 rounded-2xl bg-base-100/80 backdrop-blur-sm border-base-300 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all shadow-lg shadow-black/5"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Region filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {REGIONS.map(r => (
                <button
                  key={r.id}
                  onClick={() => setRegion(r.id)}
                  className={`btn btn-xs rounded-full gap-1.5 px-3.5 transition-all duration-300 ${
                    region === r.id
                      ? 'btn-primary text-white shadow-md shadow-primary/20'
                      : 'btn-ghost border border-base-300 hover:border-primary/40'
                  }`}
                >
                  {r.label}
                  {r.id !== 'all' && (
                    <span className={`text-[10px] ${region === r.id ? 'opacity-80' : 'opacity-40'}`}>
                      ({regionCounts[r.id]})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Language Cards Grid */}
          {filteredLanguages.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🔍</div>
              <h3 className="font-bold text-xl mb-1">Hech narsa topilmadi</h3>
              <p className="text-sm opacity-60 mb-4">"{search}" bo'yicha til topilmadi</p>
              <button
                onClick={() => { setSearch(''); setRegion('all'); }}
                className="btn btn-primary btn-sm"
              >
                Filtrni tozalash
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredLanguages.map((lang, index) => {
                // Count completed lessons for this language
                const langLessonKeys = Object.keys(state.progress).filter(k =>
                  k.startsWith(`${lang.id}-lesson-`) && state.progress[k]?.completed
                );
                const completedCount = langLessonKeys.length;
                const totalLessons = 100;

                return (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageSelect(lang.id)}
                    className="card bg-base-100 border border-base-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group text-left animate-[fadeIn_0.5s_ease-out] card-shine"
                    style={{ animationDelay: `${Math.min(index, 20) * 30}ms` }}
                  >
                    <div className="card-body p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-4xl drop-shadow-sm">{lang.flag}</span>
                        <span className="badge badge-ghost badge-sm">
                          {Math.round((completedCount / totalLessons) * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-bold">{lang.name}</h2>
                      </div>
                      <p className="text-xs opacity-60 mb-3">{lang.description}</p>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-base-200 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            completedCount > 0 ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-base-300'
                          }`}
                          style={{ width: `${(completedCount / totalLessons) * 100}%` }}
                        />
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs opacity-50">
                          <TrendingUp className="w-3 h-3" />
                          <span>{completedCount}/{totalLessons} dars</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-primary">
                            {completedCount === 0 ? 'Alifbodan boshlang' : 'Davom etish'}
                          </span>
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all text-primary" />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* STyping.uz reklama paneli */}
          <div className="mt-8">
            <StypingAdBanner />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-base-300/30 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {getSiteText(config, 'featureTitle', "5 ta Asosiy Bo'lim")}
            </span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="card bg-base-100 border border-base-300 hover:border-primary/30 hover:shadow-md transition-all duration-300 group"
              >
                <div className="card-body items-center text-center p-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold">{feature.title}</h3>
                  <p className="text-xs opacity-60">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Achievement preview */}
          <div className="mt-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award className="w-6 h-6 text-warning" />
              <h3 className="text-xl font-bold">Yutuqlar va Statistika</h3>
            </div>
            <p className="text-sm opacity-60 mb-6 max-w-lg mx-auto">
              {getSiteText(config, 'featureDesc', "Mashqlarni bajarib, yutuqlarni oching, tanga yig'ing va boshqa o'quvchilar bilan raqobatlashing!")}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {[
                { icon: '🌱', title: 'Birinchi Qadam', desc: '1-mashq' },
                { icon: '🔥', title: 'Izchillik', desc: '3 kun streak' },
                { icon: '👑', title: 'Poliglot', desc: '100 ta dars' },
                { icon: '🏆', title: 'Tanga Legendasi', desc: '5000 tanga' },
              ].map((item, i) => (
                <div key={i} className="bg-base-100 rounded-xl p-4 border border-base-300 hover:border-primary/30 transition-all">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="font-bold text-sm">{item.title}</p>
                  <p className="text-xs opacity-50">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-base-300/30 py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img
              src="/logo.png"
              alt="Lingohub"
              className="w-7 h-7 rounded-md object-cover"
            />
            <span className="font-bold">Lingohub</span>
          </div>
          <p className="text-xs opacity-50">
            {getSiteText(config, 'footerText', "130+ tilda interaktiv o'rganish platformasi. Reading, Listening, Writing, Speaking.")}
          </p>
          <p className="text-xs opacity-30 mt-2">
            © 2026 Lingohub. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </footer>
    </div>
  );
}
