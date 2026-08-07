// POST /api/click/webhook — Click to'lov tizimi webhook (Prepare + Complete)
// Click kabinetida "Prepare URL" va "Complete URL" sifatida shu endpoint ko'rsatiladi:
//   https://lingohub.uz/api/click/webhook
// Server-side env: CLICK_SERVICE_ID, CLICK_MERCHANT_ID, CLICK_SECRET_KEY
import { createHash } from 'node:crypto';
import { getOrder, markOrderPaid } from '../_lib/orders.js';

const SERVICE_ID = process.env.CLICK_SERVICE_ID || '';
const SECRET_KEY = process.env.CLICK_SECRET_KEY || '';

function md5(str) {
  return createHash('md5').update(String(str)).digest('hex');
}

// Click rasmiy sign formulasi:
//   sign_string = md5(click_trans_id + service_id + secret_key + merchant_trans_id +
//                     merchant_prepare_id + amount + action + sign_time)
// Prepare'da merchant_prepare_id bo'sh string bo'ladi.
function calcSign(data) {
  return md5(
    String(data.click_trans_id || '') +
    String(data.service_id || '') +
    String(SECRET_KEY || '') +
    String(data.merchant_trans_id || '') +
    String(data.merchant_prepare_id || '') +
    String(data.amount || '') +
    String(data.action || '') +
    String(data.sign_time || '')
  );
}

function respond(res, payload) {
  return res.status(200).json(payload);
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: -1, error_note: 'Method not allowed' });
  }

  const body = { ...(req.body || {}), ...(req.query || {}) };
  const action = Number(body.action);

  // ---- Sign tekshirish ----
  const expectedSign = calcSign(body);
  if (body.sign_string !== expectedSign) {
    return respond(res, {
      click_trans_id: body.click_trans_id,
      merchant_trans_id: body.merchant_trans_id,
      error: -1,
      error_note: 'SIGN CHECK FAILED',
    });
  }

  // Click ba'zan service_id ni son (JSON) ba'zan matn (form) sifatida yuboradi —
  // ikkalasini ham qabul qilish uchun String'ga o'tkazib solishtiramiz.
  if (String(body.service_id) !== String(SERVICE_ID)) {
    return respond(res, {
      click_trans_id: body.click_trans_id,
      merchant_trans_id: body.merchant_trans_id,
      error: -1,
      error_note: 'SERVICE ID CHECK FAILED',
    });
  }

  const orderId = String(body.merchant_trans_id || '');
  const order = await getOrder(orderId);
  if (!order) {
    return respond(res, {
      click_trans_id: body.click_trans_id,
      merchant_trans_id: body.merchant_trans_id,
      error: -3,
      error_note: 'Order not found',
    });
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || Math.abs(amount - order.amount) > 0.01) {
    return respond(res, {
      click_trans_id: body.click_trans_id,
      merchant_trans_id: body.merchant_trans_id,
      error: -2,
      error_note: 'Incorrect amount',
    });
  }

  // ===== Prepare (action = 0) =====
  if (action === 0) {
    return respond(res, {
      click_trans_id: body.click_trans_id,
      merchant_trans_id: body.merchant_trans_id,
      merchant_prepare_id: body.click_trans_id,
      error: 0,
      error_note: 'Success',
    });
  }

  // ===== Complete (action = 1) =====
  if (action === 1) {
    // Click to'lovni bekor/ xato deb belgilagan bo'lsa (error < 0) — to'lamaymiz
    if (Number(body.error) < 0) {
      return respond(res, {
        click_trans_id: body.click_trans_id,
        merchant_trans_id: body.merchant_trans_id,
        merchant_confirm_id: 0,
        error: -9,
        error_note: 'Click error',
      });
    }

    // Allaqachon to'langan bo'lsa — idempotent muvaffaqiyat
    if (order.status === 'paid') {
      return respond(res, {
        click_trans_id: body.click_trans_id,
        merchant_trans_id: body.merchant_trans_id,
        merchant_confirm_id: body.click_trans_id,
        error: 0,
        error_note: 'Success',
      });
    }

    await markOrderPaid(orderId, {
      clickTransId: body.click_trans_id,
      clickPaydocId: body.click_paydoc_id,
      merchant_prepare_id: body.merchant_prepare_id,
      perform_time: Date.now(),
    });

    return respond(res, {
      click_trans_id: body.click_trans_id,
      merchant_trans_id: body.merchant_trans_id,
      merchant_confirm_id: body.click_trans_id,
      error: 0,
      error_note: 'Success',
    });
  }

  // ===== Noma'lum action =====
  return respond(res, {
    click_trans_id: body.click_trans_id,
    merchant_trans_id: body.merchant_trans_id,
    error: -1,
    error_note: 'Invalid action',
  });
}
