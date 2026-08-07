# Lingohub.uz — 27 Tilda Bepul Til O'rganish

React + Vite asosida qurilgan interaktiv til o'rganish platformasi.

## Ishga tushirish

```bash
npm install
npm run dev
```

## To'lov tizimi (Payme + Click)

Saytda haqiqiy to'lov qabul qilish uchun quyidagilar kerak:

### 1. Vercel'da maxfiy o'zgaruvchilar (Environment Variables)

Vercel → Project → Settings → Environment Variables:

| O'zgaruvchi | Manba | Maxfiylik |
|---|---|---|
| `VITE_PAYME_MERCHANT_ID` | Payme kabineti → Kassa | Ochiq |
| `VITE_CLICK_MERCHANT_ID` | Click kabineti | Ochiq |
| `VITE_CLICK_SERVICE_ID` | Click kabineti → Service | Ochiq |
| `VITE_SITE_URL` | Sayt manzili (masalan `https://lingohub.uz`) | Ochiq |
| `PAYME_KEY` | Payme kabineti → Xizmat kaliti | **MAXFIY** |
| `PAYME_ACCOUNT_FIELD` | Odatiy: `order_id` | MAXFIY |
| `CLICK_SECRET_KEY` | Click kabineti → Secret key | **MAXFIY** |
| `UPSTASH_REDIS_REST_URL` | [console.upstash.com](https://console.upstash.com) → REST API | MAXFIY |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash → REST API | **MAXFIY** |
| `PREMIUM_MONTHLY_PRICE` | Pro obuna oylik narxi (so'm). Default `49000` — `src/config.js` bilan bir xil bo'lishi shart | MAXFIY |
| `PREMIUM_YEARLY_PRICE` | Pro obuna yillik narxi (so'm). Default `490000` | MAXFIY |

> ⚠️ `VITE_` prefiksli o'zgaruvchilar brauzerga ko'rinadi — ular maxfiy emas.
> `PAYME_KEY`, `CLICK_SECRET_KEY`, `UPSTASH_*` lar `VITE_` PREFIKSISIZ yoziladi
> va faqat server (api/) funksiyalarida ishlatiladi.

### 1.1. Deploy qilishdan oldin (MUHIM!)

- `api/` papkasi **git'ga qo'shilgan va Vercel'ga deploy bo'lgan** bo'lishi shart —
  u Vercel serverless funksiyalarni o'z ichiga oladi (`/api/payment/*`, `/api/payme/*`, `/api/click/*`).
  Agar loyiha faqat frontend'ni deploy qilgan bo'lsa, to'lov ishlamaydi.
- Loyiha ildizida `vercel.json` bor — u Vite frontend + `api/` funksiyalarni
  Vercel'da to'g'ri sozlashni ta'minlaydi.
- Deploy'dan so'ng tekshiring: `https://lingohub.uz/api/payment/status?orderId=test123`
  so'roviga `{ "ok": false, ... }` qaytsa ham API ishlayapti (order yo'q degani).

### 2. Webhook URL'larni kabinetlarda sozlash

**Payme** kabinetida → Kassa → sozlamalar → **Merchant API URL**:
```
https://lingohub.uz/api/payme/webhook
```
Basic auth: login = `PAYME_MERCHANT_ID`, parol = `PAYME_KEY`.

**Click** kabinetida → Xizmat → sozlamalar → **Prepare URL** va **Complete URL**:
```
https://lingohub.uz/api/click/webhook
```

### 3. To'lov jarayoni qanday ishlaydi

1. Foydalanuvchi "To'lash" tugmasini bosadi → `POST /api/payment/create` order yaratadi (Upstash Redis'da saqlanadi)
2. Sayt foydalanuvchini Payme/Click checkout sahifasiga yo'naltiradi
3. To'lovdan so'ng Payme/Click webhook orqali backend'ni xabardor qiladi (`/api/payme/webhook`, `/api/click/webhook`)
4. Backend order holatini `paid` deb belgilaydi
5. Foydalanuvchi saytga qaytganda (`?payment=ORDER_ID`) frontend holatni so'rab, til/premium'ni ochadi

### Mahalliy (local) sinash

```bash
vercel dev
```
`vercel dev` serverless funksiyalarni (`api/`) ham ishga tushiradi.

### Xatolarni tekshirish

| Muammo | Sabab / Yechim |
|---|---|
| "To'lov tizimi hali sozlanmagan" | Vercel'da `VITE_PAYME_MERCHANT_ID` yoki `VITE_CLICK_MERCHANT_ID`+`VITE_CLICK_SERVICE_ID` yo'q |
| `POST /api/payment/create` → 500 "KV sozlanmagan" | `UPSTASH_REDIS_REST_URL`/`TOKEN` Vercel'da yo'q yoki `api/` deploy bo'lmagan |
| Payme xato: "Merchant API URL not found" | Payme kabinetida URL `https://lingohub.uz/api/payme/webhook` deb ko'rsatilmagan yoki Basic auth noto'g'ri |
| Click xato: "SIGN CHECK FAILED" | `CLICK_SECRET_KEY` kabinetdagi bilan mos emas; `CLICK_SERVICE_ID` ham tekshiring |
| To'lov o'tdi, lekin til ochilmadi | Foydalanuvchi `?payment=ORDER_ID` bilan qaytganini tekshiring; order `paid` bo'lsa sahifani yangilang |

Payme kabinetida **"Test"** tugmasi orqali webhook'ni bevosita sinab ko'rish mumkin
(CheckPerform/Create/Perform ketma-ketligi), Click'da esa test rejimda kichik summa bilan sinab ko'ring.

