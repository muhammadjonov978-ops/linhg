export const languages = [
  {
    id: 'english',
    name: 'English',
    flag: '🇬🇧',
    color: 'primary',
    description: 'Global communication tili',
    totalLearners: 125000,
  },
  {
    id: 'spanish',
    name: 'Spanish',
    flag: '🇪🇸',
    color: 'secondary',
    description: "Dunyoda 2-o'rinda eng ko'p so'zlashiladigan til",
    totalLearners: 98000,
  },
  {
    id: 'french',
    name: 'French',
    flag: '🇫🇷',
    color: 'accent',
    description: "Romantika va san'at tili",
    totalLearners: 87000,
  },
  {
    id: 'german',
    name: 'German',
    flag: '🇩🇪',
    color: 'warning',
    description: 'Ilm-fan va texnologiya tili',
    totalLearners: 76000,
  },
  {
    id: 'italian',
    name: 'Italian',
    flag: '🇮🇹',
    color: 'error',
    description: 'Musiqa va taom tili',
    totalLearners: 54000,
  },
  {
    id: 'portuguese',
    name: 'Portuguese',
    flag: '🇧🇷',
    color: 'info',
    description: 'Janubiy Amerika va Yevropa tili',
    totalLearners: 48000,
  },
  {
    id: 'russian',
    name: 'Russian',
    flag: '🇷🇺',
    color: 'neutral',
    description: 'MDH va Sharqiy Yevropa tili',
    totalLearners: 62000,
  },
];

// ===================== ALPHABET DATA =====================

