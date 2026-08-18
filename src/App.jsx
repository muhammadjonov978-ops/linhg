import { useState, useEffect, lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SubscriptionGate from './components/SubscriptionGate';
import { languages } from './data/languages';
import { startPresence, stopPresence } from './utils/presence';
import { startVisitsTracking } from './utils/visits';

// SEO: clean URL'lar (/english, /english/beginner) uchun dastlabki yo'lni
// hash-router holatiga aylantiramiz (vercel.json SPA fallback orqali ishlaydi).
const SEO_LEVEL_LESSON = {
  beginner: 1,
  elementary: 26,
  'pre-intermediate': 51,
  advanced: 76,
};

const DEFAULT_TITLE = "Lingohub — 130+ Tilda Bepul Til O'rganing | Online Til Kursi";
const DEFAULT_DESCRIPTION = "Lingohub — interaktiv 130+ tilda bepul til o'rganish platformasi. Ingliz tili, koreys, yapon, xitoy, o'zbek va boshqa tillarni alifbo, reading, listening, writing va speaking mashqlari bilan o'rganing. Bepul onlayn til kursi.";

// ===== CODE-SPLITTING =====
// Bosh sahifa tez ochilishi uchun faqat kerakli qismlar darhol yuklanadi,
// qolgan barcha sahifa/vidjetlar kerak bo'lganda (lazy) yuklanadi.
// Natijada dastlabki JS bundle 1.12 MB → ~500 KB gacha tushadi.
const AITutor = lazy(() => import('./components/AITutor'));
const AchievementsPanel = lazy(() => import('./components/AchievementsPanel'));
const DailyChallenge = lazy(() => import('./components/DailyChallenge'));
const DailyBonus = lazy(() => import('./components/DailyBonus'));
const StatsDashboard = lazy(() => import('./components/StatsDashboard'));
const WordOfTheDay = lazy(() => import('./components/WordOfTheDay'));
const MistakesReview = lazy(() => import('./components/MistakesReview'));
const StreakCalendar = lazy(() => import('./components/StreakCalendar'));
const SMSReminder = lazy(() => import('./components/SMSReminder'));
const LiveVisitorsBadge = lazy(() => import('./components/LiveVisitorsBadge'));
const LanguageDashboard = lazy(() => import('./pages/LanguageDashboard'));
const LevelPage = lazy(() => import('./pages/LevelPage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const Leaderboard = lazy(() => import('./components/Leaderboard'));
const Flashcards = lazy(() => import('./components/Flashcards'));
const WeeklyReport = lazy(() => import('./components/WeeklyReport'));
const TournamentPage = lazy(() => import('./pages/TournamentPage'));
const PlacementTest = lazy(() => import('./pages/PlacementTest'));
const GrammarPage = lazy(() => import('./pages/GrammarPage'));
const DictionaryPage = lazy(() => import('./pages/DictionaryPage'));
const MissionsPage = lazy(() => import('./pages/MissionsPage'));
const ReferralPage = lazy(() => import('./pages/ReferralPage'));
const CertificatesPage = lazy(() => import('./pages/CertificatesPage'));

// Lazy-chunk yuklanayotganda ko'rsatiladigan yengil loader
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  );
}
import { hasGatePassed } from './lib/gate';
import { registerServiceWorker, maybeShowDailyReminder } from './lib/notifications';
import { claimInviteBonus, syncInviteToCloud } from './lib/referral';
import { sendStatEvent, getServerUid } from './lib/server';
import {
  FaCommentDots as MessageCircle, FaTimes as X, FaMagic as Sparkles,
  FaColumns as PanelRightOpen, FaBars as MenuIcon,
} from 'react-icons/fa';

// Saytning animatsion orqa foni (body::before/::after CSS orqali) — yogish/o'chirish
const ANIMATED_BG_KEY = 'lingohub_animated_bg';
function applyAnimatedBg() {
  try {
    const enabled = localStorage.getItem(ANIMATED_BG_KEY) !== 'off';
    document.documentElement.classList.toggle('animated-bg-off', !enabled);
  } catch { /* noop */ }
}

function AppContent() {
  const { state, dispatch } = useApp();
  const [showSidebar, setShowSidebar] = useState(false);

  // SEO: /english yoki /english/beginner kabi clean URL'lar bilan kelganda
  // tegishli til/darsni ochamiz (faqat birinchi yuklanishda).
  useEffect(() => {
    const path = window.location.pathname;
    if (!path || path === '/') return;
    const parts = path.split('/').filter(Boolean);
    const first = (parts[0] || '').toLowerCase();
    if (languages.some((l) => l.id === first)) {
      dispatch({ type: 'SELECT_LANGUAGE', payload: first });
      if (parts[1] && SEO_LEVEL_LESSON[parts[1]]) {
        dispatch({ type: 'SET_CURRENT_LEVEL', payload: `lesson-${SEO_LEVEL_LESSON[parts[1]]}` });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SEO: tanlangan tilga qarab sahifa title/description/canonical yangilanadi
  // (Google har bir til sahifasini alohida ko'rsatishi uchun).
  useEffect(() => {
    const lang = languages.find((l) => l.id === state.selectedLanguage);
    let title = DEFAULT_TITLE;
    let description = DEFAULT_DESCRIPTION;
    let canonical = `${window.location.origin}/`;
    if (lang) {
      title = `${lang.name} tilini bepul o'rganing | Lingohub`;
      description = `${lang.name} tilini interaktiv o'rganing — alifbo, reading, listening, writing va speaking mashqlari bilan. Bepul onlayn til kursi.`;
      canonical = `${window.location.origin}/${lang.id}`;
    }
    document.title = title;
    try {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', description);
      const link = document.querySelector('link[rel="canonical"]');
      if (link) link.setAttribute('href', canonical);
    } catch { /* noop */ }
  }, [state.selectedLanguage]);
  // Obuna shlyuzi — saytga kirishdan oldin kanallarga obuna talab qilinadi.
  // Adminlar ham ko'radi — o'z tugmasi bilan 1 bosishda o'tadi.
  const [gatePassed, setGatePassed] = useState(() => hasGatePassed());

  // AI Tutor ochiq-yopiq holati faqat context'da saqlanadi (state.isTutorOpen).
  // Ilgari local state ham bor edi — AITutor ichidagi X tugmasi bosilganda
  // local state o'zgarmas, context o'zgarardi va suzuvchi tugma qaytib chiqmasdi.
  const isTutorOpen = state.isTutorOpen;

  // Minimal hash router: #/admin opens the admin panel
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Count this visitor as 'site' while on the main app + record visit stats
  useEffect(() => {
    startPresence('site');
    startVisitsTracking();
    // PWA service worker ro'yxatdan o'tkazish (offline + push)
    registerServiceWorker();
    // Serverga tashrifni qayd qilish (o'yinlashtirish).
    // Reyting ballini AppContext o'zi yuboradi (debounced — state o'zgarganda).
    sendStatEvent('visit', { uid: getServerUid() });
    return () => stopPresence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kunlik eslatma: bugun dars qilinmagan bo'lsa — streak ogohlantirishi
  useEffect(() => {
    const studiedToday = Object.values(state.progress).some(
      (p) => p.timestamp && Date.now() - p.timestamp < 86400000
    );
    const timer = setTimeout(() => {
      maybeShowDailyReminder({
        streak: state.streak,
        studiedToday,
        todayLabel: new Date().toLocaleDateString('uz-UZ', { weekday: 'long' }),
      });
    }, 8000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animatsion fonni qo'llash (sozlamalar o'zgarganda ham sinxronlash)
  useEffect(() => {
    applyAnimatedBg();
    const onStorage = (e) => {
      if (e.key === ANIMATED_BG_KEY) applyAnimatedBg();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Taklif (referral) bonusi: ?ref=CODE bilan kelganda +50 tanga (bir marta)
  useEffect(() => {
    const { granted, inviterCode } = claimInviteBonus();
    if (granted) {
      dispatch({ type: 'ADD_COINS', payload: 50 });
      if (inviterCode) syncInviteToCloud(inviterCode);
      // Toast ko'rsatish
      const toast = document.createElement('div');
      toast.className = 'fixed top-20 right-4 z-[200] px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold shadow-2xl animate-[fadeInUp_0.4s_ease-out]';
      toast.textContent = '🎉 Do\'stingiz taklifi uchun +50 tanga!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Admin panel route — shlyuzdan mustaqil (o'z login tizimiga ega)
  if (hash.startsWith('#/admin')) {
    return (
      <Suspense fallback={<PageLoader />}>
        <AdminPanel />
      </Suspense>
    );
  }

  // Obuna shlyuzi — kanallarga obuna bo'lmaganlar uchun sayt bloklanadi
  if (!gatePassed) {
    return <SubscriptionGate onPass={() => setGatePassed(true)} />;
  }

  // Portfolio route (shown inside the app shell with the navbar)
  const showPortfolio = hash.startsWith('#/portfolio');

  // Magazin route (shop — qahramon kiyimlari, tanga bilan xarid)
  const showShop = hash.startsWith('#/shop');

  // Yangi route'lar
  const showLeaderboard = hash.startsWith('#/leaderboard');
  const showTournament = hash.startsWith('#/tournament');
  const showFlashcards = hash.startsWith('#/flashcards');
  const showReport = hash.startsWith('#/report');
  const showPlacement = hash.startsWith('#/placement');
  const showGrammar = hash.startsWith('#/grammar');
  const showDictionary = hash.startsWith('#/dictionary');
  const showMissions = hash.startsWith('#/missions');
  const showReferral = hash.startsWith('#/referral');
  const showCertificates = hash.startsWith('#/certificates');

  // Barcha to'liq sahifa route'lari (sidebar va AI tutor yashiriladi)
  const isFullPageRoute = showPortfolio || showShop || showLeaderboard || showTournament || showFlashcards ||
    showReport || showPlacement || showGrammar || showDictionary || showMissions || showReferral || showCertificates;

  const goHome = () => {
    window.location.hash = '#/';
    dispatch({ type: 'SELECT_LANGUAGE', payload: null });
  };

  const handleToggleTutor = () => {
    dispatch({ type: 'TOGGLE_TUTOR' });
  };

  const handleSelectLevel = (levelId) => {
    dispatch({ type: 'SET_CURRENT_LEVEL', payload: levelId });
  };

  const handleBackToDashboard = () => {
    dispatch({ type: 'SET_CURRENT_LEVEL', payload: null });
  };

  // Routing logic based on state
  const showLevel = state.selectedLanguage && state.currentLevel;
  const showDashboard = state.selectedLanguage && !state.currentLevel;
  const showHome = !state.selectedLanguage;

  return (
    <div className="h-dvh w-full transition-colors duration-300 flex flex-col relative">
      <Navbar onToggleTutor={handleToggleTutor} />

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${!isFullPageRoute && showSidebar && (showDashboard || showHome) ? 'lg:mr-80' : ''}`}>
          <Suspense fallback={<PageLoader />}>
            {showShop && <ShopPage />}
            {showPortfolio && <PortfolioPage />}
            {showLeaderboard && <Leaderboard onBack={goHome} />}
            {showTournament && <TournamentPage onBack={goHome} />}
            {showFlashcards && <Flashcards onBack={goHome} />}
            {showReport && <WeeklyReport onBack={goHome} />}
            {showPlacement && <PlacementTest onBack={goHome} />}
            {showGrammar && <GrammarPage onBack={goHome} />}
            {showDictionary && <DictionaryPage onBack={goHome} />}
            {showMissions && <MissionsPage onBack={goHome} />}
            {showReferral && <ReferralPage onBack={goHome} />}
            {showCertificates && <CertificatesPage onBack={goHome} />}
            {!isFullPageRoute && showHome && <HomePage />}
            {!isFullPageRoute && showDashboard && (
              <LanguageDashboard onSelectLevel={handleSelectLevel} />
            )}
            {!isFullPageRoute && showLevel && (
              <LevelPage onBack={handleBackToDashboard} />
            )}
          </Suspense>
        </main>

        {/* Sidebar with widgets (only on Home and Dashboard) */}
        {!isFullPageRoute && (showDashboard || showHome) && showSidebar && (
          <>
            {/* Mobil qurilmalarda orqa fon qoraytiriladi */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setShowSidebar(false)}
            />
            <aside className="fixed right-0 top-16 h-[calc(100dvh-4rem)] w-80 max-w-[86vw] bg-base-100 border-l border-base-300 overflow-y-auto z-40 shadow-lg animate-[slideIn_0.3s_ease-out]">
            <Suspense fallback={<PageLoader />}>
            <div className="p-4 space-y-4">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h2 className="font-bold text-sm">Qo'shimcha</h2>
                </div>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="btn btn-ghost btn-xs btn-circle"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {showDashboard ? (
                <>
                  {/* Dashboard sidebar widgets */}
                  <DailyBonus />
                  <DailyChallenge />
                  <WordOfTheDay />
                  <StatsDashboard />
                  <AchievementsPanel limit={4} />
                  <MistakesReview />
                  <StreakCalendar />
                </>
              ) : (
                <>
                  {/* Home sidebar widgets */}
                  <DailyBonus />
                  <WordOfTheDay />
                  <DailyChallenge />
                  <StatsDashboard />
                  <AchievementsPanel limit={6} />
                </>
              )}
            </div>
            </Suspense>
            </aside>
          </>
        )}
      </div>

      {/* Sidebar toggle button (on Home and Dashboard) */}
      {!isFullPageRoute && (showDashboard || showHome) && !showSidebar && (
        <button
          onClick={() => setShowSidebar(true)}
          className="fixed right-4 top-20 z-30 btn btn-sm btn-ghost bg-base-100/80 backdrop-blur-sm shadow-sm border border-base-300 hover:bg-base-200 transition-all duration-300"
          title="Panelni ochish"
        >
          <PanelRightOpen className="w-4 h-4 hidden sm:block" />
          <MenuIcon className="w-4 h-4 sm:hidden" />
          <span className="hidden sm:inline text-xs">Widgets</span>
        </button>
      )}

      {/* SMS reminder when a day is missed */}
      <Suspense fallback={null}>
        <SMSReminder />

        {/* Live visitors badge (links to admin panel) */}
        <LiveVisitorsBadge />

        {/* AI Tutor Floating Button */}
        {!isFullPageRoute && state.selectedLanguage && (
          <>
            {!isTutorOpen && (
              <button
                onClick={handleToggleTutor}
                className="fixed bottom-6 right-6 z-40 btn btn-primary btn-circle btn-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-110"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
            )}
            <AITutor />
          </>
        )}
      </Suspense>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
