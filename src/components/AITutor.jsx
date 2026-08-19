import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { languages } from '../data/languages';
import { getSpeechLang } from '../utils/speech';
import {
  FaPaperPlane as Send, FaRobot as Bot, FaUser as User, FaMicrophone as Mic,
  FaMicrophoneSlash as MicOff, FaVolumeUp as Volume2, FaTimes as X, FaSpinner as Loader2,
  FaHeadphones as Headphones,
} from 'react-icons/fa';

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
  // Ovozli rejim: yoqilgan bo'lsa AI javoblari avtomatik o'qib eshittiriladi
  const [voiceMode, setVoiceMode] = useState(() => {
    try {
      return localStorage.getItem('lingohub_tutor_voice') === 'on';
    } catch {
      return false;
    }
  });

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
  }, [selectedLangId, state.tutorMessages.length, dispatch]);

  const speakTextAuto = (text, id) => {
    if (!text || !voiceMode) return;
    speakText(text, id);
  };

  // Haqiqiy AI serverga so'rov yuboradi; muvaffaqiyatsiz bo'lsa —
  // tayyor (rule-based) javoblar ishlatiladi (fallback).
  const fetchAIReply = async (userMessage, history) => {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          language: currentLang?.name || 'English',
          uiLang: 'uz',
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.ok || !data.reply) return null;
      return data.reply;
    } catch {
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input.trim(), isAI: false, timestamp: Date.now() };
    dispatch({ type: 'ADD_TUTOR_MESSAGE', payload: userMsg });
    setInput('');
    setIsTyping(true);

    // So'nggi 12 xabarni kontekst sifatida yuboramiz
    const history = [...state.tutorMessages, userMsg]
      .slice(-12)
      .map((m) => ({ role: m.isAI ? 'assistant' : 'user', content: m.text }));

    const aiReply = await fetchAIReply(userMsg.text, history);

    if (aiReply) {
      dispatch({ type: 'ADD_TUTOR_MESSAGE', payload: { text: aiReply, isAI: true, timestamp: Date.now() } });
      if (voiceMode) speakTextAuto(aiReply, `auto-${Date.now()}`);
    } else {
      // Fallback: server sozlanmagan / xato — tayyor javoblar
      await new Promise((r) => setTimeout(r, 900 + Math.random() * 700));
      const aiResponse = generateAIResponse(userMsg.text, currentLang);
      dispatch({ type: 'ADD_TUTOR_MESSAGE', payload: { ...aiResponse, timestamp: Date.now() } });
      if (voiceMode) speakTextAuto(aiResponse.text, `auto-${Date.now()}`);
    }
    setIsTyping(false);
  };

  const toggleVoiceMode = () => {
    const next = !voiceMode;
    setVoiceMode(next);
    try {
      localStorage.setItem('lingohub_tutor_voice', next ? 'on' : 'off');
    } catch { /* ignore */ }
    if (next) {
      speakText(
        "Ovozli rejim yoqildi! Endi AI javoblarini avtomatik eshitasiz.",
        'voice-on'
      );
    }
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
              <div className="mt-0.5">
                <span className="badge badge-xs bg-white/20 border-0 text-[9px]">
                  {navigator?.onLine ? '⚡ AI' : '📴 Offline'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            {/* Ovozli rejim toggle */}
            <button
              onClick={toggleVoiceMode}
              className={`btn btn-ghost btn-xs btn-circle text-white relative ${voiceMode ? 'bg-white/25' : ''}`}
              title={voiceMode ? "Ovozli rejim: yoqilgan" : "Ovozli rejim: o'chiq"}
            >
              <Headphones className={`w-4 h-4 ${voiceMode ? 'animate-pulse' : 'opacity-70'}`} />
              {voiceMode && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400 animate-ping" />
              )}
            </button>
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
                    <Bot className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <User className="w-4 h-4 shrink-0" />
                  )}
                  <span className="text-xs font-medium opacity-70">
                    {msg.isAI ? 'AI Tutor' : 'Siz'}
                  </span>
                </div>
                <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                <div className="flex items-center justify-end gap-3 mt-2 pt-1 border-t border-base-300/40">
                  {msg.isAI && (
                    <button
                      onClick={() => speakText(msg.text, `msg-${i}`)}
                      className="btn btn-ghost btn-xs btn-circle h-5 min-h-0 w-5"
                      title="Tinglash"
                    >
                      <Volume2 className={`w-2.5 h-2.5 ${speakingId === `msg-${i}` ? 'text-primary animate-pulse' : ''}`} />
                    </button>
                  )}
                  <span className="text-[10px] opacity-40 tabular-nums">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-[fadeIn_0.3s_ease-out]">
              <div className="bg-base-100 border border-base-300 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-primary shrink-0" />
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
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
