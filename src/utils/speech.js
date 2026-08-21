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
  uzbek: 'uz-UZ',
  kazakh: 'kk-KZ',
  kyrgyz: 'ky-KG',
  tajik: 'tg-TJ',
  turkmen: 'tk-TM',
  azerbaijani: 'az-AZ',
  armenian: 'hy-AM',
  georgian: 'ka-GE',
  belarusian: 'be-BY',
  bulgarian: 'bg-BG',
  croatian: 'hr-HR',
  serbian: 'sr-RS',
  bosnian: 'bs-BA',
  slovenian: 'sl-SI',
  slovak: 'sk-SK',
  hungarian: 'hu-HU',
  estonian: 'et-EE',
  latvian: 'lv-LV',
  lithuanian: 'lt-LT',
  icelandic: 'is-IS',
  irish: 'ga-IE',
  maltese: 'mt-MT',
  albanian: 'sq-AL',
  macedonian: 'mk-MK',
  urdu: 'ur-PK',
  bengali: 'bn-BD',
  punjabi: 'pa-IN',
  marathi: 'mr-IN',
  tamil: 'ta-IN',
  telugu: 'te-IN',
  kannada: 'kn-IN',
  malayalam: 'ml-IN',
  gujarati: 'gu-IN',
  odia: 'or-IN',
  nepali: 'ne-NP',
  sinhala: 'si-LK',
  burmese: 'my-MM',
  khmer: 'km-KH',
  lao: 'lo-LA',
  malay: 'ms-MY',
  filipino: 'fil-PH',
  mongolian: 'mn-MN',
  persian: 'fa-IR',
  pashto: 'ps-AF',
  kurdish: 'ku-TR',
  uyghur: 'ug-CN',
  swahili: 'sw-KE',
  amharic: 'am-ET',
  somali: 'so-SO',
  hausa: 'ha-NG',
  yoruba: 'yo-NG',
  igbo: 'ig-NG',
  zulu: 'zu-ZA',
  xhosa: 'xh-ZA',
  afrikaans: 'af-ZA',
  shona: 'sn-ZW',
  kinyarwanda: 'rw-RW',
  malagasy: 'mg-MG',
  wolof: 'wo-SN',
  twi: 'tw-GH',
  bambara: 'bm-ML',
  tigrinya: 'ti-ER',
  oromo: 'om-ET',
  cantonese: 'yue-HK',
  taiwanese: 'zh-TW',
  quechua: 'qu-PE',
  guarani: 'gn-PY',
  aymara: 'ay-BO',
  haitian: 'ht-HT',
  inuktitut: 'iu-CA',
  navajo: 'nv-US',
  esperanto: 'eo-EO',
  latin: 'la-VA',
  welsh: 'cy-GB',
  scottish: 'gd-GB',
  basque: 'eu-ES',
  catalan: 'ca-ES',
  galician: 'gl-ES',
  occitan: 'oc-FR',
  breton: 'br-FR',
  corsican: 'co-FR',
  frisian: 'fy-NL',
  luxembourgish: 'lb-LU',
  feroese: 'fo-FO',
  sami: 'se-NO',
  kashmiri: 'ks-IN',
  sindhi: 'sd-PK',
  assamese: 'as-IN',
  divehi: 'dv-MV',
  sorbian: 'hsb-DE',
  hawaiian: 'haw-US',
  maori: 'mi-NZ',
  samoan: 'sm-WS',
  tongan: 'to-TO',
  fijian: 'fj-FJ',
  tahitian: 'ty-PF',
  tibetan: 'bo-CN',
  tamazight: 'zgh-MA',
  nahuatl: 'nah',
  mapudungun: 'arn-CL',
  jamaican: 'jam-JM',
  cree: 'cr-CA',
  ainu: 'ja-JP',
  balochi: 'bal',
  konkani: 'kok-IN',
  manipuri: 'mni-IN',
  romani: 'rmy',
  zazaki: 'diq-TR',
};

