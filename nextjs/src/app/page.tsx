'use client';

import { useApp } from '../context/AppContext';
import { languages } from '../data/languages';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Headphones, Pencil, Mic, ArrowRight, TrendingUp,
  Award, Star, Users, Sparkles, Zap, Shield, Trophy, Flame
} from 'lucide-react';

const features = [
  { icon: BookOpen, title: 'Reading', desc: "Matn o'qish va tushunish" },
  { icon: Headphones, title: 'Listening', desc: 'Tinglab tushunish' },
  { icon: Pencil, title: 'Writing', desc: 'Yozma mashqlar' },
  { icon: Mic, title: 'Speaking', desc: 'Talaffuz mashqi' },
];

export default function HomePage() {
  const { state, dispatch } = useApp();
  const router = useRouter();

  const handleLanguageSelect = (langId: string) => {
    dispatch({ type: 'SELECT_LANGUAGE', payload: langId });
    router.push(`/${langId}`);
  };

  const totalCompletedLevels = Object.values(state.progress).filter(p => p.completed).length;
  const totalExercises = Object.values(state.progress).reduce((sum, p) => sum + (p.exercises ? Object.keys(p.exercises).length : 0), 0);
  const achievementsUnlocked = state.achievements?.filter(a => a.unlocked)?.length || 0;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-base-200 via-base-100 to-base-200">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 text-6xl animate-float">🌍</div>
          <div className="absolute top-40 right-20 text-5xl animate-float" style={{ animationDelay: '1s' }}>🗣️</div>
          <div className="absolute bottom-40 left-1/4 text-4xl animate-float" style={{ animationDelay: '2s' }}>📚</div>
          <div className="absolute bottom-20 right-1/3 text-5xl animate-float" style={{ animationDelay: '0.5s' }}>✨</div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-20">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="badge badge-primary badge-lg gap-2 px-4 py-3">
                <Sparkles className="w-4 h-4" />
                Interaktiv til o'rganish
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
                7 Tilda Erkin Gaplashing
              </span>
            </h1>
            <p className="text-lg md:text-xl opacity-70 max-w-2xl mx-auto mb-8">
              Reading, Listening, Writing va Speaking — 4 ta asosiy ko'nikmani{' '}
              interaktiv mashqlar orqali rivojlantiring
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-bold">550K+ o'quvchilar</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-warning" />
                <span className="font-bold">7 xil til</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-success" />
                <span className="font-bold">4 darajali tizim</span>
              </div>
            </div>

            {(totalExercises > 0 || achievementsUnlocked > 0) && (
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                {totalExercises > 0 && (
                  <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm">{state.xp} XP</span>
                  </div>
                )}
                {totalCompletedLevels > 0 && (
                  <div className="flex items-center gap-2 bg-success/5 px-4 py-2 rounded-xl border border-success/10">
                    <Trophy className="w-4 h-4 text-success" />
                    <span className="text-sm">{totalCompletedLevels} daraja tugallangan</span>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {languages.map((lang, index) => {
              const progress = state.progress;
              const langProgress = ['beginner', 'elementary', 'pre-intermediate', 'advanced']
                .filter(lid => progress[`${lang.id}-${lid}`]?.completed)
                .length;
              const totalLevels = 4;

              return (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageSelect(lang.id)}
                  className="card bg-base-100 border border-base-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group text-left animate-[fadeIn_0.5s_ease-out]"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="card-body p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-4xl">{lang.flag}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(totalLevels)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < langProgress ? 'bg-success' : i === langProgress ? 'bg-primary' : 'bg-base-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <h2 className="text-lg font-bold mb-1">{lang.name}</h2>
                    <p className="text-xs opacity-60 mb-3">{lang.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs opacity-50">
                        <TrendingUp className="w-3 h-3" />
                        <span>{langProgress}/{totalLevels} daraja</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {langProgress > 0 && (
                          <span className="text-xs text-success font-medium">
                            {Math.round((langProgress / totalLevels) * 100)}%
                          </span>
                        )}
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all text-primary" />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            4 ta asosiy ko'nikma
          </span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="card bg-base-100 border border-base-300 hover:border-primary/30 transition-all duration-300 text-center">
                <div className="card-body items-center p-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold">{feature.title}</h3>
                  <p className="text-xs opacity-60">{feature.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