export const alphabets = {
  english: [
    { letter: 'A', pronunciation: '/eɪ/', example: 'Apple', exampleUz: 'Olma' },
    { letter: 'B', pronunciation: '/biː/', example: 'Book', exampleUz: 'Kitob' },
    { letter: 'C', pronunciation: '/siː/', example: 'Cat', exampleUz: 'Mushuk' },
    { letter: 'D', pronunciation: '/diː/', example: 'Dog', exampleUz: 'It' },
    { letter: 'E', pronunciation: '/iː/', example: 'Egg', exampleUz: 'Tuxum' },
    { letter: 'F', pronunciation: '/ef/', example: 'Fish', exampleUz: 'Baliq' },
    { letter: 'G', pronunciation: '/dʒiː/', example: 'Girl', exampleUz: 'Qiz' },
    { letter: 'H', pronunciation: '/eɪtʃ/', example: 'House', exampleUz: 'Uy' },
    { letter: 'I', pronunciation: '/aɪ/', example: 'Ice', exampleUz: 'Muz' },
    { letter: 'J', pronunciation: '/dʒeɪ/', example: 'Juice', exampleUz: 'Sharbat' },
    { letter: 'K', pronunciation: '/keɪ/', example: 'Key', exampleUz: 'Kalit' },
    { letter: 'L', pronunciation: '/el/', example: 'Lion', exampleUz: 'Sher' },
    { letter: 'M', pronunciation: '/em/', example: 'Moon', exampleUz: 'Oy' },
    { letter: 'N', pronunciation: '/en/', example: 'Nose', exampleUz: 'Burun' },
    { letter: 'O', pronunciation: '/oʊ/', example: 'Orange', exampleUz: 'Apelsin' },
    { letter: 'P', pronunciation: '/piː/', example: 'Pen', exampleUz: 'Qalam' },
    { letter: 'Q', pronunciation: '/kjuː/', example: 'Queen', exampleUz: 'Qirolicha' },
    { letter: 'R', pronunciation: '/ɑːr/', example: 'Rain', exampleUz: 'Yomg\'ir' },
    { letter: 'S', pronunciation: '/es/', example: 'Sun', exampleUz: 'Quyosh' },
    { letter: 'T', pronunciation: '/tiː/', example: 'Tree', exampleUz: 'Daraxt' },
    { letter: 'U', pronunciation: '/juː/', example: 'Umbrella', exampleUz: 'Soyabon' },
    { letter: 'V', pronunciation: '/viː/', example: 'Violin', exampleUz: 'Skripka' },
    { letter: 'W', pronunciation: '/dʌbəl juː/', example: 'Water', exampleUz: 'Suv' },
    { letter: 'X', pronunciation: '/eks/', example: 'X-ray', exampleUz: 'Rentgen' },
    { letter: 'Y', pronunciation: '/waɪ/', example: 'Yellow', exampleUz: 'Sariq' },
    { letter: 'Z', pronunciation: '/ziː/', example: 'Zebra', exampleUz: 'Zebra' },
  ],
  spanish: [
    { letter: 'A', pronunciation: '/a/', example: 'Agua', exampleUz: 'Suv' },
    { letter: 'B', pronunciation: '/be/', example: 'Boca', exampleUz: 'Og\'iz' },
    { letter: 'C', pronunciation: '/θe/', example: 'Casa', exampleUz: 'Uy' },
    { letter: 'D', pronunciation: '/de/', example: 'Dedo', exampleUz: 'Barmoq' },
    { letter: 'E', pronunciation: '/e/', example: 'Elefante', exampleUz: 'Fil' },
    { letter: 'F', pronunciation: '/efe/', example: 'Fuego', exampleUz: 'Olov' },
    { letter: 'G', pronunciation: '/xe/', example: 'Gato', exampleUz: 'Mushuk' },
    { letter: 'H', pronunciation: '/atʃe/', example: 'Hola', exampleUz: 'Salom' },
    { letter: 'I', pronunciation: '/i/', example: 'Isla', exampleUz: 'Orol' },
    { letter: 'J', pronunciation: '/xota/', example: 'Jirafa', exampleUz: 'Jirafa' },
    { letter: 'K', pronunciation: '/ka/', example: 'Koala', exampleUz: 'Koala' },
    { letter: 'L', pronunciation: '/ele/', example: 'Luna', exampleUz: 'Oy' },
    { letter: 'M', pronunciation: '/eme/', example: 'Mano', exampleUz: 'Qo\'l' },
    { letter: 'N', pronunciation: '/ene/', example: 'Nube', exampleUz: 'Bulut' },
    { letter: 'Ñ', pronunciation: '/eɲe/', example: 'España', exampleUz: 'Ispaniya' },
    { letter: 'O', pronunciation: '/o/', example: 'Ojo', exampleUz: 'Ko\'z' },
    { letter: 'P', pronunciation: '/pe/', example: 'Pez', exampleUz: 'Baliq' },
    { letter: 'Q', pronunciation: '/ku/', example: 'Queso', exampleUz: 'Pishloq' },
    { letter: 'R', pronunciation: '/ere/', example: 'Rosa', exampleUz: 'Atirgul' },
    { letter: 'S', pronunciation: '/ese/', example: 'Sol', exampleUz: 'Quyosh' },
    { letter: 'T', pronunciation: '/te/', example: 'Tigre', exampleUz: 'Yo\'lbars' },
    { letter: 'U', pronunciation: '/u/', example: 'Uva', exampleUz: 'Uzum' },
    { letter: 'V', pronunciation: '/ube/', example: 'Vaca', exampleUz: 'Sigir' },
    { letter: 'W', pronunciation: '/uve doble/', example: 'Waterpolo', exampleUz: 'Waterpolo' },
    { letter: 'X', pronunciation: '/ekis/', example: 'Xilófono', exampleUz: 'Ksilofon' },
    { letter: 'Y', pronunciation: '/ʝe/', example: 'Yate', exampleUz: 'Yaxta' },
    { letter: 'Z', pronunciation: '/θeta/', example: 'Zapato', exampleUz: 'Tufli' },
  ],
  french: [
    { letter: 'A', pronunciation: '/a/', example: 'Avion', exampleUz: 'Samolyot' },
    { letter: 'B', pronunciation: '/be/', example: 'Bateau', exampleUz: 'Kema' },
    { letter: 'C', pronunciation: '/se/', example: 'Chat', exampleUz: 'Mushuk' },
    { letter: 'D', pronunciation: '/de/', example: 'Dauphin', exampleUz: 'Delfin' },
    { letter: 'E', pronunciation: '/ə/', example: 'École', exampleUz: 'Maktab' },
    { letter: 'F', pronunciation: '/ef/', example: 'Fleur', exampleUz: 'Gul' },
    { letter: 'G', pronunciation: '/ʒe/', example: 'Garage', exampleUz: 'Garaj' },
    { letter: 'H', pronunciation: '/aʃ/', example: 'Hôtel', exampleUz: 'Mehmonxona' },
    { letter: 'I', pronunciation: '/i/', example: 'Île', exampleUz: 'Orol' },
    { letter: 'J', pronunciation: '/ʒi/', example: 'Jardin', exampleUz: 'Bog\'' },
    { letter: 'K', pronunciation: '/ka/', example: 'Kilo', exampleUz: 'Kilogramm' },
    { letter: 'L', pronunciation: '/el/', example: 'Lune', exampleUz: 'Oy' },
    { letter: 'M', pronunciation: '/em/', example: 'Maison', exampleUz: 'Uy' },
    { letter: 'N', pronunciation: '/en/', example: 'Neige', exampleUz: 'Qor' },
    { letter: 'O', pronunciation: '/o/', example: 'Ordinateur', exampleUz: 'Kompyuter' },
    { letter: 'P', pronunciation: '/pe/', example: 'Pain', exampleUz: 'Non' },
    { letter: 'Q', pronunciation: '/ky/', example: 'Quatre', exampleUz: 'To\'rt' },
    { letter: 'R', pronunciation: '/ɛʁ/', example: 'Roi', exampleUz: 'Qirol' },
    { letter: 'S', pronunciation: '/es/', example: 'Soleil', exampleUz: 'Quyosh' },
    { letter: 'T', pronunciation: '/te/', example: 'Table', exampleUz: 'Stol' },
    { letter: 'U', pronunciation: '/y/', example: 'Usine', exampleUz: 'Zavod' },
    { letter: 'V', pronunciation: '/ve/', example: 'Voiture', exampleUz: 'Mashina' },
    { letter: 'W', pronunciation: '/dublə ve/', example: 'Wagon', exampleUz: 'Vagon' },
    { letter: 'X', pronunciation: '/iks/', example: 'Xénon', exampleUz: 'Ksenon' },
    { letter: 'Y', pronunciation: '/igʁɛk/', example: 'Yaourt', exampleUz: 'Yogurt' },
    { letter: 'Z', pronunciation: '/zɛd/', example: 'Zèbre', exampleUz: 'Zebra' },
  ],
  german: [
    { letter: 'A', pronunciation: '/aː/', example: 'Apfel', exampleUz: 'Olma' },
    { letter: 'B', pronunciation: '/beː/', example: 'Brot', exampleUz: 'Non' },
    { letter: 'C', pronunciation: '/tseː/', example: 'Computer', exampleUz: 'Kompyuter' },
    { letter: 'D', pronunciation: '/deː/', example: 'Dach', exampleUz: 'Tom' },
    { letter: 'E', pronunciation: '/eː/', example: 'Eis', exampleUz: 'Muzqaymoq' },
    { letter: 'F', pronunciation: '/ef/', example: 'Fisch', exampleUz: 'Baliq' },
    { letter: 'G', pronunciation: '/geː/', example: 'Garten', exampleUz: 'Bog\'' },
    { letter: 'H', pronunciation: '/haː/', example: 'Haus', exampleUz: 'Uy' },
    { letter: 'I', pronunciation: '/iː/', example: 'Insel', exampleUz: 'Orol' },
    { letter: 'J', pronunciation: '/jot/', example: 'Jacke', exampleUz: 'Kurtka' },
    { letter: 'K', pronunciation: '/kaː/', example: 'Kaffee', exampleUz: 'Qahva' },
    { letter: 'L', pronunciation: '/el/', example: 'Lampe', exampleUz: 'Chiroq' },
    { letter: 'M', pronunciation: '/em/', example: 'Maus', exampleUz: 'Sichqon' },
    { letter: 'N', pronunciation: '/en/', example: 'Nase', exampleUz: 'Burun' },
    { letter: 'O', pronunciation: '/oː/', example: 'Ofen', exampleUz: 'Pech' },
    { letter: 'P', pronunciation: '/peː/', example: 'Papier', exampleUz: 'Qog\'oz' },
    { letter: 'Q', pronunciation: '/kuː/', example: 'Quelle', exampleUz: 'Manba' },
    { letter: 'R', pronunciation: '/ɛʁ/', example: 'Regen', exampleUz: 'Yomg\'ir' },
    { letter: 'S', pronunciation: '/es/', example: 'Sonne', exampleUz: 'Quyosh' },
    { letter: 'T', pronunciation: '/teː/', example: 'Tisch', exampleUz: 'Stol' },
    { letter: 'U', pronunciation: '/uː/', example: 'Uhr', exampleUz: 'Soat' },
    { letter: 'V', pronunciation: '/faʊ/', example: 'Vogel', exampleUz: 'Qush' },
    { letter: 'W', pronunciation: '/veː/', example: 'Wasser', exampleUz: 'Suv' },
    { letter: 'X', pronunciation: '/iks/', example: 'Xylophon', exampleUz: 'Ksilofon' },
    { letter: 'Y', pronunciation: '/ʏpsilɔn/', example: 'Yoga', exampleUz: 'Yoga' },
    { letter: 'Z', pronunciation: '/tsɛt/', example: 'Zug', exampleUz: 'Poyezd' },
    { letter: 'Ä', pronunciation: '/ɛː/', example: 'Äpfel', exampleUz: 'Olmalar' },
    { letter: 'Ö', pronunciation: '/øː/', example: 'Öl', exampleUz: 'Yog\'' },
    { letter: 'Ü', pronunciation: '/yː/', example: 'Übung', exampleUz: 'Mashq' },
    { letter: 'ß', pronunciation: '/ɛs tsɛt/', example: 'Straße', exampleUz: 'Ko\'cha' },
  ],
  italian: [
    { letter: 'A', pronunciation: '/a/', example: 'Amore', exampleUz: 'Sevgi' },
    { letter: 'B', pronunciation: '/bi/', example: 'Bambino', exampleUz: 'Bola' },
    { letter: 'C', pronunciation: '/tʃi/', example: 'Casa', exampleUz: 'Uy' },
    { letter: 'D', pronunciation: '/di/', example: 'Dente', exampleUz: 'Tish' },
    { letter: 'E', pronunciation: '/e/', example: 'Elefante', exampleUz: 'Fil' },
    { letter: 'F', pronunciation: '/ef/', example: 'Fiore', exampleUz: 'Gul' },
    { letter: 'G', pronunciation: '/dʒi/', example: 'Gatto', exampleUz: 'Mushuk' },
    { letter: 'H', pronunciation: '/akka/', example: 'Hotel', exampleUz: 'Mehmonxona' },
    { letter: 'I', pronunciation: '/i/', example: 'Isola', exampleUz: 'Orol' },
    { letter: 'L', pronunciation: '/el/', example: 'Luna', exampleUz: 'Oy' },
    { letter: 'M', pronunciation: '/em/', example: 'Mare', exampleUz: 'Dengiz' },
    { letter: 'N', pronunciation: '/en/', example: 'Notte', exampleUz: 'Tun' },
    { letter: 'O', pronunciation: '/o/', example: 'Oro', exampleUz: 'Oltin' },
    { letter: 'P', pronunciation: '/pi/', example: 'Pane', exampleUz: 'Non' },
    { letter: 'Q', pronunciation: '/ku/', example: 'Quattro', exampleUz: 'To\'rt' },
    { letter: 'R', pronunciation: '/er/', example: 'Rosa', exampleUz: 'Atirgul' },
    { letter: 'S', pronunciation: '/es/', example: 'Sole', exampleUz: 'Quyosh' },
    { letter: 'T', pronunciation: '/ti/', example: 'Tavolo', exampleUz: 'Stol' },
    { letter: 'U', pronunciation: '/u/', example: 'Uva', exampleUz: 'Uzum' },
    { letter: 'V', pronunciation: '/vi/', example: 'Vento', exampleUz: 'Shamol' },
    { letter: 'Z', pronunciation: '/zeta/', example: 'Zucchero', exampleUz: 'Shakar' },
  ],
  portuguese: [
    { letter: 'A', pronunciation: '/a/', example: 'Água', exampleUz: 'Suv' },
    { letter: 'B', pronunciation: '/be/', example: 'Bola', exampleUz: 'To\'p' },
    { letter: 'C', pronunciation: '/se/', example: 'Casa', exampleUz: 'Uy' },
    { letter: 'D', pronunciation: '/de/', example: 'Dedo', exampleUz: 'Barmoq' },
    { letter: 'E', pronunciation: '/e/', example: 'Escola', exampleUz: 'Maktab' },
    { letter: 'F', pronunciation: '/ef/', example: 'Fogo', exampleUz: 'Olov' },
    { letter: 'G', pronunciation: '/ʒe/', example: 'Gato', exampleUz: 'Mushuk' },
    { letter: 'H', pronunciation: '/aga/', example: 'Hotel', exampleUz: 'Mehmonxona' },
    { letter: 'I', pronunciation: '/i/', example: 'Ilha', exampleUz: 'Orol' },
    { letter: 'J', pronunciation: '/ʒota/', example: 'Jacaré', exampleUz: 'Timsoh' },
    { letter: 'K', pronunciation: '/ka/', example: 'Kiwi', exampleUz: 'Kivi' },
    { letter: 'L', pronunciation: '/el/', example: 'Lua', exampleUz: 'Oy' },
    { letter: 'M', pronunciation: '/em/', example: 'Mão', exampleUz: 'Qo\'l' },
    { letter: 'N', pronunciation: '/en/', example: 'Nuvem', exampleUz: 'Bulut' },
    { letter: 'O', pronunciation: '/o/', example: 'Olho', exampleUz: 'Ko\'z' },
    { letter: 'P', pronunciation: '/pe/', example: 'Pão', exampleUz: 'Non' },
    { letter: 'Q', pronunciation: '/ke/', example: 'Queijo', exampleUz: 'Pishloq' },
    { letter: 'R', pronunciation: '/ɛʁ/', example: 'Rio', exampleUz: 'Daryo' },
    { letter: 'S', pronunciation: '/es/', example: 'Sol', exampleUz: 'Quyosh' },
    { letter: 'T', pronunciation: '/te/', example: 'Terra', exampleUz: 'Yer' },
    { letter: 'U', pronunciation: '/u/', example: 'Uva', exampleUz: 'Uzum' },
    { letter: 'V', pronunciation: '/ve/', example: 'Vida', exampleUz: 'Hayot' },
    { letter: 'W', pronunciation: '/dabliu/', example: 'Web', exampleUz: 'Internet' },
    { letter: 'X', pronunciation: '/ʃis/', example: 'Xadrez', exampleUz: 'Shaxmat' },
    { letter: 'Y', pronunciation: '/ipsilɔn/', example: 'Yoga', exampleUz: 'Yoga' },
    { letter: 'Z', pronunciation: '/ze/', example: 'Zebra', exampleUz: 'Zebra' },
  ],
  russian: [
    { letter: 'А', pronunciation: '/a/', example: 'Арбуз', exampleUz: 'Tarvuz' },
    { letter: 'Б', pronunciation: '/b/', example: 'Банан', exampleUz: 'Banan' },
    { letter: 'В', pronunciation: '/v/', example: 'Вода', exampleUz: 'Suv' },
    { letter: 'Г', pronunciation: '/g/', example: 'Гора', exampleUz: 'Tog\'' },
    { letter: 'Д', pronunciation: '/d/', example: 'Дом', exampleUz: 'Uy' },
    { letter: 'Е', pronunciation: '/je/', example: 'Енот', exampleUz: 'Yenot' },
    { letter: 'Ё', pronunciation: '/jo/', example: 'Ёж', exampleUz: 'Tipratikan' },
    { letter: 'Ж', pronunciation: '/ʐ/', example: 'Жук', exampleUz: 'Qo\'ng\'iz' },
    { letter: 'З', pronunciation: '/z/', example: 'Звезда', exampleUz: 'Yulduz' },
    { letter: 'И', pronunciation: '/i/', example: 'Игра', exampleUz: 'O\'yin' },
    { letter: 'Й', pronunciation: '/j/', example: 'Йогурт', exampleUz: 'Yogurt' },
    { letter: 'К', pronunciation: '/k/', example: 'Кот', exampleUz: 'Mushuk' },
    { letter: 'Л', pronunciation: '/l/', example: 'Лев', exampleUz: 'Sher' },
    { letter: 'М', pronunciation: '/m/', example: 'Молоко', exampleUz: 'Sut' },
    { letter: 'Н', pronunciation: '/n/', example: 'Нос', exampleUz: 'Burun' },
    { letter: 'О', pronunciation: '/o/', example: 'Окно', exampleUz: 'Deraza' },
    { letter: 'П', pronunciation: '/p/', example: 'Парк', exampleUz: 'Park' },
    { letter: 'Р', pronunciation: '/r/', example: 'Рыба', exampleUz: 'Baliq' },
    { letter: 'С', pronunciation: '/s/', example: 'Солнце', exampleUz: 'Quyosh' },
    { letter: 'Т', pronunciation: '/t/', example: 'Тигр', exampleUz: 'Yo\'lbars' },
    { letter: 'У', pronunciation: '/u/', example: 'Утка', exampleUz: 'O\'rdak' },
    { letter: 'Ф', pronunciation: '/f/', example: 'Флаг', exampleUz: 'Bayroq' },
    { letter: 'Х', pronunciation: '/x/', example: 'Хлеб', exampleUz: 'Non' },
    { letter: 'Ц', pronunciation: '/ts/', example: 'Цветок', exampleUz: 'Gul' },
    { letter: 'Ч', pronunciation: '/tɕ/', example: 'Часы', exampleUz: 'Soat' },
    { letter: 'Ш', pronunciation: '/ʂ/', example: 'Шар', exampleUz: 'Shar' },
    { letter: 'Щ', pronunciation: '/ɕː/', example: 'Щука', exampleUz: 'Cho\'rtan baliq' },
    { letter: 'Ъ', pronunciation: '—', example: 'Объект', exampleUz: 'Ob\'yekt' },
    { letter: 'Ы', pronunciation: '/ɨ/', example: 'Сыр', exampleUz: 'Pishloq' },
    { letter: 'Ь', pronunciation: '—', example: 'Пень', exampleUz: 'Tog\'on' },
    { letter: 'Э', pronunciation: '/ɛ/', example: 'Этаж', exampleUz: 'Qavat' },
    { letter: 'Ю', pronunciation: '/ju/', example: 'Юла', exampleUz: 'Pildiroq' },
    { letter: 'Я', pronunciation: '/ja/', example: 'Яблоко', exampleUz: 'Olma' },
  ],
};

