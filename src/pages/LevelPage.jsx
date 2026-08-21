import { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { languages, getLessons } from '../data/languages';
import { speak, speakPhonetic, stopSpeaking } from '../utils/speech';
import {
  FaArrowLeft as ArrowLeft, FaCheckCircle as CheckCircle, FaTrophy as Trophy,
  FaLock as Lock, FaChevronLeft as ChevronLeft, FaChevronRight as ChevronRight,
  FaVolumeUp as Volume2, FaSync as RefreshCw, FaBookOpen as BookOpen,
  FaGraduationCap as GraduationCap, FaVolumeMute as VolumeX, FaCoins as Coins,
} from 'react-icons/fa';

export default function LevelPage({ onBack }) {
  const { state, dispatch, getLessonProgress } = useApp();

  const currentLang = languages.find(l => l.id === state.selectedLanguage);
  const lessonNumber = parseInt(state.currentLevel?.replace('lesson-', '') || '1');
  const allLessons = getLessons(state.selectedLanguage);
  const lesson = allLessons.find(l => l.number === lessonNumber);

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const stopPlaybackRef = useRef(false);

  // Clean the example: strip romanization in parentheses, e.g. "가방 (gabang)" -> "가방"
  const cleanExample = (example) => {
    if (!example) return '';
    return example.replace(/\s*\([^)]*\)/g, '').trim();
  };

  // Stop any ongoing speech when leaving the page
  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  // Stop playback AND reset answer state when navigating to another lesson.
  // This prevents the previous lesson's selection/result from appearing
  // in the newly opened lesson (e.g. after pressing "Davom etish").
  useEffect(() => {
    stopPlaybackRef.current = true;
    stopSpeaking();
    setSpeakingIdx(null);
    resetAnswerState();
  }, [lessonNumber]);

  // Javob holatini tozalash — keyingi darsga o'tganda eski javob/natija
  // ko'rinib qolmasligi uchun (bitta joyda, 5 ta joyda takrorlanmaydi)
  const resetAnswerState = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
    setScore(0);
    setCoinsEarned(0);
  };

  const handleStop = () => {
    stopPlaybackRef.current = true;
    stopSpeaking();
    setSpeakingIdx(null);
  };

  // Get phonetic data for the current lesson's letters
  const letterPhonetics = useMemo(() => {
    if (!lesson?.content?.letters) return {};
    const map = {};
    lesson.content.letters.forEach((item) => {
      if (item.phonetic) map[item.letter] = item.phonetic;
    });
    return map;
  }, [lesson]);

  const speakLetter = (letter, idx, example) => {
    if (!letter) return;
    stopPlaybackRef.current = true; // cancel any running play-all sequence
    setSpeakingIdx(idx);
    // Use phonetic hint if available for better pronunciation
    const phonetic = letterPhonetics[letter];
    speakPhonetic(letter, state.selectedLanguage, {
      phonetic: phonetic || undefined,
      onEnd: () => {
        const cleaned = cleanExample(example);
        if (cleaned) {
          // Extract phonetic from example if available (e.g. 'باب (bab)' → 'bab')
          const exMatch = example.match(/\(([^)]+)\)/);
          const exPhonetic = exMatch ? exMatch[1] : undefined;
          speakPhonetic(cleaned, state.selectedLanguage, {
            phonetic: exPhonetic || phonetic || undefined,
            onEnd: () => setSpeakingIdx(null),
            onError: () => setSpeakingIdx(null),
          });
        } else {
          setSpeakingIdx(null);
        }
      },
      onError: () => setSpeakingIdx(null),
    });
  };

  const speakAllLetters = () => {
    const letters = lesson?.content?.letters;
    if (!letters?.length) return;
    stopPlaybackRef.current = false;
    let idx = 0;

    const playNext = () => {
      if (stopPlaybackRef.current) {
        setSpeakingIdx(null);
        return;
      }
      if (idx >= letters.length) {
        setSpeakingIdx(null);
        return;
      }
      const item = letters[idx];
      setSpeakingIdx(idx);
      const cleaned = cleanExample(item.example);
      const phonetic = item.phonetic || letterPhonetics[item.letter];
      // Extract phonetic from example if available (e.g. 'باب (bab)' → 'bab')
      const exMatch = item.example.match(/\(([^)]+)\)/);
      const exPhonetic = exMatch ? exMatch[1] : undefined;
      speakPhonetic(item.letter, state.selectedLanguage, {
        phonetic: phonetic || undefined,
        onEnd: () => {
          if (cleaned) {
            speakPhonetic(cleaned, state.selectedLanguage, {
              phonetic: exPhonetic || phonetic || undefined,
              onEnd: () => {
                idx += 1;
                playNext();
              },
              onError: () => {
                idx += 1;
                playNext();
              },
            });
          } else {
            idx += 1;
            playNext();
          }
        },
        onError: () => {
          idx += 1;
          playNext();
        },
      });
    };

    playNext();
  };

  if (!currentLang || !lesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="opacity-60">Dars topilmadi</p>
        <button onClick={onBack} className="btn btn-primary btn-sm mt-4">
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </button>
      </div>
    );
  }

  const progress = getLessonProgress(state.selectedLanguage, lessonNumber);
  const isCompleted = progress.completed;
  const isAlphabet = lesson.type === 'alphabet';

  // Savoldan so'zni ajratib olish: "\"hello\" so'zining ma'nosi nima?" -> "hello"
  const questionWordMatch = lesson?.exercise?.question?.match(/"([^"]+)"/);
  const questionWord = questionWordMatch ? questionWordMatch[1] : null;

  // Dars ochiqligi: alifbo darslari (1-10) hamisha ochiq,
  // qolganlari avvalgi dars tugallanishini talab qiladi
  const isLessonLocked = (num) => {
    if (num <= 1 || num <= 10) return false;
    const key = `${state.selectedLanguage}-lesson-${num - 1}`;
    return !state.progress[key]?.completed;
  };

  const handleAnswer = (answerIndex) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);

    const correct = answerIndex === lesson.exercise.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    setScore(correct ? 100 : 50);

    // Alifbo darsida tanga umuman berilmaydi.
    // Oddiy darslarda faqat TO'G'RI javobda +15 tanga.
    setCoinsEarned(!isAlphabet && correct ? 15 : 0);
  };

  const handleComplete = () => {
    // Oddiy darslarda to'g'ri javob uchun +15 tanga (alifboda yo'q)
    if (coinsEarned > 0 && !isCompleted) {
      dispatch({ type: 'ADD_COINS', payload: coinsEarned });
    }
    dispatch({
      type: 'COMPLETE_LESSON',
      payload: {
        langId: state.selectedLanguage,
        lessonNumber: lessonNumber,
        score: score,
      },
    });

    // Answer state darhol tozalanadi — keyingi darsda eski javob
    // yoki natija ko'rinib qolmasligi uchun (oldin davom etish bosilganda
    // keyingi darsda avtomatik belgilangan javob chiqib qolardi)
    resetAnswerState();

    // Navigate to next lesson
    const nextLesson = allLessons.find(l => l.number === lessonNumber + 1);
    if (nextLesson) {
      dispatch({ type: 'SET_CURRENT_LEVEL', payload: `lesson-${lessonNumber + 1}` });
    } else {
      onBack();
    }
  };

  const handleNextLesson = () => {
    resetAnswerState();

    const nextLesson = allLessons.find(l => l.number === lessonNumber + 1);
    if (nextLesson && !isLessonLocked(nextLesson.number)) {
      dispatch({ type: 'SET_CURRENT_LEVEL', payload: `lesson-${lessonNumber + 1}` });
    }
  };

  const handlePrevLesson = () => {
    resetAnswerState();

    const prevLesson = allLessons.find(l => l.number === lessonNumber - 1);
    if (prevLesson) {
      dispatch({ type: 'SET_CURRENT_LEVEL', payload: `lesson-${lessonNumber - 1}` });
    }
  };

  const handleJumpToLesson = (num) => {
    if (isLessonLocked(num)) return;
    dispatch({ type: 'SET_CURRENT_LEVEL', payload: `lesson-${num}` });
    resetAnswerState();
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-base-200 via-base-100 to-base-200 border-b border-base-300 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="btn btn-ghost btn-sm gap-2">
              <ArrowLeft className="w-4 h-4" /> {currentLang.flag} {currentLang.name}
            </button>
            <div className="flex items-center gap-2">
              {lessonNumber > 1 && (
                <button onClick={handlePrevLesson} className="btn btn-ghost btn-xs btn-circle">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <span className="text-sm font-medium opacity-60">
                {lessonNumber} / {allLessons.length}
              </span>
              {lessonNumber < allLessons.length && !isLessonLocked(lessonNumber + 1) && (
                <button onClick={handleNextLesson} className="btn btn-ghost btn-xs btn-circle">
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Progress bar for lessons */}
          <div className="w-full h-1.5 bg-base-300 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
              style={{ width: `${((lessonNumber - 1) / allLessons.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lesson content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Lesson header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">{lesson.icon}</div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className={`badge badge-sm ${
              lesson.type === 'alphabet' ? 'badge-info' :
              lesson.type === 'vocabulary' ? 'badge-success' :
              lesson.type === 'reading' ? 'badge-secondary' :
              lesson.type === 'listening' ? 'badge-warning' :
              lesson.type === 'speaking' ? 'badge-error' :
              lesson.type === 'writing' ? 'badge-accent' :
              'badge-neutral'
            }`}>
              {lesson.category}
            </span>
            <span className="badge badge-ghost badge-sm">Dars {lesson.number}</span>
            {isCompleted && (
              <span className="badge badge-success badge-sm gap-1">
                <CheckCircle className="w-3 h-3" /> Bajarilgan
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
          <p className="text-sm opacity-60">{lesson.description}</p>
        </div>

        {/* Alphabet lesson content */}
        {isAlphabet && lesson.content.letters && lesson.content.letters.length > 0 && (
          <div className="card bg-base-100 border border-base-300 mb-6 overflow-hidden">
            <div className="card-body p-4">
              <div className="flex items-center justify-between mb-4 gap-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-info" />
                  Harflarni o'rganing
                </h3>
                <div className="flex gap-1.5">
                  {speakingIdx !== null && (
                    <button
                      onClick={handleStop}
                      className="btn btn-xs btn-ghost gap-1"
                    >
                      <VolumeX className="w-3 h-3" /> To'xtatish
                    </button>
                  )}
                  <button
                    onClick={speakAllLetters}
                    className="btn btn-xs btn-info gap-1"
                    disabled={speakingIdx !== null}
                  >
                    <Volume2 className="w-3 h-3" /> Hammasini eshitish
                  </button>
                </div>
              </div>

              <p className="text-xs opacity-50 mb-3 flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                Harf ustiga bosing — talaffuzini eshitasiz
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {lesson.content.letters.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => speakLetter(item.letter, idx, item.example)}
                    className={`bg-base-200 rounded-xl p-4 text-center hover:bg-info/10 transition-all duration-200 group cursor-pointer relative overflow-hidden ${
                      speakingIdx === idx ? 'ring-2 ring-info bg-info/10 scale-105' : ''
                    }`}
                  >
                    {speakingIdx === idx && (
                      <span className="absolute top-2 right-2 flex gap-0.5 items-end">
                        {[0, 1, 2].map(i => (
                          <span
                            key={i}
                            className="w-1 rounded-full bg-info animate-pulse"
                            style={{
                              height: '6px',
                              animationDelay: `${i * 150}ms`,
                            }}
                          />
                        ))}
                      </span>
                    )}
                    {speakingIdx !== idx && (
                      <Volume2 className="absolute top-2 right-2 w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />
                    )}
                    <div className="text-3xl font-bold mb-1 group-hover:scale-110 transition-transform">
                      {item.letter}
                    </div>
                    <div className="text-xs opacity-50 font-mono mb-2">{item.pronunciation}</div>
                    <div className="border-t border-base-300 pt-2 mt-1">
                      <div className="text-sm font-medium">{item.example}</div>
                      <div className="text-[10px] opacity-40">{item.exampleUz}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Non-alphabet lesson content */}
        {!isAlphabet && (
          <div className="card bg-base-100 border border-base-300 mb-6">
            <div className="card-body p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  lesson.type === 'vocabulary' ? 'bg-success/10' :
                  lesson.type === 'reading' ? 'bg-secondary/10' :
                  lesson.type === 'listening' ? 'bg-warning/10' :
                  lesson.type === 'speaking' ? 'bg-error/10' :
                  lesson.type === 'writing' ? 'bg-accent/10' : 'bg-neutral/10'
                }`}>
                  <span className="text-xl">{lesson.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{lesson.category}</h3>
                  <p className="text-xs opacity-50">Mashqni bajaring va bilimingizni sinang</p>
                </div>
              </div>

              {/* Simple content display */}
              <div className="bg-base-200 rounded-xl p-4 mb-4">
                <p className="text-sm opacity-70 text-center">
                  Savolga to'g'ri javob bering!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Exercise */}
        <div className="card bg-base-100 border border-base-300 mb-6">
          <div className="card-body p-6">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Savol
            </h3>

            <div className="flex items-center justify-center gap-2 mb-6">
              <p className="text-lg font-medium text-center">
                {lesson.exercise.question}
              </p>
              {questionWord && (
                <button
                  onClick={() => speak(questionWord, state.selectedLanguage)}
                  className="btn btn-ghost btn-xs btn-circle shrink-0"
                  title="So'zni tinglash"
                >
                  <Volume2 className="w-4 h-4 text-primary" />
                </button>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2">
              {lesson.exercise.options.map((option, idx) => {
                let btnClass = 'btn-ghost border-base-300 hover:border-primary/50';
                if (showResult) {
                  if (idx === lesson.exercise.correctAnswer) {
                    btnClass = 'btn-success text-white border-success';
                  } else if (idx === selectedAnswer && !isCorrect) {
                    btnClass = 'btn-error text-white border-error';
                  } else {
                    btnClass = 'btn-ghost opacity-40';
                  }
                } else if (selectedAnswer === idx) {
                  btnClass = 'btn-primary text-white border-primary';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={showResult}
                    className={`btn btn-block btn-lg justify-start ${btnClass} transition-all duration-200`}
                  >
                    <span className="w-8 h-8 rounded-lg bg-base-300/30 flex items-center justify-center text-sm font-bold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 text-left">{option}</span>
                    {showResult && idx === lesson.exercise.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Result */}
            {showResult && (
              <div className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-success/10 border border-success/20' : 'bg-error/10 border border-error/20'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="font-bold text-success">To'g'ri!</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5 text-error" />
                      <span className="font-bold text-error">Noto'g'ri</span>
                    </>
                  )}
                  {coinsEarned > 0 && !isCompleted && (
                    <span className="ml-auto flex items-center gap-1 font-bold text-warning animate-bounceIn">
                      +{coinsEarned} <Coins className="w-4 h-4" />
                    </span>
                  )}
                </div>
                {!isCorrect && (
                  <p className="text-sm opacity-70">
                    To'g'ri javob: <strong>{lesson.exercise.options[lesson.exercise.correctAnswer]}</strong>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Completion and navigation */}
        <div className="flex items-center justify-between">
          {!showResult ? (
            <div className="text-xs opacity-50">
              Javobni tanlang va bilimingizni sinang
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning" />
              <span className="font-bold">{score}/100 ball</span>
            </div>
          )}

          <div className="flex gap-2">
            {showResult && !isCompleted && (
              <button onClick={handleComplete} className="btn btn-primary btn-sm gap-2 btn-wave">
                {coinsEarned > 0 ? `Davom etish (+${coinsEarned} 🪙)` : 'Davom etish'}
              </button>
            )}
            {isCompleted && lessonNumber < allLessons.length && !isLessonLocked(lessonNumber + 1) && (
              <button onClick={handleNextLesson} className="btn btn-primary btn-sm gap-2">
                Keyingi dars
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {isCompleted && lessonNumber >= allLessons.length && (
              <button onClick={onBack} className="btn btn-primary btn-sm gap-2">
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Lesson navigation dots */}
        <div className="mt-8 flex justify-center gap-1">
          {allLessons.slice(Math.max(0, lessonNumber - 5), Math.min(allLessons.length, lessonNumber + 4)).map(l => {
            const key = `${state.selectedLanguage}-lesson-${l.number}`;
            const p = state.progress[key];
            const locked = isLessonLocked(l.number);
            return (
              <button
                key={l.number}
                onClick={() => handleJumpToLesson(l.number)}
                disabled={locked}
                title={locked ? 'Avval oldingi darsni tugating' : `Dars ${l.number}`}
                className={`w-6 h-6 rounded-full text-[10px] font-bold transition-all ${
                  l.number === lessonNumber
                    ? 'bg-primary text-white scale-110'
                    : p?.completed
                      ? 'bg-success text-white'
                      : locked
                        ? 'bg-base-300 text-base-content/20 cursor-not-allowed'
                        : 'bg-base-300 text-base-content/40 hover:bg-base-content/20'
                }`}
              >
                {locked ? <Lock className="w-3 h-3 mx-auto" /> : l.number}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
