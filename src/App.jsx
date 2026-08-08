import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import AITutor from './components/AITutor';
import AchievementsPanel from './components/AchievementsPanel';
import DailyChallenge from './components/DailyChallenge';
import StatsDashboard from './components/StatsDashboard';
import WordOfTheDay from './components/WordOfTheDay';
import MistakesReview from './components/MistakesReview';
import StreakCalendar from './components/StreakCalendar';
import HomePage from './pages/HomePage';
import LanguageDashboard from './pages/LanguageDashboard';
import LevelPage from './pages/LevelPage';
import SMSReminder from './components/SMSReminder';
import AdminPanel from './pages/AdminPanel';
import PortfolioPage from './pages/PortfolioPage';
import ShopPage from './pages/ShopPage';
import LiveVisitorsBadge from './components/LiveVisitorsBadge';
import { startPresence, stopPresence } from './utils/presence';
import { startVisitsTracking } from './utils/visits';
import {
  FaCommentDots as MessageCircle, FaTimes as X, FaMagic as Sparkles,
  FaColumns as PanelRightOpen, FaBars as MenuIcon,
} from 'react-icons/fa';

function AppContent() {
  const { state, dispatch } = useApp();
  const [showSidebar, setShowSidebar] = useState(false);

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
    return () => stopPresence();
  }, []);


  // Admin panel route
  if (hash.startsWith('#/admin')) {
    return <AdminPanel />;
  }

  // Portfolio route (shown inside the app shell with the navbar)
  const showPortfolio = hash.startsWith('#/portfolio');

  // Magazin route (shop — qahramon kiyimlari, tanga bilan xarid)
  const showShop = hash.startsWith('#/shop');

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
    <div className="h-dvh w-full bg-base-200 transition-colors duration-300 flex flex-col">
      <Navbar onToggleTutor={handleToggleTutor} />

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${!showPortfolio && !showShop && showSidebar && (showDashboard || showHome) ? 'lg:mr-80' : ''}`}>
          {showShop && <ShopPage />}
          {showPortfolio && <PortfolioPage />}
          {!showPortfolio && !showShop && showHome && <HomePage />}
          {!showPortfolio && !showShop && showDashboard && (
            <LanguageDashboard onSelectLevel={handleSelectLevel} />
          )}
          {!showPortfolio && !showShop && showLevel && (
            <LevelPage onBack={handleBackToDashboard} />
          )}
        </main>

        {/* Sidebar with widgets (only on Home and Dashboard) */}
        {!showPortfolio && !showShop && (showDashboard || showHome) && showSidebar && (
          <>
            {/* Mobil qurilmalarda orqa fon qoraytiriladi */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setShowSidebar(false)}
            />
            <aside className="fixed right-0 top-16 h-[calc(100dvh-4rem)] w-80 max-w-[86vw] bg-base-100 border-l border-base-300 overflow-y-auto z-40 shadow-lg animate-[slideIn_0.3s_ease-out]">
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
                  <WordOfTheDay />
                  <DailyChallenge />
                  <StatsDashboard />
                  <AchievementsPanel limit={6} />
                </>
              )}
            </div>
            </aside>
          </>
        )}
      </div>

      {/* Sidebar toggle button (on Home and Dashboard) */}
      {!showPortfolio && !showShop && (showDashboard || showHome) && !showSidebar && (
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
      <SMSReminder />

      {/* Live visitors badge (links to admin panel) */}
      <LiveVisitorsBadge />

      {/* AI Tutor Floating Button */}
      {!showPortfolio && !showShop && state.selectedLanguage && (
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
