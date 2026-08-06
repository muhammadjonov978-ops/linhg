import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { languages } from '../data/languages';
import { getSpeechLang } from '../utils/speech';
import {
  Send, Bot, User, Mic, MicOff, Volume2, X, Loader2,
} from 'lucide-react';

const AI_RESPONSES = {
  greeting: {
    uzbek: "Assalomu alaykum! Men sizning AI til o'qituvchingizman. Qaysi tilda mashq qilmoqchisiz? Savollar berishingiz yoki suhbatlashishingiz mumkin.",
    english: "Hello! I'm your AI language tutor. Which language would you like to practice? Feel free to ask questions or just chat!",
  },
  help: {
    uzbek: "Men bilan istalgan tilda suhbatlashishingiz, so'zlarning ma'nosini so'rashingiz, grammatikani tushuntirishimni so'rashingiz yoki talaffuz bo'yicha yordam olishingiz mumkin.",
    english: "You can chat with me in any language, ask about word meanings, grammar explanations, or get pronunciation help.",
  },
  error: {
    uzbek: "Kechirasiz, men hali o'rganayapman. Iltimos, savolingizni boshqacha tarzda so'rang.",
    english: "Sorry, I'm still learning. Please try asking your question in a different way.",
  },
  practice: {
    uzbek: (lang) => `Ajoyib! Keling ${lang} tilida suhbatlashamiz. Sizga qanday mavzu bo'yicha mashq qilish qiziq?`,
    english: (lang) => `Great! Let's practice ${lang}. What topic would you like to discuss?`,
  },
};

function generateAIResponse(userMessage, lang) {
  const msg = userMessage.toLowerCase();
  const langName = lang?.name || 'English';
  const isUzbek = msg.includes('salom') || msg.includes('assalomu') || msg.includes('rahmat') || msg.includes('qanday');

  if (msg.includes('salom') || msg.includes('hello') || msg.includes('hi') || msg.includes('assalomu')) {
    return {
      text: isUzbek
        ? `${AI_RESPONSES.greeting.uzbek} ${langName} tilida gaplashamizmi?`
        : `${AI_RESPONSES.greeting.english} Shall we practice ${langName}?`,
      isAI: true,
    };
  }

  if (msg.includes('help') || msg.includes('yordam') || msg.includes('what') || msg.includes('nima')) {
    return { text: AI_RESPONSES.help[isUzbek ? 'uzbek' : 'english'], isAI: true };
  }

  if (msg.includes('grammar') || msg.includes('grammatika') || msg.includes('tense') || msg.includes('zamon')) {
    return {
      text: isUzbek
        ? `${langName} tilida zamonlar mavzusini tushuntirib beraman. Hozirgi (Present), o'tgan (Past) va kelasi (Future) zamonlar mavjud. Qaysi zamon sizni qiziqtiradi?`
        : `In ${langName}, tenses are very important. We have Present, Past, and Future tenses. Which one would you like to learn about?`,
      isAI: true,
    };
  }

  if (msg.includes('thank') || msg.includes('rahmat') || msg.includes('thanks')) {
    return {
      text: isUzbek
        ? "Arzimaydi! Yana savolingiz bo'lsa, bemalol so'rang. Til o'rganishda muntazam mashq qilish muhim!"
        : "You're welcome! Feel free to ask more questions. Consistency is key in language learning!",
      isAI: true,
    };
  }

  // Default contextual response
  const responses = isUzbek ? [
    `Juda qiziqarli savol! ${langName} tilida bu haqda gaplashsak. Avval bir nechta asosiy so'zlarni o'rganaylik.`,
    `Yaxshi fikr! ${langName} tilida suhbatni davom ettiramiz. Menga gapiring, men sizni tuzataman.`,
    `Ajoyib! ${langName} tilida ko'proq mashq qilish kerak. Keling, ${['talim', 'sayohat', 'texnologiya', 'sanat'][Math.floor(Math.random() * 4)]} mavzusida gaplashamiz.`,
    `${langName} tilini o'rganishda sabr-toqat muhim. Siz yaxshi rivojlanayapsiz! Yana bir gap ayting.`,
  ] : [
    `That's an interesting topic! In ${langName}, let's explore this further. Try to express your thoughts.`,
    `Great practice! Keep going with ${langName}. I'll help correct your sentences.`,
    `Let's talk about ${['education', 'travel', 'technology', 'art'][Math.floor(Math.random() * 4)]} in ${langName}. What do you think?`,
    `You're doing great! Consistency is key. Tell me more in ${langName}.`,
  ];

  return {
    text: responses[Math.floor(Math.random() * responses.length)],
    isAI: true,
  };
}

