import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { languages } from '../data/languages';
import { useSiteConfig, DEFAULT_CONFIG } from '../data/siteConfig';
import { useI18n } from '../i18n';
import {
  FaBookOpen as BookOpen, FaHeadphones as Headphones, FaPencilAlt as Pencil,
  FaMicrophone as Mic, FaArrowRight as ArrowRight, FaChartLine as TrendingUp,
  FaAward as Award, FaUsers as Users, FaMagic as Sparkles,
  FaCoins as Coins, FaShieldAlt as Shield, FaTrophy as Trophy, FaFire as Flame,
  FaGraduationCap as GraduationCap, FaSearch as Search, FaTimes as X,
  FaGlobe as Globe,
} from 'react-icons/fa';
import StypingAdBanner from '../components/StypingAdBanner';
import Flag from '../components/Flag';

const features = [
  { icon: GraduationCap, titleKey: 'home.feature.alifbo', descKey: 'home.feature.alifboDesc' },
  { icon: BookOpen, titleKey: 'home.feature.reading', descKey: 'home.feature.readingDesc' },
  { icon: Headphones, titleKey: 'home.feature.listening', descKey: 'home.feature.listeningDesc' },
  { icon: Pencil, titleKey: 'home.feature.writing', descKey: 'home.feature.writingDesc' },
  { icon: Mic, titleKey: 'home.feature.speaking', descKey: 'home.feature.speakingDesc' },
];

