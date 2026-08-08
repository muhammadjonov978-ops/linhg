// POST /api/payme/webhook — Payme Merchant API webhook (JSON-RPC 2.0)
// Payme kabinetida "Merchant API URL" sifatida shu endpoint ko'rsatiladi:
//   https://lingohub.uz/api/payme/webhook
// Basic auth: login = merchant_id, parol = Payme KEY (server-side env: PAYME_MERCHANT_ID, PAYME_KEY)
import { getOrder, markOrderPaid, txnKey } from '../lib/orders.js';
import { redis } from '../lib/redis.js';

const MERCHANT_ID = process.env.PAYME_MERCHANT_ID || '';
const KEY = process.env.PAYME_KEY || '';
// Payme kabinetidagi account maydon nomi (odatda "order_id")
const ACCOUNT_FIELD = process.env.PAYME_ACCOUNT_FIELD || 'order_id';

function jsonrpcError(id, code, message) {
  return { jsonrpc: '2.0', id, error: { code, message } };
}

function jsonrpcResult(id, result) {
  return { jsonrpc: '2.0', id, result };
}

// Basic auth tekshirish: "Basic base64(merchant_id:key)"
// XAVFSIZLIK: agar PAYME_KEY (yoki merchant ID) serverda o'rnatilmagan bo'lsa,
// auth tekshiruvini YOPIQ qilamiz (fail-closed). Aks holda har kim
// `Basic Og==` (bo'sh login:parol) bilan kirib, to'lovlarni "paid" qilib
// belgilashi mumkin edi — to'lov qabul qilinmasdan pul yo'qotish xavfi.
function authConfigured() {
  return Boolean(MERCHANT_ID && KEY);
}

function checkAuth(req) {
  if (!authConfigured()) return false;
  const header = req.headers.authorization || '';
  const expected = 'Basic ' + Buffer.from(`${MERCHANT_ID}:${KEY}`).toString('base64');
  return header === expected;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ jsonrpc: '2.0', error: { code: -32600, message: 'Method not allowed' } });
  }
  if (!checkAuth(req)) {
    return res.status(200).json({ jsonrpc: '2.0', id: req.body?.id ?? null, error: { code: -32504, message: 'Insufficient privilege' } });
  }

  const body = req.body || {};
  const { id, method, params } = body;

  try {
    // Redis sozlanmagan bo'lsa — buyurtma saqlash/tekshirish imkonsiz.
    // "Order topilmadi" kabi chalg'ituvchi xato o'rniga aniq xabar beramiz.
    if (!redis) {
      return res.json(jsonrpcError(id, -32000, 'KV sozlanmagan: server sozlanmagan'));
    }
    switch (method) {
      case 'CheckPerformTransaction':
        return res.json(await checkPerform(id, params));
      case 'CreateTransaction':
        return res.json(await createTransaction(id, params));
      case 'PerformTransaction':
        return res.json(await performTransaction(id, params));
      case 'CheckTransaction':
        return res.json(await checkTransaction(id, params));
      case 'CancelTransaction':
        return res.json(await cancelTransaction(id, params));
      default:
        return res.json(jsonrpcError(id, -32601, 'Method not found'));
    }
  } catch (e) {
    const code = e.code || -32000;
    return res.json(jsonrpcError(id, code, e.message || 'Internal error'));
  }
}

// ===== 1. CheckPerformTransaction — buyurtma mavjudligi va summani tekshiradi =====
async function checkPerform(id, params) {
  const account = params?.account || {};
  const orderId = account[ACCOUNT_FIELD];
  if (!orderId) {
    throw { code: -31001, message: 'Order ID topilmadi' };
  }
  const order = await getOrder(orderId);
  if (!order) {
    throw { code: -31001, message: 'Order topilmadi' };
  }
  // Payme summani TIYINda yuboradi: 1 so'm = 100 tiyin
  const expectedTiyin = Math.round(order.amount * 100);
  if (params.amount !== expectedTiyin) {
    throw { code: -31008, message: 'Summa mos emas' };
  }
  return jsonrpcResult(id, { allow: true });
}