// Google Translate TTS supported languages (subset that works well)
const GOOGLE_TTS_LANGS = new Set([
  'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ko', 'ja', 'zh', 'ar',
  'hi', 'tr', 'nl', 'pl', 'sv', 'nb', 'da', 'fi', 'el', 'he', 'th',
  'vi', 'id', 'ro', 'cs', 'uk', 'uz', 'kk', 'ky', 'tg', 'az', 'hy',
  'ka', 'be', 'bg', 'hr', 'sr', 'bs', 'sl', 'sk', 'hu', 'et', 'lv',
  'lt', 'is', 'ga', 'mt', 'sq', 'mk', 'ur', 'bn', 'pa', 'mr', 'ta',
  'te', 'kn', 'ml', 'gu', 'ne', 'si', 'my', 'km', 'lo', 'ms', 'fil',
  'mn', 'fa', 'ps', 'sw', 'am', 'so', 'ha', 'yo', 'ig', 'zu', 'xh',
  'af', 'sn', 'rw', 'mg', 'wo', 'ti', 'om', 'qu', 'gn', 'ay', 'ht',
  'iu', 'nv', 'eo', 'la', 'cy', 'gd', 'eu', 'ca', 'gl', 'oc', 'br',
  'co', 'fy', 'lb', 'fo', 'se', 'ks', 'sd', 'as', 'dv', 'haw', 'mi',
  'sm', 'to', 'fj', 'bo', 'zgh',
]);

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

/**
 * Get the language prefix (e.g. 'en' from 'en-US') for a given langId.
 */
function getLangPrefix(langId) {
  const code = getSpeechLang(langId);
  return code.split('-')[0].toLowerCase();
}

/**
 * Check if a native voice exists for the given language.
 * Returns the voice object or null.
 */
function findNativeVoice(langId) {
  if (!cachedVoices.length) cachedVoices = window.speechSynthesis.getVoices();
  const langCode = getSpeechLang(langId);
  const langPrefix = langCode.split('-')[0].toLowerCase();

  // 1) Exact match (e.g. "en-US")
  const exact = cachedVoices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
  if (exact) return exact;

  // 2) Prefix match (e.g. "en-GB" for "en-US")
  const prefix = cachedVoices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
  if (prefix) return prefix;

  // 3) Any voice with matching language family (e.g. "en-XX")
  const family = cachedVoices.find(v => v.lang.split('-')[0].toLowerCase() === langPrefix);
  if (family) return family;

  return null;
}

/**
 * Check if the browser has a native voice for the given language.
 * Useful for showing voice availability to the user.
 */
export function hasNativeVoice(langId) {
  return findNativeVoice(langId) !== null;
}

/**
 * Get list of all available browser voices.
 */
export function getAvailableVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  if (!cachedVoices.length) cachedVoices = window.speechSynthesis.getVoices();
  return cachedVoices;
}

// ===== Google Translate TTS =====
// Uses the free Google Translate TTS endpoint (no API key needed).
// We split long texts into chunks of ~200 chars to avoid 414 / truncation.

const GOOGLE_TTS_URL = 'https://translate.google.com/translate_tts';

function chunkText(text, maxLen = 200) {
  if (text.length <= maxLen) return [text];
  const chunks = [];
  const sentences = text.replace(/([.!?])\s+/g, '$1|').split('|');
  let current = '';
  for (const s of sentences) {
    if ((current + ' ' + s).trim().length > maxLen) {
      if (current) chunks.push(current.trim());
      current = s;
    } else {
      current = (current + ' ' + s).trim();
    }
  }
  if (current.trim()) chunks.push(current.trim());
  // If a single "sentence" is still too long, split by words
  const result = [];
  for (const c of chunks) {
    if (c.length <= maxLen) {
      result.push(c);
    } else {
      const words = c.split(/\s+/);
      let buf = '';
      for (const w of words) {
        if ((buf + ' ' + w).trim().length > maxLen) {
          if (buf) result.push(buf.trim());
          buf = w;
        } else {
          buf = (buf + ' ' + w).trim();
        }
      }
      if (buf.trim()) result.push(buf.trim());
    }
  }
  return result;
}

/**
 * Play audio via Google Translate TTS.
 * Returns a Promise that resolves when done (or on error).
 */