// ===================== LESSON GENERATORS =====================

const TOTAL_LESSONS = 100;

const lessonTopics = [
  // Alphabet lessons (1-10)
  { range: [1, 10], type: 'alphabet', icon: '🔤', category: 'Alifbo' },
  // Basic vocabulary (11-20)
  { range: [11, 20], type: 'vocabulary', icon: '👋', category: 'Asosiy so\'zlar' },
  // Numbers, colors, time (21-30)
  { range: [21, 30], type: 'vocabulary', icon: '🔢', category: 'Raqam va ranglar' },
  // Family and people (31-40)
  { range: [31, 40], type: 'reading', icon: '👨‍👩‍👧‍👦', category: 'Oila va odamlar' },
  // Food and drinks (41-50)
  { range: [41, 50], type: 'vocabulary', icon: '🍽️', category: 'Taom va ichimliklar' },
  // Daily life (51-60)
  { range: [51, 60], type: 'listening', icon: '🏠', category: 'Kundalik hayot' },
  // Travel and places (61-70)
  { range: [61, 70], type: 'speaking', icon: '✈️', category: 'Sayohat va joylar' },
  // Weather and nature (71-80)
  { range: [71, 80], type: 'reading', icon: '🌤️', category: 'Ob-havo va tabiat' },
  // Work and hobbies (81-90)
  { range: [81, 90], type: 'writing', icon: '💼', category: 'Ish va qiziqishlar' },
  // Review and culture (91-100)
  { range: [91, 100], type: 'grammar', icon: '🎯', category: 'Takrorlash va madaniyat' },
];