// ===== 2. CreateTransaction — transaksiyani ro'yxatdan o'tkazadi =====
async function createTransaction(id, params) {
  const account = params?.account || {};
  const orderId = account[ACCOUNT_FIELD];
  const order = await getOrder(orderId);
  if (!order) {
    throw { code: -31001, message: 'Order topilmadi' };
  }
  const expectedTiyin = Math.round(order.amount * 100);
  if (params.amount !== expectedTiyin) {
    throw { code: -31008, message: 'Summa mos emas' };
  }

  const key = txnKey('payme', params.id);
  const existing = await redis?.get(key);
  if (existing) {
    const txn = JSON.parse(existing);
    // Payme spetsifikatsiyasi: bir xil id bilan qayta so'rov kelsa, lekin
    // buyurtma yoki summa farq qilsa — xato qaytaramiz (takroriy id bilan
    // boshqa to'lovni yopishtirib bo'lmaydi).
    if (txn.orderId !== orderId) {
      throw { code: -31001, message: 'Order ID mos emas' };
    }
    if (txn.amount !== params.amount) {
      throw { code: -31008, message: 'Summa mos emas' };
    }
    return jsonrpcResult(id, {
      create_time: txn.create_time,
      perform_time: txn.perform_time || 0,
      cancel_time: txn.cancel_time || 0,
      transaction: params.id,
      state: txn.state,
    });
  }

  const txn = {
    paymeId: params.id,
    orderId,
    amount: params.amount,
    state: 1, // created
    create_time: params.time || Date.now(),
    perform_time: 0,
    cancel_time: 0,
  };
  await redis?.set(key, JSON.stringify(txn), { ex: 60 * 60 * 24 });
  await redis?.set(`payme:order:${orderId}`, params.id, { ex: 60 * 60 * 24 });

  return jsonrpcResult(id, {
    create_time: txn.create_time,
    perform_time: 0,
    cancel_time: 0,
    transaction: params.id,
    state: 1,
  });
}

// ===== 3. PerformTransaction — to'lov muvaffaqiyatli bo'lganda chaqiriladi =====
async function performTransaction(id, params) {
  const key = txnKey('payme', params.id);
  const raw = await redis?.get(key);
  if (!raw) {
    throw { code: -31050, message: 'Transaksiya topilmadi' };
  }
  const txn = JSON.parse(raw);
  const order = await getOrder(txn.orderId);
  if (!order) {
    throw { code: -31001, message: 'Order topilmadi' };
  }

  // Allaqachon bajarilgan bo'lsa — joriy holatni qaytaramiz (idempotent)
  if (txn.state === 2) {
    return jsonrpcResult(id, {
      transaction: params.id,
      perform_time: txn.perform_time,
      state: 2,
    });
  }
  if (txn.state === -1) {
    throw { code: -31007, message: 'Transaksiya bekor qilingan' };
  }

  // Payme: PerformTransaction CreateTransaction'dan keyin 30 daqiqa ichida kelishi kerak
  if (Date.now() - txn.create_time > 30 * 60 * 1000) {
    throw { code: -31007, message: 'Transaksiya muddati tugagan' };
  }

  txn.state = 2;
  txn.perform_time = Date.now();
  await redis?.set(key, JSON.stringify(txn), { ex: 60 * 60 * 24 });

  // Order'ni "paid" deb belgilaymiz
  await markOrderPaid(txn.orderId, { paymeId: params.id, perform_time: txn.perform_time });

  return jsonrpcResult(id, {
    transaction: params.id,
    perform_time: txn.perform_time,
    state: 2,
  });
}

// ===== 4. CheckTransaction — transaksiya holatini qaytaradi =====
async function checkTransaction(id, params) {
  const key = txnKey('payme', params.id);
  const raw = await redis?.get(key);
  if (!raw) {
    throw { code: -31050, message: 'Transaksiya topilmadi' };
  }
  const txn = JSON.parse(raw);
  return jsonrpcResult(id, {
    create_time: txn.create_time,
    perform_time: txn.perform_time || 0,
    cancel_time: txn.cancel_time || 0,
    transaction: params.id,
    state: txn.state,
    reason: txn.reason ?? null,
  });
}

// ===== 5. CancelTransaction — transaksiyani bekor qiladi =====
async function cancelTransaction(id, params) {
  const key = txnKey('payme', params.id);
  const raw = await redis?.get(key);
  if (!raw) {
    throw { code: -31050, message: 'Transaksiya topilmadi' };
  }
  const txn = JSON.parse(raw);

  if (txn.state === 2) {
    // Payme spetsifikatsiyasi: to'langan (state 2) transaksiyani bekor qilib bo'lmaydi —
    // -31051 "Cannot cancel transaction" xatosi qaytariladi
    throw { code: -31051, message: 'Cannot cancel transaction' };
  }

  txn.state = -1;
  txn.cancel_time = Date.now();
  txn.reason = params.reason ?? 1;
  await redis?.set(key, JSON.stringify(txn), { ex: 60 * 60 * 24 });

  return jsonrpcResult(id, {
    transaction: params.id,
    cancel_time: txn.cancel_time,
    state: -1,
  });
}
