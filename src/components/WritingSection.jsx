import { useState } from 'react';
import { Pencil, Send, CheckCircle, ArrowRight, RotateCcw, AlertTriangle, Lightbulb } from 'lucide-react';

const COMMON_MISTAKES = {
  'teh': { correction: 'the', explanation: '"the" to\'g\'ri yozilishi' },
  'wierd': { correction: 'weird', explanation: 'i before e, except after c' },
  'recieve': { correction: 'receive', explanation: 'i before e, except after c' },
  'beleive': { correction: 'believe', explanation: 'i before e' },
  'acheive': { correction: 'achieve', explanation: 'i before e' },
  'calender': { correction: 'calendar', explanation: '-ar bilan tugaydi' },
  'definately': { correction: 'definitely', explanation: '-itely bilan yoziladi' },
  'goverment': { correction: 'government', explanation: '-nment bilan yoziladi' },
  'neccessary': { correction: 'necessary', explanation: 'bir c, ikkita s' },
  'occured': { correction: 'occurred', explanation: 'ikkita r' },
  'tommorow': { correction: 'tomorrow', explanation: 'bir m, ikkita r' },
};

function checkGrammar(text) {
  const errors = [];
  const words = text.toLowerCase().split(/\s+/);

  // Check common spelling mistakes
  words.forEach((word, i) => {
    const cleanWord = word.replace(/[^a-zA-Z]/g, '');
    if (COMMON_MISTAKES[cleanWord]) {
      errors.push({
        word: cleanWord,
        index: i,
        correction: COMMON_MISTAKES[cleanWord].correction,
        explanation: COMMON_MISTAKES[cleanWord].explanation,
        type: 'spelling',
      });
    }
  });

  // Check basic grammar patterns
  const textLower = text.toLowerCase();

  // Subject-verb agreement (basic)
  if (textLower.includes('he go') || textLower.includes('she go') || textLower.includes('it go')) {
    if (!textLower.includes('he goes') && !textLower.includes('she goes') && !textLower.includes('it goes')) {
      errors.push({
        word: 'go',
        correction: 'goes',
        explanation: 'He/She/It bilan "goes" ishlatiladi',
        type: 'grammar',
      });
    }
  }

  // Past tense
  if (textLower.includes('yesterday') || textLower.includes('last week') || textLower.includes('last year') || textLower.includes('ago')) {
    const presentVerbs = ['go', 'do', 'make', 'take', 'have', 'say', 'get'];
    presentVerbs.forEach(verb => {
      const regex = new RegExp(`\\b${verb}\\b`, 'g');
      if (regex.test(textLower) && !textLower.includes(`${verb}ing`)) {
        // Check if there's a past tense version used
        const pastTenses = { go: 'went', do: 'did', make: 'made', take: 'took', have: 'had', say: 'said', get: 'got' };
        if (!textLower.includes(pastTenses[verb])) {
          // This is a basic check, might have false positives
        }
      }
    });
  }

  return errors;
}

