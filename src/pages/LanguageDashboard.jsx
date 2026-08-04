import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { languages, getLessons, getLanguageStats } from '../data/languages';
import { useSiteConfig, getLangPrice } from '../data/siteConfig';
import {
  Lock, ChevronRight, Trophy, CheckCircle,
  ArrowLeft, TrendingUp, Sparkles, Award, Target,
  BookOpen, Headphones, Pencil, Mic, Search, ChevronLeft,
  GraduationCap, Star, Coins, Crown, CreditCard
} from 'lucide-react';
import PaywallModal from '../components/PaywallModal';
import DailyChallenge from '../components/DailyChallenge';
import AchievementsPanel from '../components/AchievementsPanel';
import StatsDashboard from '../components/StatsDashboard';
import StreakCalendar from '../components/StreakCalendar';

const LESSONS_PER_PAGE = 20;

const skillFilters = [
  { id: 'all', icon: Sparkles, label: 'Barcha', color: 'primary' },
  { id: 'alphabet', icon: GraduationCap, label: 'Alifbo', color: 'info' },
  { id: 'vocabulary', icon: BookOpen, label: 'So\'zlar', color: 'success' },
  { id: 'reading', icon: BookOpen, label: 'O\'qish', color: 'secondary' },
  { id: 'listening', icon: Headphones, label: 'Tinglash', color: 'warning' },
  { id: 'speaking', icon: Mic, label: 'Gapirish', color: 'error' },
  { id: 'writing', icon: Pencil, label: 'Yozish', color: 'accent' },
  { id: 'grammar', icon: Crown, label: 'Grammatika', color: 'neutral' },
];