// Region filtering groups for 135+ languages
const REGIONS = [
  { id: 'all', labelKey: 'home.regions.all' },
  { id: 'popular', labelKey: 'home.regions.popular' },
  { id: 'europe', labelKey: 'home.regions.europe' },
  { id: 'asia', labelKey: 'home.regions.asia' },
  { id: 'africa', labelKey: 'home.regions.africa' },
  { id: 'americas', labelKey: 'home.regions.americas' },
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
  const { t } = useI18n();
  const config = useSiteConfig();
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('all');

  // Admin sozlagan bo'lsa — sozlangan matn, aks holda tanlangan til tarjimasi
  const heroText = (key, fallback) => {
    const v = config?.texts?.[key];
    const def = DEFAULT_CONFIG.texts[key];
    return v && v !== def ? v : fallback;
  };

  const handleLanguageSelect = (langId) => {
    dispatch({ type: 'SELECT_LANGUAGE', payload: langId });
  };

  // AI ustozni darhol ochish: English tanlab, suhbatni boshlaymiz
  const openAITutor = () => {
    if (!state.selectedLanguage) {
      dispatch({ type: 'SELECT_LANGUAGE', payload: 'english' });
    }
    if (!state.isTutorOpen) {
      dispatch({ type: 'TOGGLE_TUTOR' });
    }
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
      <div className="aurora-bg relative">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-20 left-10 text-6xl animate-float">🌍</div>
          <div className="absolute top-40 right-20 text-5xl animate-float" style={{ animationDelay: '1s' }}>🗣️</div>
          <div className="absolute bottom-40 left-1/4 text-4xl animate-float" style={{ animationDelay: '2s' }}>📚</div>
          <div className="absolute bottom-20 right-1/3 text-5xl animate-float" style={{ animationDelay: '0.5s' }}>✨</div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-20">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="badge badge-primary badge-lg gap-2 px-4 py-3 shadow-lg shadow-primary/20 gold-glow animate-[fadeInUp_0.5s_ease-out]">
                <Sparkles className="w-4 h-4 animate-coin-spin" />
                {heroText('heroBadge', t('home.heroBadge'))}
              </div>
            </div>
            <h1 className="text-4xl md:text-7xl font-extrabold mb-4 font-display tracking-tight animate-[fadeInUp_0.6s_ease-out]">
              <span className="gold-text">
                {heroText('heroTitle', t('home.heroTitle'))}
              </span>
            </h1>
            <p className="text-lg md:text-xl opacity-70 max-w-2xl mx-auto mb-8 animate-[fadeInUp_0.7s_ease-out]">
              {heroText('heroSubtitle', t('home.heroSubtitle'))}
            </p>

            {/* CTA tugmalari */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8 animate-[fadeInUp_0.8s_ease-out]">
              <button
                onClick={() => document.getElementById('languages')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="btn btn-primary btn-lg rounded-full px-8 shadow-lg shadow-primary/30 hover:scale-105 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 gap-2"
              >
                🚀 {t('home.startLearning')}
              </button>
              <button
                onClick={openAITutor}
                className="btn btn-lg rounded-full px-8 border border-secondary/40 bg-gradient-to-r from-violet-500/15 to-fuchsia-500/15 backdrop-blur-sm text-base-content gap-2 hover:scale-105 hover:border-secondary/70 hover:shadow-lg hover:shadow-fuchsia-500/20 transition-all duration-300"
              >
                🤖 {t('home.tryTutor')}
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {[
                { icon: Users, text: t('home.statsLearners'), color: '#8b5cf6' },
                { icon: Globe, text: t('home.statsLanguages', { n: languages.length }), color: '#8b5cf6' },
                { icon: Shield, text: t('home.statsLessons'), color: '#8b5cf6' },
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
                    <span className="text-sm">{t('home.completedLessons', { n: totalCompletedLessons })}</span>
                  </div>
                )}
                {state.streak > 0 && (
                  <div className="flex items-center gap-2 bg-warning/5 px-4 py-2 rounded-xl border border-warning/10">
                    <Flame className="w-4 h-4 text-warning" />
                    <span className="text-sm">{t('home.streakDays', { n: state.streak })}</span>
                  </div>
                )}
                {achievementsUnlocked > 0 && (
                  <div className="flex items-center gap-2 bg-accent/5 px-4 py-2 rounded-xl border border-accent/10">
                    <Award className="w-4 h-4 text-accent" />
                    <span className="text-sm">{t('home.achievementsCount', { n: achievementsUnlocked })}</span>
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
                  placeholder={t('home.searchPlaceholder', { n: languages.length })}
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
                  {t(r.labelKey)}
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
              <h3 className="font-bold text-xl mb-1">{t('home.notFound')}</h3>
              <p className="text-sm opacity-60 mb-4">{t('home.notFoundDesc', { q: search })}</p>
              <button
                onClick={() => { setSearch(''); setRegion('all'); }}
                className="btn btn-primary btn-sm"
              >
                {t('home.clearFilter')}
              </button>
            </div>
          ) : (
            <div id="languages" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 scroll-mt-24">
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
                    className="card gold-border-card glow-hover group text-left animate-[fadeIn_0.5s_ease-out] card-shine"
                    style={{ animationDelay: `${Math.min(index, 20) * 30}ms` }}
                  >
                    <div className="card-body p-5">
                      <div className="flex items-center justify-between mb-3">
                        <Flag lang={lang} size={52} className="drop-shadow-md" />
                        <span className="badge badge-ghost badge-sm bg-white/[0.04] border-white/10">
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
                          <span>{t('home.lessons', { n: `${completedCount}/${totalLessons}` })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-primary">
                            {t(completedCount === 0 ? 'home.startFromAlphabet' : 'home.continue')}
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

          {/* AI ustoz banneri — yangi vibrant promo */}
          <div className="mt-8">
            <div className="relative overflow-hidden rounded-3xl glass-panel-strong border border-secondary/30 gold-glow glow-hover">
              {/* Gradient blobs */}
              <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-fuchsia-500/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '28px 28px' }} />

              <div className="relative p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                {/* Robot ikonka */}
                <div className="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-fuchsia-500/40 animate-float">
                  <span className="text-4xl md:text-5xl">🤖</span>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-extrabold font-display mb-2">
                    <span className="gold-text">{t('home.aiBannerTitle')}</span>
                  </h3>
                  <p className="text-sm md:text-base opacity-70 max-w-2xl mb-4">
                    {t('home.aiBannerDesc')}
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <button
                      onClick={openAITutor}
                      className="btn btn-primary rounded-full px-6 gap-2 shadow-lg shadow-primary/30 hover:scale-105 transition-all duration-300"
                    >
                      ✨ {t('home.aiTry')}
                    </button>
                    <span className="badge badge-ghost gap-1.5 px-4 py-3 border border-base-300/60 bg-base-200/40 text-xs">
                      {t('home.aiTip')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-base-300/30 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {heroText('featureTitle', t('home.featureTitle'))}
            </span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="card glass-panel glow-hover group"
              >
                <div className="card-body items-center text-center p-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#8b5cf6]/25 to-[#d946ef]/10 border border-[#8b5cf6]/25 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <feature.icon className="w-7 h-7 text-[#c4b5fd]" />
                  </div>
                  <h3 className="font-bold">{t(feature.titleKey)}</h3>
                  <p className="text-xs opacity-60">{t(feature.descKey)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Achievement preview */}
          <div className="mt-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award className="w-6 h-6 text-warning animate-coin-spin" />
              <h3 className="text-xl font-bold">{t('home.achievementsTitle')}</h3>
            </div>
            <p className="text-sm opacity-60 mb-6 max-w-lg mx-auto">
              {heroText('featureDesc', t('home.featureDesc'))}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {[
                { icon: '🌱', titleKey: 'home.ach.firstStep', descKey: 'home.ach.firstStepDesc' },
                { icon: '🔥', titleKey: 'home.ach.consistency', descKey: 'home.ach.consistencyDesc' },
                { icon: '👑', titleKey: 'home.ach.polyglot', descKey: 'home.ach.polyglotDesc' },
                { icon: '🏆', titleKey: 'home.ach.coinLegend', descKey: 'home.ach.coinLegendDesc' },
              ].map((item, i) => (
                <div key={i} className="glass-panel rounded-xl p-4 glow-hover">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="font-bold text-sm">{t(item.titleKey)}</p>
                  <p className="text-xs opacity-50">{t(item.descKey)}</p>
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
            {heroText('footerText', t('home.footerText'))}
          </p>
          <p className="text-xs opacity-30 mt-2">
            {t('home.allRights')}
          </p>
        </div>
      </footer>
    </div>
  );
}
