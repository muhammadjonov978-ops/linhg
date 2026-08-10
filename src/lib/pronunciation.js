// ==== TALAFFUZNI BAHOLASH ====
// Speech Recognition natijasini mo'ljal (target) so'z bilan solishtirib,
// 0-100 oralig'ida aniq baho beradi. Levenshtein masofasi + so'z mosligi +
// belgilar mosligi birlashtiriladi — oddiy tenglikdan ancha ishonchli.

// Levenshtein masofasi — ikki satr orasidagi tahrirlashlar soni
export function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,        // o'chirish
        curr[j - 1] + 1,    // qo'shish
        prev[j - 1] + cost, // almashtirish
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

// Belgilarni soddalashtirish: kichik harf, diakritik belgilarsiz, harf bo'lmaganlarni olib tashlash.
// "café" → "cafe", "CÔTE" → "cote", "Здравствуйте" → "здравствуйте"
export function normalizeText(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zа-яё0-9\u0400-\u04FF\uac00-\ud7af\u3040-\u30ff\u4e00-\u9fff]/g, '');
}

// Levenshtein asosidagi o'xshashlik 0-100
export function similarityByEdit(a, b) {
  if (!a && !b) return 100;
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 100;
  const dist = levenshtein(a, b);
  return Math.max(0, Math.round((1 - dist / maxLen) * 100));
}

// So'z darajasidagi moslik: mo'ljal so'zlarining nechtasi talaffuzda uchradi
export function wordMatchScore(spokenNorm, targetNorm) {
  if (!targetNorm) return 0;
  const targetWords = targetNorm.split(/\s+/).filter(Boolean);
  if (targetWords.length === 0) return 0;
  const spokenWords = spokenNorm.split(/\s+/).filter(Boolean);

  let matched = 0;
  targetWords.forEach((tw) => {
    const hit = spokenWords.some((sw) => {
      if (sw === tw) return true;
      const sim = similarityByEdit(sw, tw);
      // Qisqa so'zlarda 85%+, uzun so'zlarda 70%+ yetarli
      const threshold = tw.length <= 4 ? 85 : 70;
      return sim >= threshold;
    });
    if (hit) matched++;
  });
  return Math.round((matched / targetWords.length) * 100);
}

// Asosiy baholash funksiyasi — SpeakingSection ishlatadi
export function calculateAccuracy(spoken, target) {
  const spokenNorm = normalizeText(spoken);
  const targetNorm = normalizeText(target);
  if (!spokenNorm || !targetNorm) return 0;

  const editScore = similarityByEdit(spokenNorm, targetNorm);
  const wordScore = wordMatchScore(spokenNorm, targetNorm);

  // Edit masofasi asosiy, so'z mosligi qo'shimcha og'irlik
  let final = Math.round(editScore * 0.7 + wordScore * 0.3);

  // To'liq teng — 100
  if (spokenNorm === targetNorm) final = 100;

  return Math.max(0, Math.min(100, final));
}

// Ball → sifat tavsifi + emoji
export function scoreFeedback(score) {
  if (score >= 90) return { label: 'Ajoyib talaffuz!', emoji: '🌟', color: 'text-success' };
  if (score >= 75) return { label: 'Juda yaxshi!', emoji: '👍', color: 'text-success' };
  if (score >= 60) return { label: 'Yaxshi, biroz yaxshilash mumkin', emoji: '😊', color: 'text-warning' };
  if (score >= 40) return { label: 'O\'rtacha — ko\'proq mashq qiling', emoji: '🙂', color: 'text-warning' };
  return { label: 'Qayta urinib ko\'ring', emoji: '💪', color: 'text-error' };
}
