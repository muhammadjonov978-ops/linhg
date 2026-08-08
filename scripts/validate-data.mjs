// Quick data-integrity checker for lingohub.uz
// Usage: node scripts/validate-data.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmpDir = path.join(root, 'node_modules/.cache/lingohub-validate');
mkdirSync(tmpDir, { recursive: true });

// Patch extensionless relative imports so Node ESM can resolve them
function patchModule(relPath) {
  const abs = path.join(root, relPath);
  let src = readFileSync(abs, 'utf8');
  src = src.replace(/from '(\.[^']+)'/g, (m, spec) => {
    if (!spec.endsWith('.js')) return `from '${spec}.js'`;
    return m;
  });
  const out = path.join(tmpDir, path.basename(relPath));
  writeFileSync(out, src);
  return out;
}

const languagesPath = patchModule('src/data/languages.js');
const titlesPath = patchModule('src/data/languageTitles.js');

const { languages, alphabets, getLessons } = await import(pathToFileURL(languagesPath).href);
const { languageTitles } = await import(pathToFileURL(titlesPath).href);

let errors = 0;
const err = (msg) => { errors += 1; console.error('  ✗ ' + msg); };

console.log('=== Languages ===');
console.log(`  ${languages.length} languages defined`);
const ids = new Set(languages.map(l => l.id));
for (const l of languages) {
  for (const f of ['id', 'name', 'flag', 'color', 'description']) {
    if (!l[f]) err(`${l.id}: missing field "${f}"`);
  }
}

// languageTitles: every array must have exactly 90 entries (lessons 11..100)
console.log('\n=== languageTitles (expect 90 per language) ===');
for (const [lid, titles] of Object.entries(languageTitles)) {
  if (!ids.has(lid)) err(`languageTitles has entry for unknown language "${lid}"`);
  if (!Array.isArray(titles)) { err(`${lid}: titles is not an array`); continue; }
  if (titles.length !== 90) err(`${lid}: expected 90 titles, got ${titles.length}`);
}
for (const l of languages) {
  if (!languageTitles[l.id] && l.id !== 'english') {
    console.log(`  ℹ ${l.id} uses shared fallback titles`);
  }
}

console.log('\n=== Alphabets ===');
let customAlphabets = 0;
for (const l of languages) {
  const alpha = alphabets[l.id];
  if (!alpha || !Array.isArray(alpha) || alpha.length === 0) {
    // Ko'p tillar shablon (ingliz alifbosi) asosida ishlaydi — bu xato emas
    console.log(`  ℹ ${l.id} uses template (english) alphabet`);
    continue;
  }
  customAlphabets += 1;
  const bad = alpha.filter(a => !a.letter || !a.example || !a.exampleUz);
  if (bad.length) err(`${l.id}: ${bad.length} letters missing fields (first: ${JSON.stringify(bad[0])})`);
}
console.log(`  ${customAlphabets} languages with custom alphabet, ${languages.length - customAlphabets} using template`);

console.log('\n=== Lessons (getLessons) ===');
for (const l of languages) {
  let lessons;
  try {
    lessons = getLessons(l.id);
  } catch (e) {
    err(`${l.id}: getLessons threw: ${e.message}`);
    continue;
  }
  if (!Array.isArray(lessons) || lessons.length === 0) {
    err(`${l.id}: no lessons returned`);
    continue;
  }
  if (lessons.length !== 100) err(`${l.id}: expected 100 lessons, got ${lessons.length}`);

  const numbers = new Set();
  for (const lesson of lessons) {
    if (typeof lesson.number !== 'number') { err(`${l.id}: lesson without number`); continue; }
    if (numbers.has(lesson.number)) err(`${l.id}: duplicate lesson number ${lesson.number}`);
    numbers.add(lesson.number);
    if (!lesson.title) err(`${l.id} lesson ${lesson.number}: missing title`);
    if (!lesson.exercise) { err(`${l.id} lesson ${lesson.number}: missing exercise`); continue; }
    const ex = lesson.exercise;
    if (!ex.question) err(`${l.id} lesson ${lesson.number}: exercise missing question`);
    if (!Array.isArray(ex.options) || ex.options.length < 2) {
      err(`${l.id} lesson ${lesson.number}: exercise needs >=2 options`);
    }
    if (typeof ex.correctAnswer !== 'number' || ex.correctAnswer >= (ex.options?.length || 0) || ex.correctAnswer < 0) {
      err(`${l.id} lesson ${lesson.number}: correctAnswer (${ex.correctAnswer}) out of range for ${ex.options?.length} options`);
    }
  }
}

// Sample: run full lesson generation for english and verify content types
console.log('\n=== Sample english lessons ===');
try {
  const en = getLessons('english');
  const alphaLessons = en.filter(x => x.type === 'alphabet');
  const vocab = en.find(x => x.type === 'vocabulary');
  console.log(`  ${alphaLessons.length} alphabet lessons, ${en.length - alphaLessons.length} content lessons`);
  console.log(`  vocab sample: ${vocab?.title} | q: ${vocab?.exercise?.question?.slice(0, 60)}`);
} catch (e) {
  err('english getLessons threw: ' + e.message);
}

console.log(`\n${errors === 0 ? '✅ ALL CHECKS PASSED' : `❌ ${errors} ERROR(S) FOUND`}`);
rmSync(tmpDir, { recursive: true, force: true });
process.exit(errors === 0 ? 0 : 1);