const categoryColors = {
  'alphabet': '#3B82F6',
  'vocabulary': '#10B981',
  'reading': '#8B5CF6',
  'listening': '#F59E0B',
  'speaking': '#EF4444',
  'writing': '#EC4899',
  'grammar': '#14B8A6',
};

function getLessonColor(type) {
  return categoryColors[type] || '#6B7280';
}

// Alphabet lesson titles
const alphabetLessonTitles = {
  english: [
    'Alifbo: A-D',
    'Alifbo: E-H',
    'Alifbo: I-L',
    'Alifbo: M-P',
    'Alifbo: Q-T',
    'Alifbo: U-X',
    'Alifbo: Y-Z',
    'Alifbo takrorlash 1',
    'Alifbo takrorlash 2',
    'Alifbo test',
  ],
  spanish: [
    'Alifbo: A-D',
    'Alifbo: E-H',
    'Alifbo: I-L',
    'Alifbo: M-Ñ',
    'Alifbo: O-R',
    'Alifbo: S-V',
    'Alifbo: W-Z',
    'Alifbo takrorlash 1',
    'Alifbo takrorlash 2',
    'Alifbo test',
  ],
  french: [
    'Alifbo: A-D',
    'Alifbo: E-H',
    'Alifbo: I-L',
    'Alifbo: M-P',
    'Alifbo: Q-T',
    'Alifbo: U-X',
    'Alifbo: Y-Z',
    'Alifbo takrorlash 1',
    'Alifbo takrorlash 2',
    'Alifbo test',
  ],
  german: [
    'Alifbo: A-D',
    'Alifbo: E-H',
    'Alifbo: I-L',
    'Alifbo: M-P',
    'Alifbo: Q-Ü',
    'Alifbo: V-ß',
    'Alifbo: Ä-Ü ß',
    'Alifbo takrorlash 1',
    'Alifbo takrorlash 2',
    'Alifbo test',
  ],
  italian: [
    'Alifbo: A-D',
    'Alifbo: E-H',
    'Alifbo: I-L',
    'Alifbo: M-P',
    'Alifbo: Q-T',
    'Alifbo: U-Z',
    'Alifbo takrorlash',
    'Alifbo test 1',
    'Alifbo test 2',
    'Alifbo yakuniy',
  ],
  portuguese: [
    'Alifbo: A-D',
    'Alifbo: E-H',
    'Alifbo: I-L',
    'Alifbo: M-P',
    'Alifbo: Q-T',
    'Alifbo: U-X',
    'Alifbo: Y-Z',
    'Alifbo takrorlash 1',
    'Alifbo takrorlash 2',
    'Alifbo test',
  ],
  russian: [
    'Alifbo: А-Д',
    'Alifbo: Е-Й',
    'Alifbo: К-Н',
    'Alifbo: О-Т',
    'Alifbo: У-Ц',
    'Alifbo: Ч-Ъ',
    'Alifbo: Ы-Я',
    'Alifbo takrorlash 1',
    'Alifbo takrorlash 2',
    'Alifbo test',
  ],
};

