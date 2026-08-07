// ============================================================
// Payme webhook oqimini to'liq sinash skripti
// ------------------------------------------------------------
// Bu skript HAQIQIY Payme kabi JSON-RPC so'rovlarini yuboradi:
//   CheckPerformTransaction → CreateTransaction → PerformTransaction
// va oxirida order "paid" bo'lganini tekshiradi. Demo to'lov EMAS —
// bu tizim to'g'ri sozlanganini isbotlaydigan test vositasi.
//
// Foydalanish:
//   1) api/ funksiyalari ishlashi uchun `vercel dev` ishga tushiring
//   2) .env faylida quyidagilarni to'ldiring:
//        PAYME_MERCHANT_ID, PAYME_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
//   3) node scripts/test-payme-webhook.mjs
//   4) URL boshqa portda bo'lsa:  BASE_URL=http://localhost:3001 node scripts/test-payme-webhook.mjs
// ============================================================

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// --- .env faylini o'qish (oddiy parser) ---
function loadEnv() {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}
loadEnv();

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const MERCHANT_ID = process.env.PAYME_MERCHANT_ID || '';
const KEY = process.env.PAYME_KEY || '';

if (!MERCHANT_ID || !KEY) {
  console.error('❌ .env faylida PAYME_MERCHANT_ID va PAYME_KEY to\'ldirilmagan.');
  console.error('   (Payme kabinetidan keyin — README bo\'limiga qarang)');
  process.exit(1);
}

const AUTH = 'Basic ' + Buffer.from(`${MERCHANT_ID}:${KEY}`).toString('base64');
// Server narxni api/_lib/prices.js'dagi ro'yxat bo'yicha qat'iy tekshiradi —
// shuning uchun haqiqiy pullik til va uning narxini ishlatamiz.
const LANG_ID = 'korean';
const AMOUNT_SUM = 20000; // korean tili narxi — 20 000 so'm
const TIYIN = AMOUNT_SUM * 100; // Payme summani tiyinda yuboradi

let passed = 0;
let failed = 0;
function check(step, ok, detail) {
  if (ok) {
    passed++;
    console.log(`  ✅ ${step}${detail ? ` — ${detail}` : ''}`);
  } else {
    failed++;
    console.error(`  ❌ ${step}${detail ? ` — ${detail}` : ''}`);
  }
}

// Payme webhook'ga JSON-RPC so'rov
async function rpc(method, params) {
  const res = await fetch(`${BASE}/api/payme/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: AUTH },
    body: JSON.stringify({ jsonrpc: '2.0', id: Math.floor(Math.random() * 1e9), method, params }),
  });
  return { http: res.status, body: await res.json() };
}

const orderId = 'test-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

console.log(`\n🔌 Test ma'lumotlari:`);
console.log(`   Base URL:   ${BASE}`);
console.log(`   Order ID:   ${orderId}`);
console.log(`   Summa:      ${AMOUNT_SUM} so'm (${TIYIN} tiyin)`);
console.log(`   Auth:       Basic ${MERCHANT_ID}:***`);
console.log('\n▶ 1-qadam: order yaratish (POST /api/payment/create)\n');

let createRes;
try {
  createRes = await fetch(`${BASE}/api/payment/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId,
      langId: LANG_ID,
      amount: AMOUNT_SUM,
      provider: 'payme',
      plan: 'language',
    }),
  });
} catch {
  console.error(`❌ Serverga ulanishmadi (${BASE}). \`vercel dev\` ishlayotganini tekshiring.`);
  process.exit(1);
}
const createData = await createRes.json().catch(() => null);
check('Order yaratildi', createRes.ok && createData?.ok, createData?.error || `status=${createRes.status}`);

console.log('\n▶ 2-qadam: CheckPerformTransaction (Payme buyurtmani tekshiradi)\n');
const checkPerf = await rpc('CheckPerformTransaction', {
  amount: TIYIN,
  account: { order_id: orderId },
});
check(
  'CheckPerformTransaction → allow:true',
  checkPerf.body?.result?.allow === true,
  checkPerf.body?.error?.message || JSON.stringify(checkPerf.body?.result || {})
);

console.log('\n▶ 3-qadam: CreateTransaction (to\'lov boshlanadi)\n');
const txnId = 'txn-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
const createTxn = await rpc('CreateTransaction', {
  id: txnId,
  time: Date.now(),
  amount: TIYIN,
  account: { order_id: orderId },
});
check(
  'CreateTransaction → state:1 (created)',
  createTxn.body?.result?.state === 1,
  createTxn.body?.error?.message || `state=${createTxn.body?.result?.state}`
);

console.log('\n▶ 4-qadam: PerformTransaction (foydalanuvchi to\'ladi)\n');
const performTxn = await rpc('PerformTransaction', { id: txnId });
check(
  'PerformTransaction → state:2 (completed)',
  performTxn.body?.result?.state === 2,
  performTxn.body?.error?.message || `state=${performTxn.body?.result?.state}`
);

console.log('\n▶ 5-qadam: Order holatini tekshirish (GET /api/payment/status)\n');
const statusRes = await fetch(`${BASE}/api/payment/status?orderId=${encodeURIComponent(orderId)}`);
const statusData = await statusRes.json().catch(() => null);
check('Order status = paid', statusData?.status === 'paid', `status=${statusData?.status || statusData?.error}`);

console.log('\n' + '='.repeat(52));
console.log(`  NATIJA: ${passed} ta muvaffaqiyatli, ${failed} ta xato`);
console.log('='.repeat(52));

if (failed === 0) {
  console.log('\n🎉 Tizim to\'g\'ri ishlayapti! Endi Payme kabinetida');
  console.log('   "Test" tugmasi orqali ham xuddi shu oqimni sinab ko\'rishingiz mumkin.\n');
} else {
  console.log('\n⚠️  Xatolar topildi. Ko\'p uchraydigan sabablar:');
  console.log('   • PAYME_KEY noto\'g\'ri yoki kabinetdagi bilan mos emas');
  console.log('   • UPSTASH_REDIS_REST_URL/TOKEN noto\'g\'ri');
  console.log('   • order yaratilishida xato (yuqoridagi xabarga qarang)\n');
}
process.exit(failed === 0 ? 0 : 1);
