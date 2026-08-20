import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../i18n';
import { speak, stopSpeaking, getSpeechLang } from '../utils/speech';
import { fetchDailyContent } from '../lib/server';
import { FaVolumeUp as Volume2, FaRegBookmark as Bookmark, FaBookmark as BookmarkCheck, FaMagic as Sparkles, FaRobot as Bot, FaCheckCircle as CheckCircle, FaTimes as X } from 'react-icons/fa';

const wordDatabase = {
  english: [
    { word: 'Serendipity', meaning: 'Kutilmagan baxtli hodisa', example: 'Finding that book was pure serendipity.', level: 'advanced' },
    { word: 'Eloquent', meaning: 'Notiq, chiroyli gapiruvchi', example: 'She gave an eloquent speech at the ceremony.', level: 'advanced' },
    { word: 'Resilient', meaning: 'Chidamli, tez tiklanuvchi', example: 'Children are remarkably resilient.', level: 'pre-intermediate' },
    { word: 'Abundance', meaning: 'Mo\'l-ko\'llik, serobgarchilik', example: 'There is an abundance of wildlife in the park.', level: 'elementary' },
    { word: 'Curious', meaning: 'Qiziquvchan', example: 'I am curious about different cultures.', level: 'beginner' },
    { word: 'Brilliant', meaning: 'Zo\'r, ajoyib, yorqin', example: 'That is a brilliant idea!', level: 'elementary' },
    { word: 'Adventure', meaning: 'Sarguzasht', example: 'Life is an amazing adventure.', level: 'beginner' },
    { word: 'Phenomenon', meaning: 'Hodisa, fenomen', example: 'The northern lights are a natural phenomenon.', level: 'advanced' },
    { word: 'Harmony', meaning: 'Uyg\'unlik, ahillik', example: 'They live in harmony with nature.', level: 'pre-intermediate' },
    { word: 'Generous', meaning: 'Saxiy, qo\'li ochiq', example: 'She is very generous with her time.', level: 'elementary' },
  ],
  spanish: [
    { word: 'Aventura', meaning: 'Sarguzasht', example: 'La vida es una gran aventura.', level: 'beginner' },
    { word: 'Hermoso', meaning: 'Go\'zal', example: 'El atardecer es muy hermoso.', level: 'elementary' },
    { word: 'Sabiduría', meaning: 'Donolik', example: 'La sabiduría viene con la experiencia.', level: 'advanced' },
    { word: 'Agradecido', meaning: 'Minnatdor', example: 'Estoy muy agradecido por tu ayuda.', level: 'pre-intermediate' },
    { word: 'Esperanza', meaning: 'Umid', example: 'Nunca pierdas la esperanza.', level: 'elementary' },
  ],
  french: [
    { word: 'Bonheur', meaning: 'Baxt', example: 'Le bonheur est dans les petites choses.', level: 'elementary' },
    { word: 'Aventure', meaning: 'Sarguzasht', example: 'La vie est une aventure.', level: 'beginner' },
    { word: 'Savoir', meaning: 'Bilish/Bilim', example: 'Le savoir est une force.', level: 'pre-intermediate' },
    { word: 'Élégance', meaning: 'Nafislik', example: 'Elle danse avec élégance.', level: 'advanced' },
    { word: 'Liberté', meaning: 'Erkinlik', example: 'La liberté est précieuse.', level: 'pre-intermediate' },
  ],
  german: [
    { word: 'Freiheit', meaning: 'Erkinlik', example: 'Freiheit ist ein Grundrecht.', level: 'pre-intermediate' },
    { word: 'Glück', meaning: 'Baxt', example: 'Glück ist, was man teilt.', level: 'elementary' },
    { word: 'Abenteuer', meaning: 'Sarguzasht', example: 'Das Leben ist ein Abenteuer.', level: 'beginner' },
    { word: 'Wissenschaft', meaning: 'Ilm-fan', example: 'Wissenschaft verändert die Welt.', level: 'advanced' },
    { word: 'Freundschaft', meaning: 'Do\'stlik', example: 'Freundschaft ist wichtig.', level: 'elementary' },
  ],
  italian: [
    { word: 'Amicizia', meaning: 'Do\'stlik', example: 'L\'amicizia è un tesoro.', level: 'elementary' },
    { word: 'Avventura', meaning: 'Sarguzasht', example: 'La vita è un\'avventura.', level: 'beginner' },
    { word: 'Bellezza', meaning: 'Go\'zallik', example: 'La bellezza è ovunque.', level: 'pre-intermediate' },
    { word: 'Conoscenza', meaning: 'Bilim', example: 'La conoscenza è potere.', level: 'advanced' },
    { word: 'Speranza', meaning: 'Umid', example: 'Non perdere mai la speranza.', level: 'pre-intermediate' },
  ],
  portuguese: [
    { word: 'Amizade', meaning: 'Do\'stlik', example: 'A amizade é um presente.', level: 'elementary' },
    { word: 'Aventura', meaning: 'Sarguzasht', example: 'A vida é uma aventura.', level: 'beginner' },
    { word: 'Beleza', meaning: 'Go\'zallik', example: 'A beleza está nos olhos de quem vê.', level: 'pre-intermediate' },
    { word: 'Conhecimento', meaning: 'Bilim', example: 'O conhecimento liberta.', level: 'advanced' },
    { word: 'Esperança', meaning: 'Umid', example: 'A esperança é a última que morre.', level: 'elementary' },
  ],
  russian: [
    { word: 'Дружба', meaning: 'Do\'stlik', example: 'Дружба — это великая сила.', level: 'elementary' },
    { word: 'Приключение', meaning: 'Sarguzasht', example: 'Жизнь — это приключение.', level: 'beginner' },
    { word: 'Красота', meaning: 'Go\'zallik', example: 'Красота спасёт мир.', level: 'pre-intermediate' },
    { word: 'Знание', meaning: 'Bilim', example: 'Знание — сила.', level: 'advanced' },
    { word: 'Надежда', meaning: 'Umid', example: 'Никогда не теряй надежду.', level: 'elementary' },
  ],
};

