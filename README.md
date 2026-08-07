# Lingohub.uz — 27 Tilda Bepul Til O'rganish

React + Vite asosida qurilgan interaktiv til o'rganish platformasi.

## Ishga tushirish

```bash
npm install
npm run dev
```

## To'lov tizimi (Payme)

Saytda **haqiqiy** to'lov qabul qilish uchun (demo emas!) Payme Business
merchant hisobi kerak. Kod to'liq tayyor — quyidagi bosqichlarni bajarish kifoya.

### 0. Payme Business hisob ochish (bir marta, 1–2 kun)

1. **https://business.payme.uz** saytiga kiring (yoki payme.uz → "Бизнесу").
2. **Ro'yxatdan o'ting** — Payme faqat yuridik shaxslar bilan ishlaydi:
   - ИП (yakka tartibdagi tadbirkor) yoki MCHJ/OOO
   - INN (STIR), direktor pasporti, bank rekvizitlari
   > ИП bo'lmasangiz — eng tez yo'l: soliq idorasida yoki `my.gov.uz` orqali
   > ИП ochish (bir kunda), keyin Payme'ga murojaat qilish.
3. **Kassa turini tanlang:** saytga to'lov uchun **"Касса для приёма платежей с биллингом"**
   (billing'li kassa) kerak.
4. Arizani yuboring — Payme odatda **1–2 ish kuni** ichida tasdiqlaydi.
5. Tasdiqlangach, kabinetga kiring:
   - **merchant_id** — Kassa sozlamalarida ko'rinadi (masalan `5e6c9d0a...`)
   - **KEY** — "Xizmat kaliti" (service key) bo'limida **generatsiya qiling** (maxfiy!)

Keyingi bosqichlarga o'ting:

### 1. Vercel'da maxfiy o'zgaruvchilar (Environment Variables)

Vercel → Project → Settings → Environment Variables (barcha environment'larga qo'shing):

| O'zgaruvchi | Manba | Maxfiylik |
|---|---|---|
| `VITE_PAYME_MERCHANT_ID` | Payme kabineti → Kassa (0-bosqich) | Ochiq |
| `PAYME_KEY` | Payme kabineti → Xizmat kaliti (0-bosqich) | **MAXFIY** |
| `PAYME_ACCOUNT_FIELD` | Odatiy: `order_id` — o'zgartirmang | MAXFIY |
| `VITE_SITE_URL` | `https://lingohub.uz` | Ochiq |
| `UPSTASH_REDIS_REST_URL` | [console.upstash.com](https://console.upstash.com) → Database → REST API (bepul) | MAXFIY |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash → REST API | **MAXFIY** |
| `PREMIUM_MONTHLY_PRICE` | Pro obuna oylik narxi (so'm). Default `49000` — `src/config.js` bilan bir xil bo'lishi shart | MAXFIY |
| `PREMIUM_YEARLY_PRICE` | Pro obuna yillik narxi (so'm). Default `490000` | MAXFIY |
| `VITE_CLICK_MERCHANT_ID` | (ixtiyoriy) Click ham qo'shmoqchi bo'lsangiz | Ochiq |
| `VITE_CLICK_SERVICE_ID` | (ixtiyoriy) Click ham qo'shmoqchi bo'lsangiz | Ochiq |
| `CLICK_SECRET_KEY` | (ixtiyoriy) Click secret key | **MAXFIY** |
| `ADMIN_PASSWORD` | Admin panel egasi paroli (server-side login) | **MAXFIY** |
| `ADMIN_USERNAME` | (ixtiyoriy) Admin login, default `shox` | MAXFIY |
| `ADMIN_NAME` | (ixtiyoriy) Egasining ismi, default `Shox` | MAXFIY |
| `ADMIN_TOKEN_SECRET` | (ixtiyoriy) Sessiya token imzosi — bo'sh bo'lsa `ADMIN_PASSWORD` ishlatiladi | MAXFIY |
| `ADMIN_EXTRA_ACCOUNTS` | (ixtiyoriy) Qo'shimcha adminlar: `login:parol:Ism,login2:parol2:Ism2` | **MAXFIY** |

> ⚠️ `VITE_` prefiksli o'zgaruvchilar brauzerga ko'rinadi — ular maxfiy emas.
> `PAYME_KEY`, `CLICK_SECRET_KEY`, `UPSTASH_*` lar `VITE_` PREFIKSISIZ yoziladi
> va faqat server (api/) funksiyalarida ishlatiladi.
>
> 📄 Mahalliy ishlash uchun `.env.example` ni `.env` deb nusxalab, xuddi shu
> qiymatlarni to'ldiring (`.env` git'ga qo'shilmaydi).

> 💰 **Narxlar server'da qat'iy tekshiriladi!** To'lov summasi `api/_lib/prices.js`
> dagi ro'yxat bo'yicha tekshiriladi — foydalanuvchi arzonroq summa yuborib
> til/premium ochib ola olmaydi. **Narx o'zgartirganda** `api/_lib/prices.js` va
> `src/data/siteConfig.js` (DEFAULT_CONFIG.prices) ni birga yangilab, deploy qiling.
> Admin paneldagi narx o'zgarishi faqat ko'rinish uchun — to'lov miqdori server
> ro'yxatidan olinadi.

### 1.1. Deploy qilishdan oldin (MUHIM!)

- `api/` papkasi **git'ga qo'shilgan va Vercel'ga deploy bo'lgan** bo'lishi shart —
  u Vercel serverless funksiyalarni o'z ichiga oladi (`/api/payment/*`, `/api/payme/*`, `/api/click/*`).
  Agar loyiha faqat frontend'ni deploy qilgan bo'lsa, to'lov ishlamaydi.
- Loyiha ildizida `vercel.json` bor — u Vite frontend + `api/` funksiyalarni
  Vercel'da to'g'ri sozlashni ta'minlaydi.
- Deploy'dan so'ng tekshiring: `https://lingohub.uz/api/payment/status?orderId=test123`
  so'roviga `{ "ok": false, ... }` qaytsa ham API ishlayapti (order yo'q degani).

### 2. Payme kabinetida webhook'ni sozlash

Payme kabinetida → Kassa → sozlamalar → **Merchant API URL**:
```
https://lingohub.uz/api/payme/webhook
```
Basic auth (kabinetda ko'rsatiladi): login = `PAYME_MERCHANT_ID`, parol = `PAYME_KEY`.

> Kod Payme'ning 5 metodini to'liq qo'llab-quvvatlaydi: CheckPerformTransaction,
> CreateTransaction, PerformTransaction, CheckTransaction, CancelTransaction.

*(Ixtiyoriy) Click qo'shsangiz: Click kabinetida → Xizmat → sozlamalar →
Prepare URL va Complete URL → `https://lingohub.uz/api/click/webhook`)*

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

To'lov oqimini to'liq sinash uchun (haqiqiy Payme kabi so'rovlar yuboradi):

```bash
node scripts/test-payme-webhook.mjs
```

Bu skript `CheckPerformTransaction → CreateTransaction → PerformTransaction`
ketma-ketligini yuborib, order `paid` bo'lganini tekshiradi — bu **demo to'lov
emas**, tizim to'g'ri sozlanganini isbotlovchi test.

Payme kabinetidagi **"Test"** tugmasi orqali ham xuddi shu oqimni jonli
saytda sinab ko'rishingiz mumkin.

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

## Admin panel xavfsizligi (server-side login)

Ilgari admin paroli brauzer kodida ochiq saqlanardi (`shox1010`) — buni har kim ko'rib,
`#/admin` orqali panelga kirishi mumkin edi. Endi login **server'da** tekshiriladi:

1. Vercel → Project → Settings → Environment Variables ga qo'shing:

   | O'zgaruvchi | Qiymat |
   |---|---|
   | `ADMIN_PASSWORD` | O'zingiz tanlagan kuchli parol (majburiy) |
   | `ADMIN_USERNAME` | (ixtiyoriy) Login — default `shox` |
   | `ADMIN_NAME` | (ixtiyoriy) Ism — default `Shox` |
   | `ADMIN_TOKEN_SECRET` | (ixtiyoriy) Uzoq tasodifiy satr — sessiya token imzosi |
   | `ADMIN_EXTRA_ACCOUNTS` | (ixtiyoriy) `login:parol:Ism,login2:parol2:Ism2` |

2. Deploy qiling. Endi `#/admin` da faqat ushbu login/parol bilan kiriladi.
3. `ADMIN_PASSWORD` o'rnatilmagan bo'lsa — panel "Admin panel server'da sozlanmagan"
   degan xato ko'rsatadi va kirishni butunlay yopib qo'yadi (xavfsiz default).

Qo'shimcha xavfsizlik choralari (tavsiya):

- **Payme/Click**: `PAYME_KEY`, `CLICK_SECRET_KEY`, `UPSTASH_*` lar o'rnatilmagan bo'lsa,
  webhook'lar va to'lov API'si ishlamaydi (fail-closed) — bu ataylab qilingan,
  bo'sh kalit bilan to'lovlarni "paid" qilib bo'lmaydi.
- **Firebase Realtime Database**: `adminCoins` va foydalanuvchi ma'lumotlari yoziladigan
  yo'llarga (path) Realtime Database Rules'da faqat autentifikatsiya qilingan
  foydalanuvchilarga yozish ruxsatini cheklang.