function countWords(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function countSentences(text) {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
}

export default function WritingSection({ exercises, langId: _langId, levelId: _levelId, onComplete }) {
  const [currentEx, setCurrentEx] = useState(0);
  const [text, setText] = useState('');
  const [showCheck, setShowCheck] = useState(false);
  const [errors, setErrors] = useState([]);
  const [score, setScore] = useState(0);
  const [completedExs, setCompletedExs] = useState(new Set());

  const exercise = exercises[currentEx];
  if (!exercise) return null;

  const isErrorCorrection = !!exercise.errors;
  const wordCount = countWords(text);
  const sentenceCount = countSentences(text);
  const reqs = exercise.requirements || { minWords: 30, maxWords: 400 };
  const meetsMinWords = wordCount >= reqs.minWords;
  const meetsMaxWords = wordCount <= reqs.maxWords;

  const handleCheck = () => {
    if (isErrorCorrection) {
      // Check error correction exercise
      let correctCount = 0;
      const foundErrors = [];
      exercise.errors.forEach(err => {
        if (text.toLowerCase().includes(err.correction.toLowerCase())) {
          correctCount++;
        } else {
          foundErrors.push(err);
        }
      });
      const percentage = Math.round((correctCount / exercise.errors.length) * 100);
      setScore(percentage);
      setErrors(foundErrors);
    } else {
      // Check essay
      const grammarErrors = checkGrammar(text);
      setErrors(grammarErrors);

      let wordScore = Math.min(100, (wordCount / reqs.minWords) * 100);
      let errorPenalty = grammarErrors.length * 10;
      let finalScore = Math.max(0, Math.min(100, Math.round(wordScore - errorPenalty)));

      // Bonus for more sentences
      if (sentenceCount >= 3) finalScore += 10;
      if (sentenceCount >= 5) finalScore += 10;

      setScore(Math.min(100, finalScore));
    }

    setShowCheck(true);

    const newCompleted = new Set(completedExs);
    newCompleted.add(currentEx);
    setCompletedExs(newCompleted);

    const percentage = isErrorCorrection 
      ? Math.round((correctCount / exercise.errors.length) * 100)
      : Math.max(0, Math.min(100, finalScore || 0));
    if (newCompleted.size >= exercises.length) {
      onComplete(percentage);
    }
  };

  const handleNext = () => {
    if (currentEx < exercises.length - 1) {
      setCurrentEx(prev => prev + 1);
      setText('');
      setShowCheck(false);
      setErrors([]);
    }
  };

  const handleReset = () => {
    setText('');
    setShowCheck(false);
    setErrors([]);
  };

  const progress = completedExs.size;
  const total = exercises.length;

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pencil className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">{exercise.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-70">{progress}/{total}</span>
          <div className="w-20 h-2 bg-base-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${(progress / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Prompt/Error text */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">
          <h4 className="font-medium text-sm opacity-70 mb-2">
            {isErrorCorrection ? '🔍 Xatolarni toping va tuzating' : '📝 Mavzu'}
          </h4>
          <div className={`${isErrorCorrection ? 'p-4 bg-error/5 rounded-xl text-sm font-mono leading-relaxed' : 'text-sm leading-relaxed'}`}>
            {isErrorCorrection ? exercise.text : exercise.prompt}
          </div>
          {!isErrorCorrection && (
            <div className="flex flex-wrap gap-2 mt-3">
              <div className="badge badge-outline gap-1">
                Min: {reqs.minWords} so'z
              </div>
              <div className="badge badge-outline gap-1">
                Max: {reqs.maxWords} so'z
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Text input */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (showCheck) {
                setShowCheck(false);
                setErrors([]);
              }
            }}
            placeholder={isErrorCorrection ? "Xatolarni tuzatib, to'g'ri matnni yozing..." : "Inshoingizni yozing..."}
            className="textarea textarea-bordered min-h-[200px] font-mono text-sm leading-relaxed"
            disabled={showCheck}
          />
          {!isErrorCorrection && (
            <div className="flex flex-wrap gap-4 mt-3 text-xs">
              <span className={meetsMinWords ? 'text-success' : 'text-error'}>
                📝 {wordCount} / {reqs.minWords} so'z
              </span>
              <span className={meetsMaxWords ? 'text-success' : 'text-warning'}>
                📏 Maks: {reqs.maxWords} so'z
              </span>
              <span className="opacity-60">
                💬 {sentenceCount} gap
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error check results */}
      {showCheck && errors.length > 0 && (
        <div className="card bg-warning/10 border border-warning shadow-sm">
          <div className="card-body p-4">
            <h4 className="font-medium flex items-center gap-2 text-warning mb-3">
              <AlertTriangle className="w-4 h-4" />
              Topilgan xatolar ({errors.length} ta)
            </h4>
            <div className="space-y-2">
              {errors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-base-100 rounded-lg text-sm">
                  <Lightbulb className="w-4 h-4 text-warning mt-0.5" />
                  <div>
                    <span className="font-medium">"{err.word}"</span>
                    <span className="opacity-60"> → </span>
                    <span className="text-success font-medium">"{err.correction}"</span>
                    <p className="text-xs opacity-60 mt-0.5">{err.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCheck && errors.length === 0 && !isErrorCorrection && (
        <div className="card bg-success/10 border border-success shadow-sm">
          <div className="card-body p-4 text-center">
            <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-sm">Grammatik xato topilmadi! Ajoyib!</p>
          </div>
        </div>
      )}

      {/* Score */}
      {showCheck && (
        <div className={`card ${score >= 80 ? 'bg-success/10 border-success' : score >= 50 ? 'bg-warning/10 border-warning' : 'bg-error/10 border-error'} border shadow-sm`}>
          <div className="card-body text-center py-6">
            <div className="text-4xl font-bold mb-2">{score}%</div>
            <p className="text-sm opacity-70">
              {score >= 80 ? '🎉 Ajoyib natija!' : score >= 50 ? '💪 Yaxshi, yana takomillashtirish mumkin' : '📚 Ko\'proq mashq qilish kerak'}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!showCheck ? (
          <button
            onClick={handleCheck}
            disabled={!text.trim() || (!isErrorCorrection && wordCount < 5)}
            className="btn btn-accent flex-1"
          >
            <Send className="w-4 h-4" />
            {isErrorCorrection ? 'Tekshirish' : 'Yuborish va tekshirish'}
          </button>
        ) : (
          <>
            {currentEx < exercises.length - 1 && (
              <button onClick={handleNext} className="btn btn-accent flex-1">
                <ArrowRight className="w-4 h-4" />
                Keyingi mashq
              </button>
            )}
            <button onClick={handleReset} className="btn btn-ghost">
              <RotateCcw className="w-4 h-4" />
              Qayta yozish
            </button>
          </>
        )}
      </div>
    </div>
  );
}