export default function WordOfTheDay() {
  const { state } = useApp();
  const { lang: uiLang } = useI18n();
  const [isSaved, setIsSaved] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);
  // Serverdan AI kontent
  const [serverWord, setServerWord] = useState(null);
  const [quizAnswer, setQuizAnswer] = useState(null); // index | null

  // Get today's word based on date
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const langId = state.selectedLanguage || 'english';
  const words = wordDatabase[langId] || wordDatabase.english;
  const wordIndex = Math.abs(dateStr.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % words.length;
  const todaysWord = words[wordIndex];

  // Serverdan kun so'zini olish (AI generatsiya qilgan bo'lishi mumkin)
  useEffect(() => {
    let cancelled = false;
    fetchDailyContent({ lang: langId, level: 'beginner', uiLang }).then((data) => {
      if (cancelled || !data?.ok || !data?.word) return;
      setServerWord(data);
    });
    return () => { cancelled = true; };
  }, [langId, uiLang]);

  // Foydalaniladigan so'z: serverdan kelgani ustun, bo'lmasa lokal bazadan
  const activeWord = serverWord
    ? { word: serverWord.word, meaning: serverWord.meaning, example: serverWord.example, level: serverWord.level, tip: serverWord.tip }
    : todaysWord;
  const isAi = serverWord?.source === 'ai';

  const speakWord = (text) => {
    stopSpeaking();
    speak(text, langId, { rate: 0.8 });
  };

  return (
    <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="card-body p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-bold text-sm flex items-center gap-1.5">Kun so'zi
              {isAi && (
                <span className="badge badge-primary badge-xs gap-0.5 font-normal" title="Serverda AI yordamida generatsiya qilindi">
                  <Bot className="w-2.5 h-2.5" /> AI
                </span>
              )}
            </h3>
          </div>
          <button
            onClick={() => setIsSaved(!isSaved)}
            className="btn btn-ghost btn-xs btn-circle"
            title={isSaved ? 'Saqlangan' : 'Saqlash'}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-primary" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="text-center py-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {activeWord.word}
            </h2>
            <button
              onClick={() => speakWord(activeWord.word)}
              className="btn btn-ghost btn-xs btn-circle hover:bg-primary/10"
              title="Tinglash"
            >
              <Volume2 className="w-3 h-3" />
            </button>
          </div>
          
          {!showMeaning ? (
            <button
              onClick={() => setShowMeaning(true)}
              className="text-xs opacity-50 hover:opacity-100 transition-opacity mt-1"
            >
              👆 Ma'nosini ko'rish uchun bosing
            </button>
          ) : (
            <div className="animate-[fadeIn_0.3s_ease-out]">
              <p className="text-sm font-medium text-primary">
                {activeWord.meaning}
              </p>
              <p className="text-xs italic opacity-60 mt-1">
                "{activeWord.example}"
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <div className="badge badge-ghost badge-xs">
                  {activeWord.level}
                </div>
                {activeWord.tip && (
                  <span className="text-[10px] opacity-40">💡 {activeWord.tip}</span>
                )}
              </div>
            </div>
          )}

          {/* AI viktorina — server yaratgan */}
          {serverWord?.quiz?.question && serverWord.quiz.options?.length >= 2 && (
            <div className="mt-3 pt-3 border-t border-base-300/60 text-left animate-[fadeIn_0.4s_ease-out]">
              <p className="text-xs font-semibold mb-2">🧠 Mini-test: {serverWord.quiz.question}</p>
              <div className="space-y-1.5">
                {serverWord.quiz.options.map((opt, i) => {
                  const isCorrect = i === serverWord.quiz.answerIndex;
                  const isChosen = quizAnswer === i;
                  let cls = 'bg-base-200 hover:bg-primary/10 border border-transparent';
                  if (quizAnswer !== null) {
                    if (isCorrect) cls = 'bg-success/15 border border-success/40 text-success';
                    else if (isChosen) cls = 'bg-error/10 border border-error/30 text-error';
                    else cls = 'bg-base-200 opacity-50 border border-transparent';
                  }
                  return (
                    <button
                      key={i}
                      disabled={quizAnswer !== null}
                      onClick={() => setQuizAnswer(i)}
                      className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all duration-200 ${cls}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="font-bold opacity-50">{String.fromCharCode(65 + i)}.</span>
                        <span className="flex-1">{opt}</span>
                        {quizAnswer !== null && isCorrect && <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
                        {quizAnswer !== null && isChosen && !isCorrect && <X className="w-3.5 h-3.5 shrink-0" />}
                      </span>
                    </button>
                  );
                })}
              </div>
              {quizAnswer !== null && (
                <p className={`text-[11px] font-medium mt-2 animate-[fadeIn_0.3s_ease-out] ${
                  quizAnswer === serverWord.quiz.answerIndex ? 'text-success' : 'text-error'
                }`}>
                  {quizAnswer === serverWord.quiz.answerIndex
                    ? "✅ To'g'ri! Ajoyib ish!" : `❌ To'g'ri javob: ${String.fromCharCode(65 + serverWord.quiz.answerIndex)}`}
                </p>
              )}
            </div>
          )}
        </div>

        {isSaved && (
          <div className="text-center text-xs text-success animate-[fadeIn_0.3s_ease-out]">
            ✅ Saqlandi!
          </div>
        )}
      </div>
    </div>
  );
}
