import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { languages, getLessons } from '../data/languages';
import { speak } from '../utils/speech';
import {
  FaArrowLeft as ArrowLeft, FaSearch as Search, FaVolumeUp as Volume2,
  FaBook as BookOpen, FaTimes as X, FaFeather as Feather,
} from 'react-icons/fa';

// Darslardan barcha so'zlarni yig'adi (har bir til uchun avtomatik)
function buildDictionary(langId) {
  const lessons = getLessons(langId);
  const seen = new Set();
  const entries = [];

  lessons.forEach((lesson) => {
    // Alifbo harflari
    if (lesson.type === 'alphabet' && lesson.content?.letters?.length) {
      lesson.content.letters.forEach((l) => {
        const key = `a:${l.letter}`;
        if (seen.has(key)) return;
        seen.add(key);
        entries.push({
          id: key,
          front: l.letter,
          back: l.example,
          backUz: l.exampleUz || '',
          pronunciation: l.pronunciation || '',
          kind: 'letter',
          lesson: lesson.number,
        });
      });
      return;
    }
    // So'z mashqlari
    const ex = lesson.exercise;
    if (!ex || !Array.isArray(ex.options)) return;
    const m = String(ex.question || '').match(/"([^"]+)"/);
    const front = m ? m[1] : null;
    const back = ex.options[ex.correctAnswer];
    if (!front || !back) return;
    const key = `w:${front.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    entries.push({
      id: key,
      front,
      back,
      backUz: '',
      pronunciation: '',
      kind: 'word',
      lesson: lesson.number,
    });
  });

  return entries.sort((a, b) => a.front.localeCompare(b.front));
}

export default function DictionaryPage({ onBack }) {
  const { state } = useApp();
  const [query, setQuery] = useState('');
  const [langId, setLangId] = useState(state.selectedLanguage || 'english');
  const [filterKind, setFilterKind] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState(null);

  const currentLang = languages.find((l) => l.id === langId) || languages[0];
  const entries = useMemo(() => buildDictionary(langId), [langId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (filterKind !== 'all' && e.kind !== filterKind) return false;
      if (!q) return true;
      return (
        e.front.toLowerCase().includes(q) ||
        e.back.toLowerCase().includes(q) ||
        e.backUz.toLowerCase().includes(q) ||
        (e.pronunciation && e.pronunciation.toLowerCase().includes(q))
      );
    });
  }, [entries, query, filterKind]);

  // A harfi bo'yicha guruhlash
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((e) => {
      const letter = (e.front[0] || '#').toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(e);
    });
    return Object.keys(map).sort();
  }, [filtered]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn btn-ghost btn-sm btn-circle" title="Orqaga">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-sky-500/25">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold flex items-center gap-2">
              Lug'at <span className="text-sm opacity-60">· {currentLang.flag} {currentLang.name}</span>
            </h1>
            <p className="text-xs opacity-60">{entries.length} ta so'z · darslardan avtomatik yig'ilgan</p>
          </div>
        </div>

        {/* Til tanlash */}
        <select
          value={langId}
          onChange={(e) => { setLangId(e.target.value); setSelectedEntry(null); }}
          className="select select-bordered select-sm max-w-[180px]"
        >
          {languages.slice(0, 40).map((l) => (
            <option key={l.id} value={l.id}>{l.flag} {l.name}</option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`${currentLang.name} yoki o'zbekcha so'z qidiring...`}
          className="input input-bordered w-full pl-11 pr-10"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Filter kind */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'Barchasi' },
          { id: 'word', label: '📝 So\'zlar' },
          { id: 'letter', label: '🔤 Harflar' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterKind(f.id)}
            className={`btn btn-xs ${filterKind === f.id ? 'btn-primary' : 'btn-ghost'}`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto self-center text-[10px] opacity-40">{filtered.length} ta natija</span>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 p-10 text-center">
          <Feather className="w-10 h-10 opacity-30 mx-auto mb-2" />
          <p className="opacity-60">«{query}» bo'yicha hech narsa topilmadi</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((letter) => (
            <div key={letter}>
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {letter}
                </span>
                <div className="flex-1 h-px bg-base-300" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">                    {filtered.filter((e) => (e.front[0] || '#').toUpperCase() === letter).map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEntry(selectedEntry?.id === e.id ? null : e)}
                    className={`card bg-base-100 border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      selectedEntry?.id === e.id ? 'border-primary ring-1 ring-primary/30' : 'border-base-300'
                    }`}
                  >
                    <div className="card-body p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base break-all">{e.front}</span>
                        {e.kind === 'letter' && (
                          <span className="badge badge-xs badge-info">harf</span>
                        )}
                        <button
                          onClick={(ev) => { ev.stopPropagation(); speak(e.kind === 'letter' ? e.back : e.front, langId, { rate: 0.8 }); }}
                          className="btn btn-ghost btn-xs btn-circle ml-auto"
                          title="Tinglash"
                        >
                          <Volume2 className="w-3 h-3 text-primary" />
                        </button>
                      </div>
                      {e.kind === 'letter' && (
                        <p className="text-xs opacity-60 break-words">{e.back} {e.backUz ? `· ${e.backUz}` : ''}</p>
                      )}
                      {e.kind === 'word' && <p className="text-xs opacity-60 break-words">{e.back}</p>}
                      <div className="flex items-center gap-2 mt-1 text-[9px] opacity-40">
                        {e.pronunciation && <span className="font-mono">{e.pronunciation}</span>}
                        <span>· dars {e.lesson}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected word detail */}
      {selectedEntry && (
        <div className="fixed inset-x-0 bottom-0 z-40 p-4 pointer-events-none">
          <div className="max-w-4xl mx-auto card bg-base-100 border border-primary/30 shadow-2xl p-4 pointer-events-auto animate-[fadeInUp_0.3s_ease-out]">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div className="flex-1">
                <p className="font-bold text-lg">{selectedEntry.front}</p>
                <p className="text-sm opacity-70">{selectedEntry.back}</p>
                {selectedEntry.backUz && <p className="text-xs opacity-50">{selectedEntry.backUz}</p>}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => speak(selectedEntry.kind === 'letter' ? selectedEntry.back : selectedEntry.front, langId)}
                  className="btn btn-primary btn-sm btn-circle"
                  title="Tinglash"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedEntry(null)} className="btn btn-ghost btn-sm btn-circle">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
