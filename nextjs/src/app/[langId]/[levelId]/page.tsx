'use client';

import { use } from 'react';
import { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { languages, levels, getLanguageData } from '../../../data/languages';
import Link from 'next/link';
import ReadingSection from '../../../components/ReadingSection';
import ListeningSection from '../../../components/ListeningSection';
import WritingSection from '../../../components/WritingSection';
import SpeakingSection from '../../../components/SpeakingSection';
import {
  BookOpen, Headphones, Pencil, Mic, ArrowLeft, CheckCircle,
} from 'lucide-react';

const skills = [
  { id: 'reading', icon: BookOpen, label: 'Reading', color: 'primary' },
  { id: 'listening', icon: Headphones, label: 'Listening', color: 'secondary' },
  { id: 'writing', icon: Pencil, label: 'Writing', color: 'accent' },
  { id: 'speaking', icon: Mic, label: 'Speaking', color: 'error' },
];

export default function LevelPage({ params }: { params: Promise<{ langId: string; levelId: string }> }) {
  const { langId, levelId } = use(params);
  const { state, dispatch, getLevelProgress } = useApp();
  const [activeSkill, setActiveSkill] = useState('reading');

  const currentLang = languages.find(l => l.id === langId);
  const currentLevel = levels.find(l => l.id === levelId);
  const data = getLanguageData(langId, levelId);

  // Sync state with URL params
  useEffect(() => {
    if (state.selectedLanguage !== langId) {
      dispatch({ type: 'SELECT_LANGUAGE', payload: langId });
    }
    dispatch({ type: 'SET_CURRENT_LEVEL', payload: levelId });
  }, [langId, levelId, state.selectedLanguage, dispatch]);

  if (!currentLang || !currentLevel || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Ma'lumot topilmadi</h2>
          <Link href={`/${langId}`} className="btn btn-primary">Orqaga qaytish</Link>
        </div>
      </div>
    );
  }

  const exercises = data.exercises[activeSkill as keyof typeof data.exercises];
  const progress = getLevelProgress(langId, levelId);

  const handleExerciseComplete = (score: number) => {
    dispatch({
      type: 'COMPLETE_EXERCISE',
      payload: {
        langId,
        levelId,
        skill: activeSkill,
        score,
      },
    });
  };

  const isLevelCompleted = progress?.completed || false;

  const SkillIcon = skills.find(s => s.id === activeSkill)?.icon || BookOpen;
  const skillColor = skills.find(s => s.id === activeSkill)?.color || 'primary';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-base-200 via-base-100 to-base-200 border-b border-base-300">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href={`/${langId}`}
            onClick={() => dispatch({ type: 'SET_CURRENT_LEVEL', payload: null })}
            className="btn btn-ghost btn-sm gap-2 mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> {currentLang.flag} {currentLevel.name} darajasi
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentLevel.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{currentLevel.name}</h1>
                <span className={`badge badge-sm ${currentLevel.isPremium ? 'badge-warning' : 'badge-primary'}`}>
                  {currentLevel.code}
                </span>
              </div>
              <p className="text-sm opacity-60">{currentLevel.description}</p>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {isLevelCompleted && (
                <div className="badge badge-success gap-1 p-3">
                  <CheckCircle className="w-4 h-4" /> Tugallangan
                </div>
              )}
              <div className="rating rating-sm" title={`${progress.bestScore}% eng yaxshi natija`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <input
                    key={star}
                    type="radio"
                    className="mask mask-star-2 bg-warning"
                    checked={star <= Math.round(progress.bestScore / 20)}
                    readOnly
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Tabs */}
      <div className="bg-base-100 border-b border-base-300 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 py-2 overflow-x-auto">
            {skills.map((skill) => {
              const Icon = skill.icon;
              const isActive = activeSkill === skill.id;
              const skillExs = (data.exercises as any)[skill.id];
              const skillKey = `${skill.id}-${skillExs?.[0]?.id || ''}`;
              const isDone = progress.exercises[skillKey]?.completed;

              return (
                <button
                  key={skill.id}
                  onClick={() => setActiveSkill(skill.id)}
                  className={`btn btn-sm gap-2 transition-all duration-200 flex-shrink-0 ${
                    isActive
                      ? `btn-${skill.color} text-white`
                      : 'btn-ghost'
                  } ${isDone ? 'opacity-80' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{skill.label}</span>
                  {isDone && <CheckCircle className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Skill Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center skill-badge-${skillColor}`}>
            <SkillIcon className={`w-5 h-5 skill-icon-${skillColor}`} />
          </div>
          <div>
            <h2 className="font-bold text-lg capitalize">{activeSkill} mashqlari</h2>
            <p className="text-sm opacity-60">
              {(exercises as any[])?.length || 0} ta mashq &bull; 80%+ bilan o'ting
            </p>
          </div>
        </div>

        {activeSkill === 'reading' && exercises && (
          <ReadingSection
            exercises={exercises as any}
            langId={langId}
            levelId={levelId}
            onComplete={handleExerciseComplete}
          />
        )}
        {activeSkill === 'listening' && exercises && (
          <ListeningSection
            exercises={exercises as any}
            langId={langId}
            levelId={levelId}
            onComplete={handleExerciseComplete}
          />
        )}
        {activeSkill === 'writing' && exercises && (
          <WritingSection
            exercises={exercises as any}
            langId={langId}
            levelId={levelId}
            onComplete={handleExerciseComplete}
          />
        )}
        {activeSkill === 'speaking' && exercises && (
          <SpeakingSection
            exercises={exercises as any}
            langId={langId}
            levelId={levelId}
            onComplete={handleExerciseComplete}
          />
        )}
      </div>
    </div>
  );
}