// Common topic titles (for lessons 11-100)
const commonLessonTitles = [
  // 11-20: Greetings & basic words
  "Salomlashish \"Hello\"",
  "Xayrlashish \"Goodbye\"",
  "O'zingizni tanishtirish",
  "Iltimos va rahmat",
  "Ha va yo'q",
  "Kechirim so'rash",
  "Tanishish savollari",
  "Rasmiy va norasmiy nutq",
  "So'zlashish odoblari",
  " umumiy takrorlash",
  // 21-30: Numbers, colors, time
  "1-10 gacha raqamlar",
  "11-100 gacha raqamlar",
  "Asosiy ranglar",
  "Ranglar bilan gaplar",
  "Soat va vaqt",
  "Hafta kunlari",
  "Oy nomlari",
  "Sana va yil",
  "Yosh haqida so'zlashish",
  "Vaqt bilan bog'liq iboralar",
  // 31-40: Family & people
  "Oila a'zolari",
  "Otalar va onalar",
  "Aka-uka va opa-singil",
  "Bobo va buvilar",
  "Do'stlar va tanishlar",
  "Odamlarni ta'riflash",
  "Kasblar",
  "Tana a'zolari",
  "His-tuyg'ular",
  "Shaxsiy xususiyatlar",
  // 41-50: Food & drinks
  "Ovqat va taomlar",
  "Nonushta",
  "Tushlik va kechki ovqat",
  "Meva va sabzavotlar",
  "Ichimliklar",
  "Restoranda buyurtma berish",
  "Mazali taomlar",
  "Pazandachilik",
  "Menyu o'qish",
  "Oziq-ovqat xarid qilish",
  // 51-60: Daily life
  "Uyg'onish va tayyorgarlik",
  "Kundalik tartib",
  "Uy vazifalari",
  "Uy atrofidagi narsalar",
  "Kiyim-kechak",
  "Do'konda xarid qilish",
  "Pul va narxlar",
  "Transport",
  "Yo'nalish so'rash",
  "Kunlik rejalar",
  // 61-70: Travel & places
  "Shahar va qishloq",
  "Mehmonxonada",
  "Aeroportda",
  "Poyezd va avtobus",
  "Diqqatga sazovor joylar",
  "Karta o'qish",
  "Ob-havo haqida so'zlashish",
  "Ta'til va dam olish",
  "Sayohat hikoyalari",
  "Turistik iboralar",
  // 71-80: Weather & nature
  "Ob-havo turlari",
  "Yomg'ir va qor",
  "Fasllar",
  "Hayvonlar",
  "O'simliklar va gullar",
  "Tabiat hodisalari",
  "Atrof-muhit",
  "Ekologiya",
  "O'rmon va tog'lar",
  "Dengiz va okean",
  // 81-90: Work & hobbies
  "Ish joyi va kasblar",
  "Ish kuni",
  "Ish haqida suhbat",
  "Sevimli mashg'ulotlar",
  "Sport va o'yinlar",
  "Musiqa va san'at",
  "Kitob va film",
  "Internet va texnologiya",
  "Telefon va aloqa",
  "Ijtimoiy tarmoqlar",
  // 91-100: Review
  "1-10 dars takrorlash",
  "11-20 dars takrorlash",
  "21-30 dars takrorlash",
  "31-40 dars takrorlash",
  "41-50 dars takrorlash",
  "51-60 dars takrorlash",
  "61-70 dars takrorlash",
  "71-80 dars takrorlash",
  "81-90 dars takrorlash",
  "Yakuniy test",
];

