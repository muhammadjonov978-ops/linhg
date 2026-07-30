import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Volume2, Bookmark, BookmarkCheck, ChevronRight, Sparkles } from 'lucide-react';

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
  const { state, dispatch } = useApp();
  const [isSaved, setIsSaved] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);

  // Get today's word based on date
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const langId = state.selectedLanguage || 'english';
  const words = wordDatabase[langId] || wordDatabase.english;
  const wordIndex = Math.abs(dateStr.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % words.length;
  const todaysWord = words[wordIndex];

  const speakWord = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langId === 'russian' ? 'ru-RU' : `${langId}-US`;
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="card-body p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-bold text-sm">Kun so'zi</h3>
          </div>
          <button
            onClick={() => {
              setIsSaved(!isSaved);
              if (!isSaved) {
                dispatch({ type: 'ADD_XP', payload: 5 });
              }
            }}
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
              {todaysWord.word}
            </h2>
            <button
              onClick={() => speakWord(todaysWord.word)}
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
                {todaysWord.meaning}
              </p>
              <p className="text-xs italic opacity-60 mt-1">
                "{todaysWord.example}"
              </p>
              <div className="badge badge-ghost badge-xs mt-2">
                {todaysWord.level}
              </div>
            </div>
          )}
        </div>

        {isSaved && (
          <div className="text-center text-xs text-success animate-[fadeIn_0.3s_ease-out]">
            ✅ Saqlandi! +5 XP
          </div>
        )}
      </div>
    </div>
  );
}
