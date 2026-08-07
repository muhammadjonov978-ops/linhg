// Tez xavfsizlik tekshiruvi: admin auth + Payme/Click webhook fail-closed logikasi.
// Ishga tushirish: node scripts/test-fixes.mjs
// Hech qanday tashqi xizmatga ulanmaydi — faqat funksiya logikasi.
import assert from 'node:assert/strict';

// ---------- 1) ADMIN AUTH: sozlangan rejim ----------
process.env.ADMIN_PASSWORD = 'super-secret';
process.env.ADMIN_EXTRA_ACCOUNTS = 'ali:ali-pass:Ali';
delete process.env.ADMIN_TOKEN_SECRET;

const auth = await import('../api/_lib/adminAuth.js?t=1');

assert.equal(auth.isAuthConfigured(), true);
const owner = auth.authenticate('shox', 'super-secret');
assert.ok(owner && owner.role === 'owner', 'owner login ishladi');
const extra = auth.authenticate('ALI', 'ali-pass');
assert.ok(extra && extra.role === 'admin' && extra.name === 'Ali', 'qo\'shimcha admin login ishladi');
assert.equal(auth.authenticate('shox', 'wrong'), null, 'noto\'g\'ri parol rad etildi');

const token = auth.signToken(owner);
const verified = auth.verifyToken(token);
assert.equal(verified.username, 'shox');
assert.equal(verified.role, 'owner');
assert.equal(auth.verifyToken(token + 'x'), null, 'buzilgan token rad etildi');
assert.equal(auth.verifyToken('a.b.c'), null, 'soxta token rad etildi');
console.log('✅ Admin auth: login + token roundtrip OK');

// Handler test uchun yordamchi
const call = (handler, req, _res) => new Promise((resolve) => {
  handler(req, {
    status: (c) => ({ json: (body) => resolve({ status: c, body }) }),
    json: (body) => resolve({ status: 200, body }),
  });
});

const { default: loginHandler } = await import('../api/admin/login.js?t=2');
let r = await call(loginHandler, { method: 'POST', body: { username: 'shox', password: 'super-secret' } }, {});
assert.equal(r.body.ok, true, 'login ok');
assert.ok(r.body.token, 'token qaytadi');
r = await call(loginHandler, { method: 'POST', body: { username: 'shox', password: 'xato' } }, {});
assert.equal(r.body.ok, false);
assert.equal(r.body.code, 'invalid');

const { default: verifyHandler } = await import('../api/admin/verify.js?t=3');
r = await call(verifyHandler, { method: 'GET', query: { token } }, {});
assert.equal(r.body.ok, true, 'verify ok');
assert.equal(r.body.user.username, 'shox');
r = await call(verifyHandler, { method: 'GET', query: { token: 'fake.token.here' } }, {});
assert.equal(r.body.ok, false, 'soxta sessiya rad etildi');
console.log('✅ /api/admin/login + /api/admin/verify handlerlar OK');

// ---------- 2) ADMIN AUTH: sozlanmagan rejim (fail-closed) ----------
delete process.env.ADMIN_PASSWORD;
delete process.env.ADMIN_EXTRA_ACCOUNTS;
const authUnconf = await import('../api/_lib/adminAuth.js?t=4');
assert.equal(authUnconf.isAuthConfigured(), false);
assert.equal(authUnconf.authenticate('shox', 'anything'), null);
console.log("✅ Admin auth: ADMIN_PASSWORD yo'q — login yopiq (fail-closed)");

// ---------- 3) PAYME WEBHOOK: fail-closed ----------
const paymeBody = { jsonrpc: '2.0', id: 1, method: 'CheckPerformTransaction', params: {} };
const paymeNoEnv = await import('../api/payme/webhook.js?t=5');
r = await call(paymeNoEnv.default, { method: 'POST', headers: { authorization: 'Basic Og==' }, body: paymeBody }, {});
assert.equal(r.body.error.code, -32504, "bo'sh kalit bilan ham auth o'tmaydi (avval o'tib ketardi!)");
console.log("✅ Payme webhook: PAYME_KEY yo'q — Insufficient privilege (fail-closed)");

process.env.PAYME_MERCHANT_ID = 'm123';
process.env.PAYME_KEY = 'k456';
const paymeCfg = await import('../api/payme/webhook.js?t=6');
const goodAuth = 'Basic ' + Buffer.from('m123:k456').toString('base64');
r = await call(paymeCfg.default, { method: 'POST', headers: { authorization: goodAuth }, body: paymeBody }, {});
assert.equal(r.body.error.code, -32000, "redis sozlanmagan — aniq xabar qaytadi");
r = await call(paymeCfg.default, { method: 'POST', headers: { authorization: 'Basic Og==' }, body: paymeBody }, {});
assert.equal(r.body.error.code, -32504, "noto'g'ri auth rad etiladi");
console.log("✅ Payme webhook: to'g'ri auth o'tadi, noto'g'ri/yopiq holatlar rad etiladi");

// ---------- 4) CLICK WEBHOOK: fail-closed ----------
const clickNoEnv = await import('../api/click/webhook.js?t=7');
r = await call(clickNoEnv.default, { method: 'POST', body: { action: '0', sign_string: 'x' }, query: {} }, {});
assert.equal(r.body.error, -1);
assert.equal(r.body.error_note, 'SERVICE NOT CONFIGURED');
console.log("✅ Click webhook: CLICK_SECRET_KEY yo'q — barcha so'rovlar rad etiladi (fail-closed)");

// ---------- 5) LOGIN RATE LIMIT (brute-force himoyasi) ----------
process.env.ADMIN_PASSWORD = 'super-secret';
const { default: loginRL } = await import('../api/admin/login.js?t=8');
const ip = '203.0.113.9';
const badReq = { method: 'POST', headers: { 'x-forwarded-for': ip }, body: { username: 'shox', password: 'wrong' } };
for (let i = 0; i < 5; i++) {
  r = await call(loginRL, badReq, {});
  assert.equal(r.body.ok, false);
  assert.equal(r.body.code, 'invalid');
}
// 6-chi urinish (hatto to'g'ri parol bilan) — IP bloklangan
r = await call(loginRL, { method: 'POST', headers: { 'x-forwarded-for': ip }, body: { username: 'shox', password: 'super-secret' } }, {});
assert.equal(r.body.code, 'rate_limited');
console.log('✅ Login rate limit ishlaydi (5 xato urinishdan keyin blok)');

// ---------- 6) HEALTH + PRICES endpointlari ----------
const { default: healthHandler } = await import('../api/health.js?t=9');
r = await call(healthHandler, { method: 'GET' }, {});
assert.equal(r.body.ok, true);
assert.equal(typeof r.body.services.redis, 'boolean');
assert.equal(typeof r.body.services.adminAuth, 'boolean');
console.log('✅ /api/health ishlaydi');

const { default: pricesHandler } = await import('../api/prices.js?t=10');
r = await call(pricesHandler, { method: 'GET' }, {});
assert.equal(r.body.ok, true);
assert.equal(r.body.prices.korean, 20000);
console.log('✅ /api/prices ishlaydi');

console.log("\n🎉 BARCHA TEKSHIRUVLAR O'TDI");