// Language-specific lesson subtitles
const lessonDescriptions = {
  english: [
    // Alphabet (1-10)
    "Learn letters A through D",
    "Learn letters E through H",
    "Learn letters I through L",
    "Learn letters M through P",
    "Learn letters Q through T",
    "Learn letters U through X",
    "Learn letters Y and Z",
    "Review alphabet part 1",
    "Review alphabet part 2",
    "Alphabet test",
    // 11-100
    "Learn to greet people in English",
    "Learn how to say goodbye",
    "Introduce yourself in English",
    "Say please and thank you",
    "Say yes and no",
    "Apologize in English",
    "Ask basic introduction questions",
    "Formal vs informal speech",
    "Conversation etiquette",
    "General review of greetings",
    "Numbers 1 to 10",
    "Numbers 11 to 100",
    "Basic colors in English",
    "Sentences with colors",
    "Clock and telling time",
    "Days of the week",
    "Months of the year",
    "Dates and years",
    "Talking about age",
    "Time-related expressions",
    "Family members vocabulary",
    "Fathers and mothers",
    "Brothers and sisters",
    "Grandparents",
    "Friends and acquaintances",
    "Describing people",
    "Professions and jobs",
    "Body parts",
    "Feelings and emotions",
    "Personal characteristics",
    "Food and meals",
    "Breakfast vocabulary",
    "Lunch and dinner",
    "Fruits and vegetables",
    "Drinks and beverages",
    "Ordering at a restaurant",
    "Delicious foods",
    "Cooking vocabulary",
    "Reading a menu",
    "Grocery shopping",
    "Waking up and morning routine",
    "Daily routine",
    "Household chores",
    "Things around the house",
    "Clothing and fashion",
    "Shopping at a store",
    "Money and prices",
    "Transportation",
    "Asking for directions",
    "Daily plans",
    "City and countryside",
    "At a hotel",
    "At the airport",
    "Train and bus",
    "Tourist attractions",
    "Reading a map",
    "Talking about weather",
    "Holidays and relaxation",
    "Travel stories",
    "Tourist phrases",
    "Types of weather",
    "Rain and snow",
    "Four seasons",
    "Animals vocabulary",
    "Plants and flowers",
    "Natural phenomena",
    "Environment",
    "Ecology",
    "Forests and mountains",
    "Sea and ocean",
    "Workplace and careers",
    "Work day",
    "Talking about work",
    "Favorite hobbies",
    "Sports and games",
    "Music and art",
    "Books and movies",
    "Internet and technology",
    "Phone and communication",
    "Social media",
    "Review lessons 1-10",
    "Review lessons 11-20",
    "Review lessons 21-30",
    "Review lessons 31-40",
    "Review lessons 41-50",
    "Review lessons 51-60",
    "Review lessons 61-70",
    "Review lessons 71-80",
    "Review lessons 81-90",
    "Final exam",
  ],
};

