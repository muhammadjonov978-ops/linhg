// ==== GRAMMATIKA DARSLARI ====
// Har bir til uchun grammatika mavzulari: izoh (o'zbekcha), misollar va
// mini-test (3 savol). `level` — tavsiya etilgan CEFR daraja.
// Progress `state.progress[`${langId}-grammar-${id}`]` da saqlanadi.

export const GRAMMAR_LANGS = {
  english: [
    {
      id: 'present-simple',
      title: 'Present Simple (Hozirgi oddiy zamon)',
      icon: '⏰',
      level: 'A1',
      explanation:
        "Present Simple — doimiy harakatlar, odatlar va haqiqatlar uchun ishlatiladi.\n\nQurilish: Subjekt + fe'l (I/You/We/They → fe'l o'zi; He/She/It → fe'lga -s/-es qo'shiladi).\n\nInkor: don't / doesn't + fe'l. Savol: Do/Does + subjekt + fe'l?",
      examples: [
        { target: 'I drink tea every morning.', uz: "Men har kuni ertalab choy ichaman." },
        { target: 'She works in a bank.', uz: "U bankda ishlaydi." },
        { target: 'They do not watch TV at night.', uz: "Ular kechasi televizor ko'rishmaydi." },
      ],
      quiz: [
        { q: "She ___ to school every day.", options: ['go', 'goes', 'going', 'gone'], a: 1, explain: "He/She/It bilan fe'lga -es qo'shiladi: goes." },
        { q: "___ you like coffee?", options: ['Does', 'Do', 'Is', 'Are'], a: 1, explain: "You bilan yordamchi fe'l — Do." },
        { q: "They ___ football on Sundays.", options: ['plays', 'play', 'playing', 'played'], a: 1, explain: "They bilan fe'l o'zgarishsiz: play." },
      ],
    },
    {
      id: 'present-continuous',
      title: 'Present Continuous (Hozirgi davomli zamon)',
      icon: '🏃',
      level: 'A1',
      explanation:
        "Present Continuous — hozir aynan sodir bo'layotgan harakatlar uchun.\n\nQurilish: am/is/are + fe'l + -ing.\n\nInkor: am not / isn't / aren't. Savol: Am/Is/Are + subjekt + fe'l + -ing?",
      examples: [
        { target: 'I am reading a book now.', uz: "Men hozir kitob o'qiyapman." },
        { target: 'She is cooking dinner.', uz: "U kechki ovqat tayyorlayapti." },
        { target: 'They are not playing outside.', uz: "Ular tashqarida o'ynamayapti." },
      ],
      quiz: [
        { q: "Look! It ___ raining.", options: ['is', 'are', 'am', 'be'], a: 0, explain: "It bilan is: It is raining." },
        { q: "We ___ watching a movie right now.", options: ['is', 'am', 'are', 'be'], a: 2, explain: "We bilan are." },
        { q: "I ___ studying English at the moment.", options: ['is', 'are', 'am', 'be'], a: 2, explain: "I bilan am." },
      ],
    },
    {
      id: 'past-simple',
      title: 'Past Simple (O\'tgan oddiy zamon)',
      icon: '🕰️',
      level: 'A2',
      explanation:
        "Past Simple — o'tmishda tugallangan harakatlar uchun.\n\nTo'g'ri fe'llar: fe'l + -ed (work → worked). Noto'g'ri fe'llar: 2-shakl (go → went).\n\nInkor: didn't + fe'l (1-shakl). Savol: Did + subjekt + fe'l (1-shakl)?",
      examples: [
        { target: 'I visited my grandmother yesterday.', uz: "Kecha buvimnikiga bordim." },
        { target: 'She went to Tashkent last week.', uz: "U o'tgan hafta Toshkentga bordi." },
        { target: 'They did not come to the party.', uz: "Ular ziyofatga kelishmadi." },
      ],
      quiz: [
        { q: "I ___ to the market yesterday.", options: ['go', 'went', 'gone', 'going'], a: 1, explain: "go ning o'tgan zamon shakli — went." },
        { q: "She ___ her homework last night.", options: ['finish', 'finishes', 'finished', 'finishing'], a: 2, explain: "To'g'ri fe'l: finish + ed = finished." },
        { q: "___ you watch the match yesterday?", options: ['Did', 'Do', 'Does', 'Were'], a: 0, explain: "O'tgan zamon savoli — Did." },
      ],
    },
    {
      id: 'future-simple',
      title: 'Future Simple (Kelasi oddiy zamon)',
      icon: '🔮',
      level: 'A2',
      explanation:
        "Future Simple — kelajakda sodir bo'ladigan harakatlar va bashoratlar uchun.\n\nQurilish: will + fe'l (1-shakl).\n\nInkor: will not (won't). Savol: Will + subjekt + fe'l?",
      examples: [
        { target: 'I will call you tomorrow.', uz: "Ertaga sizga qo'ng'iroq qilaman." },
        { target: 'She will be a great doctor.', uz: "U ajoyib shifokor bo'ladi." },
        { target: 'It will not rain this weekend.', uz: "Bu hafta oxirida yomg'ir yog'maydi." },
      ],
      quiz: [
        { q: "I ___ help you with that.", options: ['will', 'am', 'was', 'have'], a: 0, explain: "Kelasi zamon: will + fe'l." },
        { q: "She ___ come to the meeting tomorrow.", options: ['will not', 'is not', 'was not', 'does not'], a: 0, explain: "Inkor: will not (won't)." },
        { q: "___ you visit us next summer?", options: ['Will', 'Do', 'Did', 'Are'], a: 0, explain: "Kelasi zamon savoli — Will." },
      ],
    },
    {
      id: 'present-perfect',
      title: 'Present Perfect (Hozirgi tugallangan zamon)',
      icon: '✅',
      level: 'B1',
      explanation:
        "Present Perfect — o'tmishda boshlanib, hozirgi kunga aloqador natijalar uchun.\n\nQurilish: have/has + fe'lning 3-shakli (past participle).\n\nBelgilar: already, yet, just, ever, never, since, for.",
      examples: [
        { target: 'I have already finished my work.', uz: "Ishimni allaqachon tugatdim." },
        { target: 'She has never been to London.', uz: "U hech qachon Londonda bo'lmagan." },
        { target: 'We have lived here for five years.', uz: "Biz bu yerda besh yildan beri yashaymiz." },
      ],
      quiz: [
        { q: "I ___ my keys. I can't find them.", options: ['lost', 'have lost', 'lose', 'losing'], a: 1, explain: "Natija hozir seziladi → Present Perfect: have lost." },
        { q: "She ___ just ___ the door.", options: ['has / opened', 'is / opening', 'did / open', 'was / opened'], a: 0, explain: "just belgisi → has + 3-shakl." },
        { q: "Have you ever ___ sushi?", options: ['eat', 'eaten', 'ate', 'eating'], a: 1, explain: "have + 3-shakl: eaten." },
      ],
    },
    {
      id: 'modals',
      title: 'Modal fe\'llar: can, must, should',
      icon: '🎖️',
      level: 'A2',
      explanation:
        "Modal fe'llar imkoniyat, majburiyat va maslahatni bildiradi.\n\n• can — qila olish (Men suzishni bilaman: I can swim)\n• must — majburiyat (Sen o'qishing kerak: You must study)\n• should — maslahat (Sen dam olishing kerak: You should rest)\n\nModal fe'llardan keyin fe'l 1-shaklda keladi (-s, -ing, -ed QO'SHILMAYDI).",
      examples: [
        { target: 'I can speak three languages.', uz: "Men uch tilda gaplasha olaman." },
        { target: 'You must wear a seatbelt.', uz: "Siz xavfsizlik kamarini taqishingiz kerak." },
        { target: 'You should drink more water.', uz: "Siz ko'proq suv ichishingiz kerak (tavsiya)." },
      ],
      quiz: [
        { q: "She ___ play the piano very well.", options: ['cans', 'can', 'can to', 'is can'], a: 1, explain: "Modal fe'ldan keyin -s qo'shilmaydi: She can play." },
        { q: "You ___ stop at the red light.", options: ['should to', 'shoulds', 'must', 'can'], a: 2, explain: "Qonun/qoida → must." },
        { q: "___ you help me, please?", options: ['Can', 'Must', 'Should', 'Do'], a: 0, explain: "Iltimos/savol → Can." },
      ],
    },
    {
      id: 'articles',
      title: 'Artikllar: a, an, the',
      icon: '🔤',
      level: 'A2',
      explanation:
        "Artikllar — otlar oldida keladigan kichik so'zlar.\n\n• a — birinchi marta aytilgan, undosh bilan boshlanuvchi otlar: a book\n• an — unli (a, e, i, o, u) bilan boshlanuvchi otlar: an apple\n• the — allaqachon ma'lum bo'lgan narsa: the book on the table\n\nKo'plikda a/an ishlatilmaydi: books (a books emas!).",
      examples: [
        { target: 'I have a cat and a dog.', uz: "Mening mushuk va itim bor." },
        { target: 'She is eating an orange.', uz: "U apelsin yeyapti." },
        { target: 'The sun is very bright today.', uz: "Bugun quyosh juda yorqin." },
      ],
      quiz: [
        { q: "He is ___ engineer.", options: ['a', 'an', 'the', '—'], a: 1, explain: "engineer unli (e) bilan boshlanadi → an." },
        { q: "I bought ___ umbrella yesterday.", options: ['a', 'an', 'the', 'some'], a: 1, explain: "umbrella unli (u) bilan boshlanadi → an." },
        { q: "___ moon goes around the Earth.", options: ['A', 'An', 'The', '—'], a: 2, explain: "Yagona/osmon jismi → the." },
      ],
    },
    {
      id: 'prepositions',
      title: 'Predloglar: in, on, at',
      icon: '📍',
      level: 'A1',
      explanation:
        "In, on, at — vaqt va joy predloglari.\n\nVAQT:\n• at — aniq vaqt: at 5 o'clock, at noon\n• in — oy, yil, fasl: in July, in 2025, in summer\n• on — kun: on Monday, on my birthday\n\nJOY:\n• at — nuqta: at the door\n• in — ichida: in the room\n• on — ustida: on the table",
      examples: [
        { target: 'The meeting starts at 9 o\'clock.', uz: "Uchrashuv soat 9 da boshlanadi." },
        { target: 'My birthday is in March.', uz: "Tug'ilgan kunim mart oyida." },
        { target: 'We play football on Fridays.', uz: "Biz juma kunlari futbol o'ynaymiz." },
      ],
      quiz: [
        { q: "I wake up ___ 7 o'clock.", options: ['in', 'on', 'at', 'by'], a: 2, explain: "Aniq vaqt → at." },
        { q: "She was born ___ 2001.", options: ['at', 'on', 'in', 'to'], a: 2, explain: "Yil → in." },
        { q: "The keys are ___ the table.", options: ['at', 'on', 'in', 'under'], a: 1, explain: "Ustida → on." },
      ],
    },
    {
      id: 'comparatives',
      title: 'Taqqoslash: -er / more / the most',
      icon: '⚖️',
      level: 'B1',
      explanation:
        "Sifatlarni taqqoslash:\n\n• Qisqa sifatlar: -er (big → bigger, small → smaller)\n• Uzun sifatlar: more (more beautiful, more interesting)\n• Eng yuqori daraja: the + -est yoki the most (the biggest, the most beautiful)\n\nQurilish: ... than (narsadan ko'ra): She is taller than me.",
      examples: [
        { target: 'My house is bigger than yours.', uz: "Mening uyim siznikidan kattaroq." },
        { target: 'This book is more interesting.', uz: "Bu kitob qiziqroq." },
        { target: 'Mount Everest is the highest mountain.', uz: "Everest — eng baland tog'." },
      ],
      quiz: [
        { q: "Summer is ___ than winter in Uzbekistan.", options: ['hotter', 'more hot', 'hottest', 'hot'], a: 0, explain: "Qisqa sifat: hot → hotter." },
        { q: "This is the ___ film I have ever seen.", options: ['most interesting', 'more interesting', 'interestingest', 'very interesting'], a: 0, explain: "Uzun sifat: the most interesting." },
        { q: "My brother is ___ than me.", options: ['old', 'older', 'oldest', 'more old'], a: 1, explain: "Taqqoslash: older than." },
      ],
    },
    {
      id: 'conditionals',
      title: 'Conditionals (Shart gaplar): If...',
      icon: '🎲',
      level: 'B1',
      explanation:
        "Shart gaplar — 'agar... bo'lsa' ma'nosini bildiradi.\n\n• First conditional (real kelajak): If + Present Simple, will + fe'l\n  If it rains, I will stay home.\n\n• Zero conditional (haqiqatlar): If + Present Simple, Present Simple\n  If you heat ice, it melts.",
      examples: [
        { target: 'If I study hard, I will pass the exam.', uz: "Agar qattiq o'qisam, imtihondan o'taman." },
        { target: 'If it rains, we will stay at home.', uz: "Agar yomg'ir yog'sa, uyda qolamiz." },
        { target: 'If you freeze water, it becomes ice.', uz: "Agar suvni muzlatsangiz, muzga aylanadi." },
      ],
      quiz: [
        { q: "If she ___ late, she will miss the bus.", options: ['will be', 'is', 'was', 'be'], a: 1, explain: "If dan keyin Present Simple: is." },
        { q: "If you touch fire, it ___ you.", options: ['burns', 'will burn', 'burn', 'burned'], a: 0, explain: "Umumiy haqiqat → Present Simple ikkala qismda." },
        { q: "We will go out if the weather ___ nice.", options: ['is', 'will be', 'was', 'be'], a: 0, explain: "If dan keyin: is." },
      ],
    },
    {
      id: 'passive',
      title: 'Passive Voice (Majhul nisbat)',
      icon: '🔄',
      level: 'B2',
      explanation:
        "Passive — harakat kim tomonidan bajarilishi muhim bo'lmaganda ishlatiladi.\n\nQurilish: be + fe'lning 3-shakli.\n\n• Present: is/are + 3-shakl (The book is read)\n• Past: was/were + 3-shakl (The book was read)\n• Future: will be + 3-shakl (The book will be read)",
      examples: [
        { target: 'English is spoken all over the world.', uz: "Ingliz tilida butun dunyoda gaplashiladi." },
        { target: 'This bridge was built in 1990.', uz: "Bu ko'prik 1990-yilda qurilgan." },
        { target: 'The letter will be sent tomorrow.', uz: "Xat ertaga yuboriladi." },
      ],
      quiz: [
        { q: "Rice ___ grown in many countries.", options: ['is', 'are', 'was', 'were'], a: 0, explain: "Rice yagona → is grown." },
        { q: "This song ___ by many people last year.", options: ['is sung', 'was sung', 'sang', 'sings'], a: 1, explain: "O'tgan zamon passive: was sung." },
        { q: "The windows ___ cleaned every week.", options: ['are', 'is', 'was', 'were'], a: 0, explain: "Windows ko'plik → are cleaned." },
      ],
    },
    {
      id: 'phrasal-verbs',
      title: 'Phrasal Verbs (Fraza fe\'llari)',
      icon: '🧩',
      level: 'B2',
      explanation:
        "Fraza fe'llar — fe'l + predlog/ravish birikmasi bo'lib, yangi ma'no beradi.\n\n• give up — taslim bo'lmoq / tashlamoq (Don't give up!)\n• look after — qaramoq, parvarish qilmoq\n• get up — uyg'onmoq, turmoq\n• put on — kiyib olmoq\n• turn off — o'chirmoq",
      examples: [
        { target: 'Never give up on your dreams.', uz: "Orzularingizdan hech qachon taslim bo'lmang." },
        { target: 'She looks after her little brother.', uz: "U kenja ukasiga qaraydi." },
        { target: 'Please turn off the lights.', uz: "Iltimos, chiroqlarni o'chiring." },
      ],
      quiz: [
        { q: "I usually ___ at 7 in the morning.", options: ['get up', 'get on', 'get over', 'get away'], a: 0, explain: "get up — uyg'onmoq/turmoq." },
        { q: "She wants to ___ smoking.", options: ['give up', 'give in', 'give away', 'give out'], a: 0, explain: "give up — tashlamoq (odat)." },
        { q: "It's cold. ___ your jacket.", options: ['Turn on', 'Put on', 'Get up', 'Look after'], a: 1, explain: "put on — kiyib olmoq." },
      ],
    },
  ],
  russian: [
    {
      id: 'r-cases',
      title: 'Падежи (Kelishiklar)',
      icon: '📋',
      level: 'A2',
      explanation:
        "Rus tilida 6 ta kelishik bor. Eng muhimlari:\n\n• Именительный (bosh): книга — kitob\n• Родительный (qaratqich): книги — kitobning\n• Дательный (jo'nalish): книге — kitobga\n• Винительный (tushum): книгу — kitobni\n• Творительный (o'rin-payt): книгой — kitob bilan\n• Предложный (o'rin): о книге — kitob haqida",
      examples: [
        { target: 'Я читаю книгу.', uz: "Men kitob o'qiyapman." },
        { target: 'Нет времени.', uz: "Vaqt yo'q." },
        { target: 'Мы говорим о погоде.', uz: "Biz ob-havo haqida gaplashamiz." },
      ],
      quiz: [
        { q: "Я вижу ___ (книга) — men kitobni ko'ryapman.", options: ['книга', 'книгу', 'книге', 'книгой'], a: 1, explain: "Винительный падеж: книгу." },
        { q: "У меня нет ___ (время).", options: ['время', 'времени', 'временем', 'времена'], a: 1, explain: "Родительный: нет времени." },
        { q: "Мы думаем о ___ (работа).", options: ['работа', 'работу', 'работе', 'работой'], a: 2, explain: "Предложный: о работе." },
      ],
    },
    {
      id: 'r-gender',
      title: 'Род существительных (Otlarning jinsi)',
      icon: '👫',
      level: 'A1',
      explanation:
        "Rus tilida otlar 3 jinsga bo'linadi:\n\n• Мужской (erkak) — oxiri undosh yoki -й: стол, чай\n• Женский (ayol) — oxiri -а, -я: книга, семья\n• Средний (o'rta) — oxiri -о, -е: окно, море\n\nJinsni bilish muhim — sifat va fe'l o'tgan zamoni jinsga moslashadi.",
      examples: [
        { target: 'Большой стол — Большая книга — Большое окно', uz: "Katta stol — katta kitob — katta deraza" },
        { target: 'Он читал. Она читала. Оно читало.', uz: "U (erkak) o'qidi. U (ayol) o'qidi. U (narsa) o'qidi." },
      ],
      quiz: [
        { q: "Какой род у слова «книга»?", options: ['Мужской', 'Женский', 'Средний', 'Множественный'], a: 1, explain: "oxiri -а → женский род." },
        { q: "Какой род у слова «стол»?", options: ['Мужской', 'Женский', 'Средний', 'Нет рода'], a: 0, explain: "oxiri undosh → мужской род." },
        { q: "Какой род у слова «окно»?", options: ['Мужской', 'Женский', 'Средний', 'Любой'], a: 2, explain: "oxiri -о → средний род." },
      ],
    },
    {
      id: 'r-plural',
      title: 'Множественное число (Ko\'plik)',
      icon: '👥',
      level: 'A1',
      explanation:
        "Ko'plik yasash qoidalari:\n\n• undosh bilan tugagan: + ы (стол → столы)\n• -а, -я bilan tugagan: -ы/-и (книга → книги, неделя → недели)\n• -ь bilan tugagan: -и (ночь → ночи)\n• -о bilan tugagan: -а (окно → окна)\n• -й bilan tugagan: -и (чай → чаи)",
      examples: [
        { target: 'Один стол — два стола — много столов', uz: "Bitta stol — ikkita stol — ko'p stollar" },
        { target: 'Студент — студенты', uz: "Talaba — talabalar" },
      ],
      quiz: [
        { q: "Множественное число слова «книга»:", options: ['книги', 'книгиы', 'книга', 'книг'], a: 0, explain: "книга → книги." },
        { q: "Множественное число слова «окно»:", options: ['окны', 'окна', 'окно', 'окон'], a: 1, explain: "окно → окна." },
        { q: "Множественное число слова «стул»:", options: ['стулы', 'стула', 'стуль', 'стул'], a: 0, explain: "стул → стулья (istisno), ko'pincha стулы deb xato qilinadi — to'g'risi стулья." },
      ],
    },
  ],
  korean: [
    {
      id: 'k-hangul',
      title: 'Hangul: 글자 — harflar tuzilishi',
      icon: '✏️',
      level: 'A1',
      explanation:
        "Hangul — Koreya alifbosi. Har bir bo'g'in harflardan tuzilgan blok.\n\nAsosiy unlilar: ㅏ (a), ㅓ (eo), ㅗ (o), ㅜ (u), ㅣ (i)\nAsosiy undoshlar: ㄱ (g/k), ㄴ (n), ㅁ (m), ㅅ (s), ㅇ (ng), ㅎ (h)\n\nBo'g'in namunasi: 가 = ㄱ + ㅏ = ga. 한 = ㅎ + ㅏ + ㄴ = han.\n\nBloklar chapdan o'ngga va yuqoridan pastga o'qiladi.",
      examples: [
        { target: '안녕하세요', uz: "Assalomu alaykum (salom)" },
        { target: '감사합니다', uz: "Rahmat" },
      ],
      quiz: [
        { q: "«가» qanday o'qiladi?", options: ['ga', 'ka', 'na', 'da'], a: 0, explain: "ㄱ+ㅏ = 가 (ga)." },
        { q: "«나» qanday o'qiladi?", options: ['ga', 'na', 'ma', 'sa'], a: 1, explain: "ㄴ+ㅏ = 나 (na)." },
        { q: "«안녕» nechta bo'g'indan iborat?", options: ['1', '2', '3', '4'], a: 1, explain: "안 (an) + 녕 (nyeong) = 2 bo'g'in." },
      ],
    },
    {
      id: 'k-formal',
      title: 'Formal nutq: 요 / 습니다',
      icon: '🎩',
      level: 'A2',
      explanation:
        "Koreys tilida nutq uslubi muhim. Eng keng tarqalgan ikkitasi:\n\n• 요 uslubi (norasmiy-xushmuomala): Fe'l + 아요/어요\n  가다 → 가요 (boryapman), 먹다 → 먹어요 (yeyapman)\n\n• 습니다 uslubi (rasmiy): Fe'l + 습니다/습니다\n  가다 → 갑니다, 먹다 → 먹습니다\n\nIsh, kattalar bilan gaplashganda 습니다 ishlatiladi.",
      examples: [
        { target: '저는 학교에 가요.', uz: "Men maktabga boryapman (norasmiy)." },
        { target: '저는 학생입니다.', uz: "Men talabaman (rasmiy)." },
        { target: '감사합니다!', uz: "Rahmat! (rasmiy)" },
      ],
      quiz: [
        { q: "가다 fe'lining formal shakli:", options: ['가요', '갑니다', '가', '갔어요'], a: 1, explain: "rasmiy uslub: 갑니다." },
        { q: "«저는 학생입니다» qanday ma'no?", options: ["Men talabaman", "Men o'qituvchiman", "U talaba", "Siz talabasiz"], a: 0, explain: "학생 — talaba, 입니다 — bo'lmoq (rasmiy)." },
        { q: "Do'stingiz bilan qaysi uslub mos?", options: ['합니다', '습니다', '아요/어요', '입니다'], a: 2, explain: "Do'stlar orasida 요 uslub (아요/어요) ishlatiladi." },
      ],
    },
    {
      id: 'k-particles',
      title: 'Bog\'lovchilar: 은/는, 이/가, 을/를',
      icon: '🔗',
      level: 'A2',
      explanation:
        "Koreys tilida so'zlar keyinga qo'shimcha oladi:\n\n• 은/는 — mavzu (topic): 저는 (men...)\n• 이/가 — subjekt (subject): 물이 (suv...)\n• 을/를 — ob'ekt (object): 책을 (kitobni)\n\nUndoshdan keyin: 은, 이, 을; unlidan keyin: 는, 가, 를.\n\n예: 사과를 먹어요 (olmani yeyapman) — 사과 unli bilan tugagan → 를.",
      examples: [
        { target: '저는 학생이에요.', uz: "Men talabaman." },
        { target: '물을 마셔요.', uz: "Suv ichyapman." },
        { target: '사과가 맛있어요.', uz: "Olma mazali." },
      ],
      quiz: [
        { q: "사과 + ___ (ob'ekt):", options: ['을', '를', '은', '가'], a: 1, explain: "사과 unli (ㅏ) bilan tugagan → 를." },
        { q: "책 + ___ (ob'ekt):", options: ['을', '를', '는', '가'], a: 0, explain: "책 undosh bilan tugagan → 을." },
        { q: "저 + ___ (topic):", options: ['은', '는', '이', '을'], a: 1, explain: "저 unli bilan tugagan → 는: 저는." },
      ],
    },
  ],
  arabic: [
    {
      id: 'a-articles',
      title: 'المعرّف: ال — aniq artikl',
      icon: '🕌',
      level: 'A1',
      explanation:
        "Arab tilida aniq artikl — ال (al).\n\n• kitob = كتاب (kitab) — noaniq\n• kitob (ma'lum) = الكتاب (al-kitab) — aniq\n\nال har doim otga qo'shib yoziladi. ال dan keyin quyosh harflari kelsa, l harfi yutiladi: الشمس (ash-shams, quyosh).",
      examples: [
        { target: 'كتاب — الكتاب', uz: "kitob — (o'sha) kitob" },
        { target: 'بيت — البيت', uz: "uy — (o'sha) uy" },
        { target: 'الشمس مشرقة', uz: "Quyosh charaqlab turibdi." },
      ],
      quiz: [
        { q: "'kitob' so'zining aniq shakli:", options: ['كتاب', 'الكتاب', 'كتاب ال', 'كتابا'], a: 1, explain: "Aniq artikl: الكتاب." },
        { q: "'uy' so'zining aniq shakli:", options: ['بيت', 'البيت', 'بيتا', 'البيتا'], a: 1, explain: "البيت — uy (ma'lum)." },
        { q: "الشمس da 'l' nima uchun yutiladi?", options: ["Quyosh harfi (ش) tufayli", "Xato yozilgan", "Unli tufayli", "Yutilmaydi"], a: 0, explain: "ش — quyosh harfi, shuning uchun ash-shams." },
      ],
    },
    {
      id: 'a-greetings',
      title: 'Salomlashish va so\'zlashuv',
      icon: '👋',
      level: 'A1',
      explanation:
        "Eng muhim iboralar:\n\n• السلام عليكم (As-salomu alaykum) — tinchlik sizga bo'lsin\n• وعليكم السلام (Va alaykum assalom) — javob\n• كيف حالك؟ (Kayfa haluk?) — ahvollar qanday?\n• أنا بخير (Ana bikhayr) — yaxshiman\n• شكراً (Shukran) — rahmat\n• مع السلامة (Ma'a as-salama) — xayr",
      examples: [
        { target: 'السلام عليكم!', uz: "Assalomu alaykum!" },
        { target: 'كيف حالك؟ — أنا بخير.', uz: "Ahvollar qanday? — Yaxshiman." },
        { target: 'شكراً جزيلاً.', uz: "Katta rahmat." },
      ],
      quiz: [
        { q: "'rahmat' arabcha:", options: ['شكراً', 'سلام', 'بيت', 'كتاب'], a: 0, explain: "شكراً (shukran) — rahmat." },
        { q: "'Assalomu alaykum'ga javob:", options: ['مع السلامة', 'وعليكم السلام', 'كيف حالك', 'بخير'], a: 1, explain: "وعليكم السلام — javob." },
        { q: "'Yaxshiman' deyiladi:", options: ['أنا بخير', 'أنا طالب', 'كيف حالك', 'شكراً'], a: 0, explain: "أنا بخير (ana bikhayr)." },
      ],
    },
  ],
  spanish: [
    {
      id: 's-ser-estar',
      title: 'Ser vs Estar (bo\'lmoq fe\'llari)',
      icon: '⚖️',
      level: 'A1',
      explanation:
        "Ispan tilida 'bo'lmoq' ikkita fe'l bilan ifodalanadi:\n\n• SER — doimiy xususiyatlar: millat, kasb, tashqi ko'rinish, vaqt\n  Yo soy de Uzbekistán. (Men O'zbekistondanman)\n  Ella es doctora. (U shifokor)\n\n• ESTAR — holat, joylashuv, vaqtinchalik holat\n  Estoy cansado. (Men charchaganman)\n  Estamos en casa. (Biz uydamiz)",
      examples: [
        { target: 'Yo soy estudiante.', uz: "Men talabaman." },
        { target: 'Estoy feliz hoy.', uz: "Bugun xursandman." },
        { target: 'El libro está en la mesa.', uz: "Kitob stolda." },
      ],
      quiz: [
        { q: "Ella ___ médica. (kasb)", options: ['es', 'está', 'son', 'están'], a: 0, explain: "Kasb → ser: es." },
        { q: "___ cansado ahora. (holat)", options: ['Soy', 'Estoy', 'Es', 'Eres'], a: 1, explain: "Vaqtinchalik holat → estar: Estoy." },
        { q: "Mis amigos ___ en el parque.", options: ['son', 'están', 'es', 'está'], a: 1, explain: "Joylashuv → estar, ular → están." },
      ],
    },
    {
      id: 's-ar-verbs',
      title: 'AR fe\'llar: hablar, comer, vivir',
      icon: '🗣️',
      level: 'A1',
      explanation:
        "Ispan fe'llari 3 guruhga bo'linadi: -ar, -er, -ir.\n\nhablar (gapirmoq) tuslanishi:\n• yo hablo — men gapiraman\n• tú hablas — sen gapirasan\n• él/ella habla — u gapiradiv\n• nosotros hablamos — biz gapiramiz\n• ellos hablan — ular gapirishadi\n\ncomer (yemoq): como, comes, come, comemos, comen.",
      examples: [
        { target: 'Hablo español un poco.', uz: "Men ozgina ispancha gapiraman." },
        { target: '¿Hablas inglés?', uz: "Inglizcha gapirasizmi?" },
        { target: 'Ellos comen pan.', uz: "Ular non yeyishadi." },
      ],
      quiz: [
        { q: "Yo ___ español. (hablar)", options: ['hablo', 'hablas', 'habla', 'hablamos'], a: 0, explain: "Yo → hablo." },
        { q: "Tú ___ mucho. (comer)", options: ['como', 'comes', 'come', 'comemos'], a: 1, explain: "Tú → comes." },
        { q: "Nosotros ___ en Tashkent. (vivir)", options: ['vivo', 'vives', 'vive', 'vivimos'], a: 3, explain: "Nosotros → vivimos." },
      ],
    },
  ],
  french: [
    {
      id: 'f-articles',
      title: 'Articles: le, la, les',
      icon: '🍷',
      level: 'A1',
      explanation:
        "Fransuz tilida otlar jinsga ega:\n\n• le — erkak jins (masculin): le livre (kitob)\n• la — ayol jins (féminin): la table (stol)\n• les — ko'plik: les livres\n\nUnli yoki h muetsizdan oldin le/la → l' : l'école (maktab).\n\nNoaniq artikllar: un (erkak), une (ayol), des (ko'plik).",
      examples: [
        { target: 'Le chat est noir.', uz: "Mushuk qora." },
        { target: 'La maison est grande.', uz: "Uy katta." },
        { target: "J'aime les fruits.", uz: "Mevalarni yaxshi ko'raman." },
      ],
      quiz: [
        { q: "___ livre (kitob) — qaysi artikl?", options: ['le', 'la', 'les', 'un'], a: 0, explain: "livre — erkak jins: le." },
        { q: "___ table (stol) — qaysi artikl?", options: ['le', 'la', 'les', 'un'], a: 1, explain: "table — ayol jins: la." },
        { q: "___ école (maktab):", options: ['le', 'la', "l'", 'les'], a: 2, explain: "Unli e dan oldin: l'école." },
      ],
    },
    {
      id: 'f-verbs',
      title: 'Verbes: être va avoir',
      icon: '✨',
      level: 'A1',
      explanation:
        "Fransuz tilining eng muhim fe'llari:\n\nêtre (bo'lmoq): je suis, tu es, il/elle est, nous sommes, vous êtes, ils sont.\n\navoir (ega bo'lmoq): j'ai, tu as, il/elle a, nous avons, vous avez, ils ont.\n\nUlar ko'plab murakkab zamonda yordamchi fe'l vazifasini bajaradi.",
      examples: [
        { target: 'Je suis étudiant.', uz: "Men talabaman." },
        { target: 'Tu as un livre.', uz: "Sening kitobing bor." },
        { target: 'Nous sommes à la maison.', uz: "Biz uydamiz." },
      ],
      quiz: [
        { q: "Je ___ étudiant. (être)", options: ['suis', 'es', 'est', 'sommes'], a: 0, explain: "Je → suis." },
        { q: "Il ___ un chat. (avoir)", options: ['a', 'as', 'ont', 'avons'], a: 0, explain: "Il → a." },
        { q: "Vous ___ gentils. (être)", options: ['sommes', 'êtes', 'sont', 'est'], a: 1, explain: "Vous → êtes." },
      ],
    },
  ],
  german: [
    {
      id: 'g-articles',
      title: 'Artikel: der, die, das',
      icon: '🥨',
      level: 'A1',
      explanation:
        "Nemis tilida otlarning 3 jinsi bor:\n\n• der — erkak (maskulin): der Mann (erkak)\n• die — ayol (feminin): die Frau (ayol)\n• das — o'rta (neutrum): das Kind (bola)\n\nJinsni yodlash kerak — har bir yangi so'zni artikli bilan o'rganing!",
      examples: [
        { target: 'der Tisch', uz: "stol (erkak jins)" },
        { target: 'die Lampe', uz: "chiroq (ayol jins)" },
        { target: 'das Fenster', uz: "deraza (o'rta jins)" },
      ],
      quiz: [
        { q: "___ Tisch (stol):", options: ['der', 'die', 'das', 'den'], a: 0, explain: "Tisch — maskulin: der." },
        { q: "___ Frau (ayol):", options: ['der', 'die', 'das', 'den'], a: 1, explain: "Frau — feminin: die." },
        { q: "___ Buch (kitob):", options: ['der', 'die', 'das', 'dem'], a: 2, explain: "Buch — neutrum: das." },
      ],
    },
    {
      id: 'g-wortstellung',
      title: 'So\'z tartibi (Wortstellung)',
      icon: '🧱',
      level: 'A2',
      explanation:
        "Nemis tilida so'z tartibi qat'iy:\n\n• Oddiy gap: Subjekt + Fe'l + ...\n  Ich lerne Deutsch. (Men nemis tilini o'rganyapman)\n\n• Savolda fe'l birinchi: Lernst du Deutsch?\n\n• Qo'shimcha (vaqt) birinchi kelsa, fe'l hali ham 2-o'rinda:\n  Heute lerne ich Deutsch. (Bugun men nemis tilini o'rganyapman)",
      examples: [
        { target: 'Ich trinke Kaffee.', uz: "Men kofe ichaman." },
        { target: 'Trinkst du Tee?', uz: "Choy ichasizmi?" },
        { target: 'Morgen gehe ich zur Schule.', uz: "Ertaga maktabga boraman." },
      ],
      quiz: [
        { q: "To'g'ri tartib: 'Deutsch ich lerne' emas, balki ___", options: ['Ich lerne Deutsch', 'Lerne ich Deutsch', 'Deutsch lerne ich', 'Ich Deutsch lerne'], a: 0, explain: "Subjekt + fe'l + ob'ekt." },
        { q: "'Heute ___ ich Kaffee.' — fe'l qayerda?", options: ["1-o'rinda", "2-o'rinda", "3-o'rinda", "oxirida"], a: 1, explain: "Qo'shimcha birinchi kelsa ham fe'l 2-o'rinda." },
        { q: "Savol: '___ du Kaffee?'", options: ['Trinkst', 'Du', 'Kaffee', 'Trinken'], a: 0, explain: "Savolda fe'l birinchi: Trinkst du...?" },
      ],
    },
  ],
  uzbek: [
    {
      id: 'u-kelishiklar',
      title: "Kelishiklar (O'zbek tili)",
      icon: '🇺🇿',
      level: 'A1',
      explanation:
        "O'zbek tilida 6 ta kelishik bor:\n\n• Bosh kelishik (kim? nima?): kitob\n• Qaratqich (kimning? nimaning?): kitobning\n• Jo'nalish (kimga? nimaga?): kitobga\n• Tushum (kimni? nimani?): kitobni\n• O'rin (kimda? nimada?): kitobda\n• Chiqish (kimdan? nimadan?): kitobdan",
      examples: [
        { target: 'Kitob stolda.', uz: "Kitob stol ustida (o'rin kelishigi)." },
        { target: 'Akamdan so\'radim.', uz: "Akamdan so'radim (chiqish kelishigi)." },
        { target: 'Maktabga boryapman.', uz: "Maktabga boryapman (jo'nalish kelishigi)." },
      ],
      quiz: [
        { q: "'Kitobni o'qidim' — qaysi kelishik?", options: ['Bosh', 'Tushum', 'Jo\'nalish', 'Chiqish'], a: 1, explain: "-ni — tushum kelishigi." },
        { q: "'Maktabda o'qiyman' — qaysi kelishik?", options: ['O\'rin', 'Qaratqich', 'Tushum', 'Bosh'], a: 0, explain: "-da — o'rin kelishigi." },
        { q: "'Do'stimga berdim' — qaysi kelishik?", options: ['Jo\'nalish', 'Chiqish', 'Qaratqich', 'Tushum'], a: 0, explain: "-ga — jo'nalish kelishigi." },
      ],
    },
    {
      id: 'u-zamonlar',
      title: 'Fe\'l zamonlari',
      icon: '⏳',
      level: 'A2',
      explanation:
        "O'zbek fe'llarida 3 asosiy zamon:\n\n• Hozirgi zamon: -yapman, -yapsan... (Men o'qiyapman)\n• O'tgan zamon: -di (Men o'qidim)\n• Kelasi zamon: -aman/-man (Men o'qiyman)\n\nO'tgan zamon -gan shakli ham bor: Men o'qiganman (avval sodir bo'lgan).",
      examples: [
        { target: 'Men hozir o\'qiyapman.', uz: "Hozirgi davomli." },
        { target: 'Men kecha o\'qidim.', uz: "O'tgan zamon." },
        { target: 'Men ertaga o\'qiyman.', uz: "Kelasi zamon." },
      ],
      quiz: [
        { q: "'Yozayapman' — qaysi zamon?", options: ['Hozirgi', 'O\'tgan', 'Kelasi', 'Shart'], a: 0, explain: "-yapman → hozirgi zamon." },
        { q: "'Ko\'rdim' — qaysi zamon?", options: ['Hozirgi', 'O\'tgan', 'Kelasi', 'Buyruq'], a: 1, explain: "-di → o'tgan zamon." },
        { q: "'Boraman' — qaysi zamon?", options: ['Hozirgi', 'O\'tgan', 'Kelasi', 'Tushum'], a: 2, explain: "-aman → kelasi zamon." },
      ],
    },
  ],
};

// Qaysi tillarda grammatika darslari bor
export const HAS_GRAMMAR = new Set(Object.keys(GRAMMAR_LANGS));

// Til uchun grammatika darslarini qaytaradi (yo'q bo'lsa — bo'sh ro'yxat)
export function getGrammarLessons(langId) {
  return GRAMMAR_LANGS[langId] || [];
}