export default function LanguageDashboard({ onSelectLevel }) {
  const { state, dispatch } = useApp();
  const config = useSiteConfig();
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCompleted, setShowCompleted] = useState(true);

  const currentLang = languages.find(l => l.id === state.selectedLanguage);
  if (!currentLang) return null;

  // Paid language gate: if this language costs money and isn't unlocked, show a lock screen
  const isLangPaid = getLangPrice(config, currentLang) > 0;
  const isLangUnlocked = !isLangPaid || (state.unlockedLanguages || {})[currentLang.id];

  const allLessons = useMemo(() => getLessons(state.selectedLanguage), [state.selectedLanguage]);
  const stats = useMemo(() => getLanguageStats(state.selectedLanguage, state.progress), [state.selectedLanguage, state.progress]);

  // Filter lessons
  const filteredLessons = useMemo(() => {
    let lessons = allLessons;
    if (activeFilter !== 'all') {
      lessons = lessons.filter(l => l.type === activeFilter);
    }
    if (!showCompleted) {
      lessons = lessons.filter(l => {
        const key = `${state.selectedLanguage}-lesson-${l.number}`;
        const prog = state.progress[key];
        return !prog?.completed;
      });
    }
    return lessons;
  }, [allLessons, activeFilter, showCompleted, state.selectedLanguage, state.progress]);

  // Pagination
  const totalPages = Math.ceil(filteredLessons.length / LESSONS_PER_PAGE);
  const paginatedLessons = filteredLessons.slice(
    (currentPage - 1) * LESSONS_PER_PAGE,
    currentPage * LESSONS_PER_PAGE
  );

  const handleLessonClick = (lessonNumber) => {
    onSelectLevel(`lesson-${lessonNumber}`);
    dispatch({ type: 'SET_CURRENT_LEVEL', payload: `lesson-${lessonNumber}` });
  };

  const achievementsUnlocked = state.achievements?.filter(a => a.unlocked)?.length || 0;

  // Calculate streak display
  let streakText = '';
  if (state.streak >= 7) streakText = `🔥 ${state.streak} kun`;
  else if (state.streak > 0) streakText = `🔥 ${state.streak} kun`;
  else streakText = '';

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 border-b border-base-300">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={() => dispatch({ type: 'SELECT_LANGUAGE', payload: null })}
            className="btn btn-ghost btn-sm gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Barcha tillar
          </button>

          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{currentLang.flag}</span>
              <div>
                <h1 className="text-3xl font-bold">{currentLang.name}</h1>
                <p className="opacity-60">{currentLang.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:ml-auto">
              <div className="flex items-center gap-1 badge badge-primary badge-lg p-3">
                <Coins className="w-4 h-4" />
                <span className="font-bold">{state.coins} 🪙</span>
              </div>
              <div className="badge badge-secondary badge-lg p-3">
                <TrendingUp className="w-4 h-4" />
                {stats.completed}/{stats.total}
              </div>
              {streakText && (
                <div className="badge badge-warning badge-lg p-3">
                  {streakText}
                </div>
              )}
              {achievementsUnlocked > 0 && (
                <div className="badge badge-success badge-lg p-3">
                  🏆 {achievementsUnlocked} yutuq
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-base-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full transition-all duration-1000"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs opacity-50">
              Umumiy taraqqiyot: {stats.completed}/{stats.total} dars
            </p>
            <p className="text-xs font-medium text-primary">{stats.percentage}%</p>
          </div>
        </div>
      </div>

      {isLangPaid && !isLangUnlocked && (
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="card bg-base-100 border-2 border-warning/40 max-w-lg mx-auto text-center">
            <div className="card-body items-center py-10">
              <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mb-4">
                <Lock className="w-10 h-10 text-warning" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{currentLang.flag} {currentLang.name} qulflangan</h2>
              <p className="text-sm opacity-60 mb-6 max-w-xs">
                Bu til pullik kurs. Karta bilan to'lab, barcha 100 darsga cheksiz kirishni oching.
              </p>
              <div className="text-3xl font-extrabold text-warning mb-6">
                {getLangPrice(config, currentLang).toLocaleString('uz-UZ')} so'm
              </div>
              <button
                onClick={() => setShowPaywall(true)}
                className="btn btn-primary btn-lg gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Karta bilan ochish
              </button>
            </div>
          </div>
        </div>
      )}

      {(!isLangPaid || isLangUnlocked) && (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Lessons */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {skillFilters.map(filter => {
                const Icon = filter.icon;
                const isActive = activeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => { setActiveFilter(filter.id); setCurrentPage(1); }}
                    className={`btn btn-xs gap-1.5 transition-all ${
                      isActive ? `btn-${filter.color} text-white` : 'btn-ghost'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{filter.label}</span>
                    {filter.id === 'all' && (
                      <span className="opacity-60">({allLessons.length})</span>
                    )}
                    {filter.id !== 'all' && (
                      <span className="opacity-60">
                        ({allLessons.filter(l => l.type === filter.id).length})
                      </span>
                    )}
                  </button>
                );
              })}
              <div className="divider divider-horizontal mx-1" />
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className={`btn btn-xs gap-1.5 ${!showCompleted ? 'btn-ghost' : 'btn-ghost opacity-50'}`}
              >
                <CheckCircle className="w-3 h-3" />
                <span>{showCompleted ? 'Barcha' : 'Yangi'}</span>
              </button>
            </div>

            {/* Lessons Grid */}
            {paginatedLessons.length === 0 ? (
              <div className="card bg-base-100 border border-base-300 p-8 text-center">
                <Target className="w-12 h-12 opacity-30 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1">Darslar topilmadi</h3>
                <p className="text-sm opacity-60">Boshqa filtrni tanlang</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paginatedLessons.map((lesson) => {
                  const key = `${state.selectedLanguage}-lesson-${lesson.number}`;
                  const prog = state.progress[key] || {};
                  const isCompleted = prog.completed;
                  const isFirstAlphabet = lesson.type === 'alphabet';
                  const isLocked = lesson.number > 1 && !state.progress[`${state.selectedLanguage}-lesson-${lesson.number - 1}`]?.completed && !isFirstAlphabet;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson.number)}
                      disabled={false}
                      className={`card bg-base-100 border transition-all duration-300 group text-left
                        ${isCompleted
                          ? 'border-success/30 bg-success/3 hover:border-success/60'
                          : 'border-base-300 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5'
                        }
                        ${state.currentLevel === `lesson-${lesson.number}` ? 'border-primary shadow-md ring-1 ring-primary/30' : ''}
                      `}
                    >
                      <div className="card-body p-3.5">
                        <div className="flex items-center gap-3">
                          {/* Lesson number badge */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0
                            ${isCompleted
                              ? 'bg-success/20'
                              : lesson.type === 'alphabet'
                                ? 'bg-blue-100 dark:bg-blue-900/30'
                                : 'bg-base-200'
                            }
                          `}>
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-success" />
                            ) : (
                              <span className="font-bold text-xs opacity-60">{lesson.number}</span>
                            )}
                          </div>

                          {/* Lesson info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{lesson.icon}</span>
                              <h3 className="font-semibold text-sm truncate">{lesson.title}</h3>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] opacity-50">{lesson.category}</span>
                              <span className="text-[10px] opacity-30">•</span>
                              <span className="text-[10px] opacity-50">Dars {lesson.number}</span>
                            </div>
                          </div>

                          <ChevronRight className="w-4 h-4 opacity-20 group-hover:opacity-50 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </div>

                        {/* Score bar */}
                        {prog.score > 0 && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-base-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${prog.score >= 80 ? 'bg-success' : 'bg-warning'}`}
                                style={{ width: `${prog.score}%` }}
                              />
                            </div>
                            <span className={`text-[10px] font-medium ${prog.score >= 80 ? 'text-success' : 'text-warning'}`}>
                              {prog.score}%
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-ghost btn-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-ghost btn-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Widgets */}
          <div className="space-y-4">
            {/* Quick stats */}
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body p-4">
                <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
                  <Coins className="w-4 h-4 text-primary" />
                  Tezkor statistika
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-base-200 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-primary">{stats.completed}</p>
                    <p className="text-[10px] opacity-50">Bajarilgan</p>
                  </div>
                  <div className="bg-base-200 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-secondary">{stats.total - stats.completed}</p>
                    <p className="text-[10px] opacity-50">Qolgan</p>
                  </div>
                  <div className="bg-base-200 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-accent">{stats.percentage}%</p>
                    <p className="text-[10px] opacity-50">Taraqqiyot</p>
                  </div>
                  <div className="bg-base-200 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-warning">{allLessons.filter(l => l.type === 'alphabet').length}</p>
                    <p className="text-[10px] opacity-50">Alifbo dars</p>
                  </div>
                </div>
              </div>
            </div>

            <DailyChallenge />
            <AchievementsPanel limit={4} />
            <StatsDashboard />
            <StreakCalendar />
          </div>
        </div>
      </div>
      )}

      {/* Paywall Modal — supports both premium and paid language modes */}
      <PaywallModal
        isOpen={showPaywall}
        lang={isLangPaid ? currentLang : null}
        onClose={() => setShowPaywall(false)}
        onUnlock={() => {
          if (isLangPaid) {
            dispatch({ type: 'UNLOCK_LANGUAGE', payload: currentLang.id });
          } else {
            dispatch({ type: 'UNLOCK_PREMIUM' });
          }
          setShowPaywall(false);
        }}
      />
    </div>
  );
}
