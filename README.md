# Lingohub.uz — 130+ Tilda Bepul Til O'rganish

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
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com/api-keys) → API key (AI Tutor uchun) | **MAXFIY** |
| `VITE_VAPID_PUBLIC_KEY` | `npx web-push generate-vapid-keys` (push uchun) | Ochiq |
| `VAPID_PRIVATE_KEY` | xuddi shu buyruqdan (push uchun) | **MAXFIY** |
| `UPSTASH_REDIS_REST_URL` | [console.upstash.com](https://console.upstash.com) → Database → REST API (bepul) | MAXFIY |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash → REST API | **MAXFIY** |
| `PREMIUM_MONTHLY_PRICE` | Pro obuna oylik narxi (so'm). Default `49000` — `src/config.js` bilan bir xil bo'lishi shart | MAXFIY |
| `PREMIUM_YEARLY_PRICE` | Pro obuna yillik narxi (so'm). Default `490000` | MAXFIY |
| `VITE_CLICK_MERCHANT_ID` | (ixtiyoriy) Click ham qo'shmoqchi bo'lsangiz | Ochiq |
| `VITE_CLICK_SERVICE_ID` | (ixtiyoriy) Click ham qo'shmoqchi bo'lsangiz | Ochiq |
| `CLICK_SECRET_KEY` | (ixtiyoriy) Click secret key | **MAXFIY** |
| `ADMIN_PASSWORD` | Admin panel egasi paroli. **MAJBURIY** — o'rnatilmasa panelga kirish butunlay yopiq | **MAXFIY** |
| `ADMIN_USERNAME` | (ixtiyoriy) Admin login, default `shxsh` | MAXFIY |
| `ADMIN_NAME` | (ixtiyoriy) Egasining ismi, default `Shox` | MAXFIY |
| `ADMIN_TOKEN_SECRET` | (ixtiyoriy) Sessiya token imzosi — bo'sh bo'lsa `ADMIN_PASSWORD` ishlatiladi | MAXFIY |
| `ADMIN_EXTRA_ACCOUNTS` | (ixtiyoriy) Qo'shimcha adminlar: `login:parol:Ism,login2:parol2:Ism2` | **MAXFIY** |

> ⚠️ `VITE_` prefiksli o'zgaruvchilar brauzerga ko'rinadi — ular maxfiy emas.
> `PAYME_KEY`, `CLICK_SECRET_KEY`, `UPSTASH_*` lar `VITE_` PREFIKSISIZ yoziladi
> va faqat server (api/) funksiyalarida ishlatiladi.
>
> 📄 Mahalliy ishlash uchun `.env.example` ni `.env` deb nusxalab, xuddi shu
> qiymatlarni to'ldiring (`.env` git'ga qo'shilmaydi).

> 💰 **Narxlar server'da qat'iy tekshiriladi!** To'lov summasi `server/lib/prices.js`
> dagi ro'yxat bo'yicha tekshiriladi — foydalanuvchi arzonroq summa yuborib
> til/premium ochib ola olmaydi. **Narx o'zgartirganda** `server/lib/prices.js` va
> `src/data/siteConfig.js` (DEFAULT_CONFIG.prices) ni birga yangilab, deploy qiling.
> Admin paneldagi narx o'zgarishi faqat ko'rinish uchun — to'lov miqdori server
> ro'yxatidan olinadi.

### 1.1. Deploy qilishdan oldin (MUHIM!)

- `api/` papkasi **git'ga qo'shilgan va Vercel'ga deploy bo'lgan** bo'lishi shart.
  Vercel **Hobby planda deploy uchun ko'pi bilan 12 ta serverless funksiya** qo'shish
  mumkin — shuning uchun barcha API **bitta funksiyaga** birlashtirilgan:
  `api/index.js` (router). Barcha `/api/*` so'rovlar unga keladi
  (vercel.json'dagi rewrite orqali) va u handler'larni chaqiradi.
  Handler kodlari `server/handlers/` da, umumiy logika `server/lib/` da —
  bu fayllar funksiya EMAS (cheklovga kirmaydi).
- Loyiha ildizida `vercel.json` bor — u Vite frontend + `api/index.js` funksiyani
  Vercel'da to'g'ri sozlashni ta'minlaydi (rewrites + maxDuration).
- Deploy'dan so'ng tekshiring: `https://lingohub.uz/api/payment/status?orderId=test123`
  so'roviga `{ "ok": false, ... }` qaytsa ham API ishlayapti (order yo'q degani).

> 🔧 **Yangi endpoint qo'shish:** `server/handlers/` ga handler yarating va uni
> `api/index.js` dagi `routes` ro'yxatiga qo'shing — yangi serverless funksiya
> yaratish shart EMAS (cheklovga ta'sir qilmaydi).

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
   | `ADMIN_PASSWORD` | O'zingiz tanlagan kuchli parol (**MAJBURIY** — default parol olib tashlangan!) |
   | `ADMIN_USERNAME` | (ixtiyoriy) Login — default `shxsh` |
   | `ADMIN_NAME` | (ixtiyoriy) Ism — default `Shox` |
   | `ADMIN_TOKEN_SECRET` | (ixtiyoriy) Uzoq tasodifiy satr — sessiya token imzosi |
   | `ADMIN_EXTRA_ACCOUNTS` | (ixtiyoriy) `login:parol:Ism,login2:parol2:Ism2` |

2. Deploy qiling. Endi `#/admin` da **login: `shxsh`** + siz tanlagan parol bilan kiriladi.
3. `ADMIN_PASSWORD` o'rnatilmagan bo'lsa panelga kirish **butunlay yopiq**
   ("Admin panel server'da sozlanmagan" xatosi chiqadi) — bu ataylab qilingan
   xavfsizlik choralari. `shxsh1010` standart paroli kod'dan **butunlay olib
   tashlandi** — endi hech kim ochiq default parol bilan kira olmaydi.

### Admin hisoblarini panel'da yaratish (endi HAQIQIY ishlaydi!)

Admin panel → **Hisoblar** bo'limida yangi login/parol yaratganingizda bu hisob
**server'da saqlanadi va darhol ishlaydi** — paneldan chiqib, yaratgan login/parol
bilan qaytadan kirishingiz mumkin (avvalgi versiyada bu faqat ko'rinish uchun edi
va "Login yoki parol noto'g'ri" xatosi chiqardi).

- **Redis o'rnatilgan bo'lsa** (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`)
  — hisoblar barcha qurilmalarda **doimiy** saqlanadi.
- **Redis bo'lmasa** — demo rejim: hisoblar vaqtincha server xotirasida turadi.
- Parol **faqat server'da** saqlanadi, brauzerga hech qachon chiqmaydi.
- Yangi hisob yaratish/o'chirish — faqat **ega** (owner) uchun.

### Jonli faoliyat (kim kirganini ko'rish)

Admin paneldagi **Jonli faoliyat** bo'limi har 15 soniyada server'dan o'qib turadi:
bugungi kirishlar soni, jami kirishlar, hozir onlayn adminlar va so'nggi kirish
urinishlari (kim, qachon, muvaffaqiyatlimi, IP). Server mavjud bo'lmasa,
shu brauzerdagi lokal log ko'rsatiladi.

## Yangi funksiyalar (2026 avgust)

### 🧠 Flashcard (Spaced Repetition)
`#/flashcards` — darslardan avtomatik yaratilgan so'z kartalari. Leitner
quti tizimi: bilganingiz sari takrorlash oralig'i oshadi (1 kun → 15 kun).
Taraqqiyot har til uchun localStorage'da saqlanadi.

### 🏆 Reyting jadvali
`#/leaderboard` — global TOP-10 + podium. Firebase kalitlari sozlangan
bo'lsa reyting barcha o'quvchilar o'rtasida umumiy va onlayn sinxronlanadi
(`leaderboard/` tuguni). Sozlanmagan bo'lsa demo rejim ishlaydi.

### 🤖 Haqiqiy AI Tutor
`/api/ai/chat` — OpenAI (gpt-4o-mini) orqali jonli suhbat. Kalit faqat
serverda: Vercel'ga `OPENAI_API_KEY` qo'shing. Sozlanmagan bo'lsa AI Tutor
eski tayyor javoblarga (fallback) ishlaydi — sayt buzilmaydi.

### 📜 Sertifikat
Tilni 100% tugatganda — `Sertifikat` tugmasi chiqadi. Canvas orqali
chiroyli sertifikat chizilib, PNG sifatida yuklab olinadi / chop etiladi.

### 🎙️ Talaffuzni baholash (yaxshilangan)
Speaking mashqlarida Levenshtein masofasi + so'z mosligi asosida aniqroq
baholash (`src/lib/pronunciation.js`).

### ☁️ Bulutli sinxronlash
Google/email orqali kirgan foydalanuvchida taraqqiyot Firebase Realtime
Database'da saqlanadi (`users/{uid}/data`) — boshqa qurilmada davom etish
mumkin. Merge qoidalari: har dars uchun eng yaxshi ball, tangalar maksimum,
yutuqlar birlashtiriladi.

### 🔔 Push-notifikatsiya + PWA
- `public/sw.js` — offline rejim + push qabul qilish
- Sayt telefonga o'rnatilishi mumkin (manifest bor)
- Kunlik streak eslatmasi (Notification API)
- Web Push: Vercel'ga VAPID kalitlar qo'shilsa `/api/push/subscribe` +
  `/api/push/send` ishlaydi (Redis'da obunalar saqlanadi)

### 📊 Haftalik hisobot
`#/report` — so'nggi 7 kundagi darslar, faol kunlar, tangalar, yutuqlar
charti. Telegram/WhatsApp'da ulashish tugmalari bilan.

## Yana yangi funksiyalar (2026 avgust)

### 🎯 Daraja testi (placement test)
`#/placement` — 15 savollik test foydalanuvchining CEFR darajasini (A1–C1)
aniklaydi (`state.level`). Savollar shu tilning o'z darslaridan avtomatik
yasaladi — barcha 130+ til uchun ishlaydi. Birinchi marta topshirilganda
+50 tanga bonus. Natija Language Dashboard'da badge sifatida ko'rinadi.

### 📐 Grammatika bo'limi
`#/grammar` — har bir til uchun grammatika darslari: qoida (o'zbekcha izoh),
misollar (TTS bilan tinglash mumkin) va mini-test. Progress
`${langId}-grammar-${id}` da saqlanadi, har muvaffaqiyatli mavzu uchun
+20 tanga. Hozircha mavjud tillar: English, Русский, 한국어, العربية,
Español, Français, Deutsch, O'zbekcha.

### 📋 Kunlik va haftalik missiyalar
`#/missions` — tanga yig'ish uchun kunlik (6 ta) va haftalik (6 ta) vazifalar.
Kunlik har kuni, haftalik har dushanba yangilanadi.

### 📖 Lug'at (dictionary)
`#/dictionary` — darslardan avtomatik yig'ilgan so'zlar bo'yicha qidiruv.
Istalgan tilni tanlab, so'z yoki o'zbekcha ma'nosi bo'yicha izlash, TTS bilan
tinglash mumkin.

### 🎁 Do'st taklif qilish (referral)
`#/referral` — shaxsiy taklif havolasi (`/?ref=KOD#/`). Havola orqali kelgan
foydalanuvchi +50 tanga oladi; hisob yaratib birinchi darsni tugatganda
inviterga +30 tanga (Firebase'da `referrals/{kod}/` orqali kuzatiladi).

### 🗂️ Flashcard Anki eksporti
Flashcard sahifasida "Anki" tugmasi — kartalar Anki'ga import qilish mumkin
bo'lgan TSV (`.txt`) yoki CSV formatida yuklab olinadi.

### 📲 Progressni ulashish
Sertifikat, haftalik hisobot va statistika — Telegram / WhatsApp / X da
ulashish tugmalari qo'shildi.

### 🎧 AI Tutor ovozli rejimi
AI Tutor boshida 🎧 tugma — yoqilganda AI javoblari avtomatik o'qib
eshittiriladi (speechSynthesis). Mikrofon bilan gapirish avvalgidek ishlaydi.

### Sayt tillari (UZ / RU / ENG)

Sayt tepasidagi (Navbar) **UZ · RU · ENG** tugmalari interfeysni o'zgartiradi.
Tanlangan til brauzerda saqlanadi. Tarjimalar `src/i18n.jsx` da — yangi matn
qo'shilsa 3 tilda ham yoziladi.

Qo'shimcha xavfsizlik choralari (tavsiya):

- **Payme/Click**: `PAYME_KEY`, `CLICK_SECRET_KEY`, `UPSTASH_*` lar o'rnatilmagan bo'lsa,
  webhook'lar va to'lov API'si ishlamaydi (fail-closed) — bu ataylab qilingan,
  bo'sh kalit bilan to'lovlarni "paid" qilib bo'lmaydi.
- **Firebase Realtime Database**: `adminCoins` va foydalanuvchi ma'lumotlari yoziladigan
  yo'llarga (path) Realtime Database Rules'da faqat autentifikatsiya qilingan
  foydalanuvchilarga yozish ruxsatini cheklang.

