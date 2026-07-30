'use client';

import { useState, type ReactNode } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import AITutor from '../components/AITutor';
import DailyChallenge from '../components/DailyChallenge';
import WordOfTheDay from '../components/WordOfTheDay';
import StatsDashboard from '../components/StatsDashboard';
import AchievementsPanel from '../components/AchievementsPanel';
import MistakesReview from '../components/MistakesReview';
import StreakCalendar from '../components/StreakCalendar';
import { Brain, Sparkles, X, PanelRightOpen, MessageCircle } from 'lucide-react';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { state, dispatch } = useApp();
  const [showSidebar, setShowSidebar] = useState(false);

  const showHome = !state.selectedLanguage;
  const showDashboard = state.selectedLanguage && !state.currentLevel;
  const canShowSidebar = showHome || showDashboard;

  const handleToggleTutor = () => {
    dispatch({ type: 'TOGGLE_TUTOR' });
  };

  return (
    <div className="min-h-screen bg-base-200 transition-colors duration-300">
      <Navbar onToggleTutor={handleToggleTutor} />

      <div className="flex">
        <main className={`flex-1 transition-all duration-300 ${showSidebar && canShowSidebar ? 'lg:mr-80' : ''}`}>
          {children}

          {showHome && (
            <footer className="bg-base-300/30 py-8 mt-8">
              <div className="max-w-6xl mx-auto px-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <span className="font-bold">PolyglotPro</span>
                </div>
                <p className="text-xs opacity-50">
                  7 tilda interaktiv o'rganish platformasi. Reading, Listening, Writing, Speaking.
                </p>
                <p className="text-xs opacity-30 mt-2">
                  &copy; 2026 PolyglotPro. Barcha huquqlar himoyalangan.
                </p>
              </div>
            </footer>
          )}
        </main>

        {canShowSidebar && showSidebar && (
          <aside className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-base-100 border-l border-base-300 overflow-y-auto z-30 shadow-lg animate-[slideIn_0.3s_ease-out]">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h2 className="font-bold text-sm">Qo'shimcha</h2>
                </div>
                <button onClick={() => setShowSidebar(false)} className="btn btn-ghost btn-xs btn-circle">
                  <X className="w-3 h-3" />
                </button>
              </div>

              {showDashboard ? (
                <>
                  <DailyChallenge />
                  <WordOfTheDay />
                  <StatsDashboard />
                  <AchievementsPanel limit={4} />
                  <MistakesReview />
                  <StreakCalendar />
                </>
              ) : (
                <>
                  <WordOfTheDay />
                  <DailyChallenge />
                  <StatsDashboard />
                  <AchievementsPanel limit={6} />
                </>
              )}
            </div>
          </aside>
        )}
      </div>

      {canShowSidebar && !showSidebar && (
        <button
          onClick={() => setShowSidebar(true)}
          className="fixed right-4 top-20 z-30 btn btn-sm btn-ghost bg-base-100/80 backdrop-blur-sm shadow-sm border border-base-300 hover:bg-base-200 transition-all duration-300"
          title="Panelni ochish"
        >
          <PanelRightOpen className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Widgets</span>
        </button>
      )}

      {state.selectedLanguage && (
        <>
          {!state.isTutorOpen && (
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