function playGoogleTTS(text, langId, { rate = 0.85, onEnd, onError } = {}) {
  const langPrefix = getLangPrefix(langId);
  // Google TTS only supports certain languages
  if (!GOOGLE_TTS_LANGS.has(langPrefix)) {
    onError?.(new Error(`Google TTS does not support: ${langPrefix}`));
    return false;
  }

  const chunks = chunkText(text);
  let idx = 0;

  const playNext = () => {
    if (idx >= chunks.length) {
      onEnd?.();
      return;
    }
    const chunk = chunks[idx];
    idx++;
    const url = `${GOOGLE_TTS_URL}?ie=UTF-8&tl=${langPrefix}&client=tw-ob&q=${encodeURIComponent(chunk)}`;

    const audio = new Audio(url);
    audio.playbackRate = rate;

    audio.onended = () => {
      if (idx < chunks.length) {
        // Small gap between chunks
        setTimeout(playNext, 80);
      } else {
        onEnd?.();
      }
    };

    audio.onerror = () => {
      // Google TTS failed — try native browser speech as last resort
      playNativeFallback(text, langId, { rate, onEnd, onError });
    };

    audio.play().catch(() => {
      playNativeFallback(text, langId, { rate, onEnd, onError });
    });
  };

  playNext();
  return true;
}

/**
 * Last resort: use native browser speech (may speak in wrong language).
 */
function playNativeFallback(text, langId, { rate = 0.85, onEnd, onError } = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const langCode = getSpeechLang(langId);
  utterance.lang = langCode;
  utterance.rate = rate;
  utterance.pitch = 1;

  const voice = findNativeVoice(langId);
  if (voice) utterance.voice = voice;

  if (onEnd) utterance.onend = onEnd;
  if (onError) utterance.onerror = onError;

  window.speechSynthesis.speak(utterance);
}

/**
 * Speak the given text in the given language.
 *
 * Strategy:
 * 1) If browser has a native voice for this language → use it (fastest, best quality)
 * 2) Otherwise → use Google Translate TTS (works for 100+ languages)
 * 3) Last resort → native browser synthesis (may speak in wrong voice)
 *
 * Returns false if speech synthesis is unsupported.
 */
export function speak(text, langId, { rate = 0.85, pitch = 1, onEnd, onError } = {}) {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.();
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const nativeVoice = findNativeVoice(langId);

  if (nativeVoice) {
    // Native voice available — use browser speech synthesis (best quality)
    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = getSpeechLang(langId);
    utterance.lang = langCode;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.voice = nativeVoice;

    if (onEnd) utterance.onend = onEnd;
    if (onError) utterance.onerror = onError;

    window.speechSynthesis.speak(utterance);
    return true;
  }

  // No native voice — try Google Translate TTS
  const langPrefix = getLangPrefix(langId);
  if (GOOGLE_TTS_LANGS.has(langPrefix)) {
    return playGoogleTTS(text, langId, { rate, onEnd, onError });
  }

  // Nothing available — use native browser synthesis as last resort
  playNativeFallback(text, langId, { rate, onEnd, onError });
  return true;
}

/**
 * Speak text using a phonetic/romanized fallback.
 * Useful for scripts that TTS engines struggle with (Arabic, some Cyrillic, etc.).
 * The `phonetic` text is spoken instead of `text` using English TTS as a neutral voice.
 */
export function speakPhonetic(text, langId, { phonetic, rate = 0.85, onEnd, onError } = {}) {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.();
    return false;
  }
  window.speechSynthesis.cancel();

  // If a phonetic override is provided and the script is non-Latin,
  // speak the phonetic version with English voice for clear pronunciation
  if (phonetic) {
    const utterance = new SpeechSynthesisUtterance(phonetic);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.pitch = 1;
    const enVoice = findNativeVoice('english');
    if (enVoice) utterance.voice = enVoice;
    if (onEnd) utterance.onend = onEnd;
    if (onError) utterance.onerror = onError;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  // Fallback to normal speak
  return speak(text, langId, { rate, onEnd, onError });
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  // Also stop any Google TTS audio elements
  if (typeof window !== 'undefined') {
    document.querySelectorAll('audio[src*="translate.google.com"]').forEach(a => {
      try { a.pause(); a.src = ''; } catch { /* ignore */ }
    });
  }
}