export default function AITutor() {
  const { state, dispatch } = useApp();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [speakingId, setSpeakingId] = useState(null);

  const currentLang = languages.find(l => l.id === state.selectedLanguage);
  const selectedLangId = state.selectedLanguage;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.tutorMessages, isTyping]);

  // Add welcome message if no messages
  useEffect(() => {
    const lang = languages.find(l => l.id === selectedLangId);
    if (state.tutorMessages.length === 0 && lang) {
      dispatch({
        type: 'ADD_TUTOR_MESSAGE',
        payload: {
          text: `Assalomu alaykum! Men ${lang.flag} ${lang.name} til o'qituvchingizman. Istalgan savolingizni bering yoki suhbatlashamiz!`,
          isAI: true,
          timestamp: Date.now(),
        },
      });
    }
  }, [selectedLangId, state.tutorMessages.length]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input.trim(), isAI: false, timestamp: Date.now() };
    dispatch({ type: 'ADD_TUTOR_MESSAGE', payload: userMsg });
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1500));

    const aiResponse = generateAIResponse(userMsg.text, currentLang);
    dispatch({ type: 'ADD_TUTOR_MESSAGE', payload: { ...aiResponse, timestamp: Date.now() } });
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getSpeechLang(currentLang?.id);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Auto-send after speech
        setTimeout(() => {
          setInput(transcript);
          dispatch({
            type: 'ADD_TUTOR_MESSAGE',
            payload: { text: transcript, isAI: false, timestamp: Date.now() },
          });
          setInput('');
          setIsTyping(true);
          setTimeout(() => {
            const aiResponse = generateAIResponse(transcript, currentLang);
            dispatch({ type: 'ADD_TUTOR_MESSAGE', payload: { ...aiResponse, timestamp: Date.now() } });
            setIsTyping(false);
          }, 1000 + Math.random() * 1500);
        }, 300);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } else {
      alert('Speech Recognition sizning brauzeringizda qo\'llanmaydi. Chrome yoki Edge dan foydalaning.');
    }
  };

  const speakText = (text, messageId) => {
    if ('speechSynthesis' in window) {
      setSpeakingId(messageId);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getSpeechLang(currentLang?.id);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!state.isTutorOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-base-100 rounded-2xl shadow-2xl border border-base-300 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">AI Tutor</h3>
              <p className="text-xs text-white/70">
                {currentLang?.flag} {currentLang?.name || 'Language'} Assistant
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => speakText(
                "Hello! I'm your AI tutor. Ask me anything about the language!",
                'greeting'
              )}
              className="btn btn-ghost btn-xs btn-circle text-white"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_TUTOR' })}
              className="btn btn-ghost btn-xs btn-circle text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="h-96 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-base-200/50"
        >
          {state.tutorMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'} animate-[fadeIn_0.3s_ease-out]`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.isAI
                    ? 'bg-base-100 border border-base-300 rounded-tl-sm'
                    : 'bg-primary text-primary-content rounded-tr-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {msg.isAI ? (
                    <Bot className="w-4 h-4 text-primary" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span className="text-xs font-medium opacity-70">
                    {msg.isAI ? 'AI Tutor' : 'Siz'}
                  </span>
                </div>
                <p className="text-sm">{msg.text}</p>
                <div className="flex justify-end gap-2 mt-1">
                  {msg.isAI && (
                    <button
                      onClick={() => speakText(msg.text, `msg-${i}`)}
                      className="btn btn-ghost btn-xs btn-circle"
                    >
                      <Volume2 className={`w-3 h-3 ${speakingId === `msg-${i}` ? 'text-primary animate-pulse' : ''}`} />
                    </button>
                  )}
                  <span className="text-[10px] opacity-40">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-base-100 border border-base-300 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm opacity-70">Yozmoqda...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-base-300 bg-base-100">
          <div className="flex gap-2">
            <button
              onClick={toggleListening}
              className={`btn btn-circle btn-sm ${
                isListening ? 'btn-error animate-pulse' : 'btn-ghost'
              }`}
              title={isListening ? 'To\'xtatish' : 'Mikrofon'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`${currentLang?.name || 'Til'}da yozing...`}
              className="input input-bordered input-sm flex-1 bg-base-200"
              disabled={isListening}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isListening}
              className="btn btn-primary btn-sm btn-circle"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          {isListening && (
            <div className="flex items-center gap-2 mt-2 text-xs text-error">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
              </span>
              Gapiring... eshitayapman
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