// Generate descriptions for languages other than English
function generateDescriptions(langId) {
  return lessonDescriptions.english.map((desc, i) => {
    if (i < 10) {
      // Alphabet lessons - translate
      const letters = alphabets[langId];
      if (!letters) return desc;
      const titles = alphabetLessonTitles[langId] || alphabetLessonTitles.english;
      return titles[i] ? `${titles[i]} - learn letters` : desc;
    }
    return desc; // Keep English descriptions as-is for now
  });
}

// Get letters for an alphabet lesson
function getAlphabetLetters(langId, lessonNum) {
  const letters = alphabets[langId];
  if (!letters) return [];
  const perLesson = Math.ceil(letters.length / 7);
  const start = (lessonNum - 1) * perLesson;
  const end = Math.min(start + perLesson, letters.length);
  return letters.slice(start, end);
}

// Generate exercises for alphabet lessons
function generateAlphabetExercise(langId, lessonNum, letters) {
  if (!letters || letters.length === 0) {
    return {
      type: 'review',
      question: 'Select the correct letter',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 0,
    };
  }
  const idx = Math.floor(Math.random() * letters.length);
  const letter = letters[idx];
  const allLetters = alphabets[langId] || [];
  const otherLetters = allLetters
    .filter(l => l.letter !== letter.letter)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const options = [letter, ...otherLetters].sort(() => Math.random() - 0.5);
  const correctIdx = options.findIndex(o => o.letter === letter.letter);

  return {
    type: 'alphabet',
    question: `"${letter.letter}" harfini toping`,
    letter: letter,
    options: options.map(o => o.letter),
    correctAnswer: correctIdx,
  };
}

// Generate exercises for regular lessons
function generateRegularExercise(langId, lessonNum) {
  const types = ['multiple-choice', 'matching', 'fill-blank'];
  const type = types[lessonNum % types.length];

  // Random vocabulary-based exercise
  const sampleWords = {
    english: [
      { q: 'Hello', c: 'Salom', o: ['Salom', 'Xayr', 'Rahmat', 'Iltimos'] },
      { q: 'Goodbye', c: 'Xayr', o: ['Salom', 'Xayr', 'Ha', 'Yo\'q'] },
      { q: 'Thank you', c: 'Rahmat', o: ['Iltimos', 'Rahmat', 'Kechirasiz', 'Marhamat'] },
      { q: 'Please', c: 'Iltimos', o: ['Rahmat', 'Iltimos', 'Kechirasiz', 'Xayr'] },
      { q: 'Yes', c: 'Ha', o: ['Yo\'q', 'Balki', 'Ha', 'Hech qachon'] },
      { q: 'No', c: 'Yo\'q', o: ['Ha', 'Balki', 'Yo\'q', 'Har doim'] },
      { q: 'Water', c: 'Suv', o: ['Non', 'Suv', 'Choy', 'Sharbat'] },
      { q: 'Bread', c: 'Non', o: ['Non', 'Suv', 'Go\'sht', 'Pishloq'] },
      { q: 'Book', c: 'Kitob', o: ['Kitob', 'Qalam', 'Da\'ftar', 'Sumka'] },
      { q: 'House', c: 'Uy', o: ['Maktab', 'Uy', 'Do\'kon', 'Bog\''], },
    ],
  };

  const words = sampleWords.english;
  const word = words[(lessonNum + words.length) % words.length];

  return {
    type: type,
    question: `"${word.q}" so'zining ma'nosi nima?`,
    options: word.o,
    correctAnswer: word.o.indexOf(word.c),
  };
}

