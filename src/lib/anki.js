// ==== ANKI EKSPORTI ====
// Flashcard'lar Anki'ga import qilish mumkin bo'lgan TSV fayl ko'rinishida
// yuklab olinadi. Anki'da: File → Import → .txt faylni tanlash.
// Ustunlar: Front (oldi) | Back (orqasi) | Talaffuz | Tarjima

export function deckToAnkiTsv(deck) {
  const esc = (v = '') => String(v).replace(/\t/g, ' ').replace(/\r?\n/g, ' ');
  const lines = ['Front\tBack\tPronunciation\tUzbek Meaning'];
  deck.forEach((c) => {
    lines.push([esc(c.front), esc(c.back), esc(c.pronunciation), esc(c.backUz)].join('\t'));
  });
  return lines.join('\n');
}

// CSV (vergul bilan) — Excel/Google Sheets uchun ham ochiladi
export function deckToCsv(deck) {
  const esc = (v = '') => {
    const s = String(v ?? '').replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const lines = ['Front,Back,Pronunciation,Uzbek Meaning'];
  deck.forEach((c) => {
    lines.push([esc(c.front), esc(c.back), esc(c.pronunciation), esc(c.backUz)].join(','));
  });
  return lines.join('\n');
}

export function downloadTextFile(filename, content, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadAnkiTsv(deck, langId) {
  downloadTextFile(`lingohub-${langId || 'til'}-flashcards.txt`, deckToAnkiTsv(deck));
}

export function downloadCsv(deck, langId) {
  downloadTextFile(`lingohub-${langId || 'til'}-flashcards.csv`, deckToCsv(deck));
}
