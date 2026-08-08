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
