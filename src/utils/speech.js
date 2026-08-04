// ==== SPEECH SYNTHESIS HELPERS ====
// Maps language ids (from data/languages.js) to BCP-47 locale codes
// so the browser picks the correct voice for each language.

export const SPEECH_LANGS = {
  english: 'en-US',
  spanish: 'es-ES',
  french: 'fr-FR',
  german: 'de-DE',
  italian: 'it-IT',
  portuguese: 'pt-BR',
  russian: 'ru-RU',
  korean: 'ko-KR',
  japanese: 'ja-JP',
  chinese: 'zh-CN',
  arabic: 'ar-SA',
  hindi: 'hi-IN',
  turkish: 'tr-TR',
  dutch: 'nl-NL',
  polish: 'pl-PL',
  swedish: 'sv-SE',
  norwegian: 'nb-NO',
  danish: 'da-DK',
  finnish: 'fi-FI',
  greek: 'el-GR',
  hebrew: 'he-IL',
  thai: 'th-TH',
  vietnamese: 'vi-VN',
  indonesian: 'id-ID',
  romanian: 'ro-RO',
  czech: 'cs-CZ',
  ukrainian: 'uk-UA',
};

// Cache voices (voices load asynchronously in some browsers)
let cachedVoices = [];
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
  loadVoices();
  // Preserve any existing handler to avoid clobbering other components
  const prevHandler = window.speechSynthesis.onvoiceschanged;
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
    if (typeof prevHandler === 'function') prevHandler.call(window.speechSynthesis);
  };
}

export function getSpeechLang(langId) {
  return SPEECH_LANGS[langId] || 'en-US';
}

function pickVoice(langCode) {
  if (!cachedVoices.length) cachedVoices = window.speechSynthesis.getVoices();
  const langPrefix = langCode.split('-')[0].toLowerCase();
  // Prefer exact match, then language prefix match
  return (
    cachedVoices.find(v => v.lang.toLowerCase() === langCode.toLowerCase()) ||
    cachedVoices.find(v => v.lang.toLowerCase().startsWith(langPrefix)) ||
    null
  );
}

/**
 * Speak the given text in the given language.
 * Returns false if speech synthesis is unsupported.
 */
export function speak(text, langId, { rate = 0.85, pitch = 1, onEnd, onError } = {}) {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.();
    return false;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const langCode = getSpeechLang(langId);
  utterance.lang = langCode;
  utterance.rate = rate;
  utterance.pitch = pitch;

  const voice = pickVoice(langCode);
  if (voice) utterance.voice = voice;

  if (onEnd) utterance.onend = onEnd;
  if (onError) utterance.onerror = onError;

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
