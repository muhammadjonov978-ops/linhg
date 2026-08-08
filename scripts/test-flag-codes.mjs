// Flag.jsx dagi emojiFlagToCode funksiyasini tekshiradi
function emojiFlagToCode(flag) {
  if (!flag || typeof flag !== 'string') return null;
  const pts = Array.from(flag);
  if (pts.length === 2) {
    const a = pts[0].codePointAt(0);
    const b = pts[1].codePointAt(0);
    if (a >= 0x1F1E6 && a <= 0x1F1FF && b >= 0x1F1E6 && b <= 0x1F1FF) {
      return String.fromCharCode(a - 0x1F1E6 + 65) + String.fromCharCode(b - 0x1F1E6 + 65);
    }
  }
  if (pts[0]?.codePointAt(0) === 0x1F3F4) {
    let out = '';
    for (let i = 1; i < pts.length; i++) {
      const cp = pts[i].codePointAt(0);
      if (cp >= 0xE0061 && cp <= 0xE007A) out += String.fromCharCode(cp - 0xE0061 + 97);
    }
    if (out.length > 2) out = out.slice(2);
    return out || null;
  }
  return null;
}

const tests = [
  ['\u{1F1EC}\u{1F1E7}', 'GB'],   // GB flag
  ['\u{1F1FA}\u{1F1FF}', 'UZ'],   // UZ flag
  ['\u{1F1F3}\u{1F1F1}', 'NL'],   // NL flag
  ['\u{1F3F4}\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}', 'wls'], // Wales
  ['\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}', 'sct'], // Scotland
  ['\u{1F30D}', null],            // globe emoji
];

let failed = 0;
for (const [emoji, expected] of tests) {
  const got = emojiFlagToCode(emoji);
  const ok = got === expected;
  if (!ok) failed++;
  console.log(`${ok ? '✅' : '❌'} ${emoji} -> ${got} (kutilgan: ${expected})`);
}
console.log(failed === 0 ? '\nALL FLAG TESTS PASSED' : `\n${failed} TEST FAILED`);
process.exit(failed === 0 ? 0 : 1);