// Generate all 100 lessons for a language
export function generateLessons(langId) {
  const lessons = [];
  const alphabet = alphabets[langId] || alphabets.english;
  const titles = alphabetLessonTitles[langId] || alphabetLessonTitles.english;
  const typeSequence = [
    'alphabet', 'alphabet', 'alphabet', 'alphabet', 'alphabet',
    'alphabet', 'alphabet', 'alphabet', 'alphabet', 'alphabet',
    'vocabulary', 'vocabulary', 'vocabulary', 'vocabulary', 'vocabulary',
    'vocabulary', 'vocabulary', 'vocabulary', 'vocabulary', 'vocabulary',
    'vocabulary', 'vocabulary', 'vocabulary', 'vocabulary', 'vocabulary',
    'vocabulary', 'vocabulary', 'vocabulary', 'vocabulary', 'vocabulary',
    'reading', 'reading', 'reading', 'reading', 'reading',
    'reading', 'reading', 'reading', 'reading', 'reading',
    'vocabulary', 'vocabulary', 'vocabulary', 'vocabulary', 'vocabulary',
    'vocabulary', 'vocabulary', 'vocabulary', 'vocabulary', 'vocabulary',
    'listening', 'listening', 'listening', 'listening', 'listening',
    'listening', 'listening', 'listening', 'listening', 'listening',
    'speaking', 'speaking', 'speaking', 'speaking', 'speaking',
    'speaking', 'speaking', 'speaking', 'speaking', 'speaking',
    'reading', 'reading', 'reading', 'reading', 'reading',
    'reading', 'reading', 'reading', 'reading', 'reading',
    'writing', 'writing', 'writing', 'writing', 'writing',
    'writing', 'writing', 'writing', 'writing', 'writing',
    'grammar', 'grammar', 'grammar', 'grammar', 'grammar',
    'grammar', 'grammar', 'grammar', 'grammar', 'grammar',
  ];

  const categoryMap = {
    alphabet: 'Alifbo',
    vocabulary: 'So\'z boyligi',
    reading: 'O\'qish',
    listening: 'Tinglash',
    speaking: 'Gapirish',
    writing: 'Yozish',
    grammar: 'Grammatika',
  };

  const icons = {
    alphabet: '🔤',
    vocabulary: '📝',
    reading: '📖',
    listening: '🎧',
    speaking: '🎤',
    writing: '✍️',
    grammar: '📐',
  };

  for (let i = 1; i <= TOTAL_LESSONS; i++) {
    const type = typeSequence[i - 1];
    const isAlphabet = type === 'alphabet';
    const letters = isAlphabet ? getAlphabetLetters(langId, i) : [];
    const title = isAlphabet && titles[i - 1]
      ? titles[i - 1]
      : commonLessonTitles[i - 1] || `Dars ${i}`;

    const exercise = isAlphabet
      ? generateAlphabetExercise(langId, i, letters)
      : generateRegularExercise(langId, i);

    lessons.push({
      id: `${langId}-lesson-${i}`,
      number: i,
      title: title,
      type: type,
      icon: icons[type] || '📚',
      category: categoryMap[type] || 'Umumiy',
      description: isAlphabet && letters.length > 0
        ? `${letters.map(l => l.letter).join(', ')} harflarini o'rganing`
        : `Dars ${i}: ${title}`,
      color: getLessonColor(type),
      content: {
        lessonNumber: i,
        letters: isAlphabet ? letters : [],
        type: type,
      },
      exercise: exercise,
    });
  }
  return lessons;
}

// Get all lessons for a language (cached)
const lessonsCache = {};
export function getLessons(langId) {
  if (!lessonsCache[langId]) {
    lessonsCache[langId] = generateLessons(langId);
  }
  return lessonsCache[langId];
}

// Get a specific lesson
export function getLesson(langId, lessonNumber) {
  const lessons = getLessons(langId);
  return lessons.find(l => l.number === lessonNumber) || null;
}

// Legacy support for getLanguageData
export function getLanguageData(langId, lessonNumber) {
  const lang = languages.find(l => l.id === langId);
  if (!lang) return null;
  const lesson = getLesson(langId, parseInt(lessonNumber));
  return lesson ? { ...lang, lesson } : null;
}

// Get language progress stats
export function getLanguageStats(langId, progress) {
  const lessons = getLessons(langId);
  let completed = 0;
  let totalXp = 0;

  lessons.forEach(lesson => {
    const key = `${langId}-lesson-${lesson.number}`;
    const prog = progress[key];
    if (prog?.completed) {
      completed++;
      totalXp += (prog.score || 0);
    }
  });

  return {
    completed,
    total: TOTAL_LESSONS,
    percentage: Math.round((completed / TOTAL_LESSONS) * 100),
    totalXp,
  };
}

export { TOTAL_LESSONS };
