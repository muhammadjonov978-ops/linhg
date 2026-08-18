// ==== O'YINLAR UCHUN SO'Z MA'LUMOTLARI ====
// Har bir tilda o'zbekcha tarjimasi bilan so'z juftliklari.
// WordMatch, SentenceBuilder, SpeedTyping o'yinlarida ishlatiladi.

const WORD_PAIRS = {
  english: [
    { word: 'Hello', meaning: 'Salom', example: 'Hello, how are you?' },
    { word: 'Thank you', meaning: 'Rahmat', example: 'Thank you very much!' },
    { word: 'Goodbye', meaning: 'Xayr', example: 'Goodbye, see you tomorrow!' },
    { word: 'Water', meaning: 'Suv', example: 'Can I have some water?' },
    { word: 'Food', meaning: 'Ovqat', example: 'The food is delicious.' },
    { word: 'Friend', meaning: "Do'st", example: 'She is my best friend.' },
    { word: 'Book', meaning: 'Kitob', example: 'I am reading a book.' },
    { word: 'House', meaning: 'Uy', example: 'This is my house.' },
    { word: 'Sun', meaning: 'Quyosh', example: 'The sun is shining.' },
    { word: 'Moon', meaning: 'Oy', example: 'The moon is beautiful tonight.' },
    { word: 'Tree', meaning: 'Daraxt', example: 'There is a tall tree in the garden.' },
    { word: 'Cat', meaning: 'Mushuk', example: 'The cat is sleeping.' },
    { word: 'Dog', meaning: 'It', example: 'The dog is playing.' },
    { word: 'Bird', meaning: 'Qush', example: 'The bird can fly.' },
    { word: 'Apple', meaning: 'Olma', example: 'I eat an apple every day.' },
    { word: 'Love', meaning: 'Sevgi', example: 'Love is beautiful.' },
    { word: 'Happy', meaning: 'Baxtli', example: 'I am very happy today.' },
    { word: 'Beautiful', meaning: "Go'zal", example: 'The garden is beautiful.' },
    { word: 'Time', meaning: 'Vaqt', example: 'What time is it?' },
    { word: 'World', meaning: 'Dunyo', example: 'The world is big.' },
    { word: 'Family', meaning: 'Oila', example: 'My family is large.' },
    { word: 'School', meaning: 'Maktab', example: 'I go to school every day.' },
    { word: 'Music', meaning: 'Musiqa', example: 'I love listening to music.' },
    { word: 'Dream', meaning: 'Orzu', example: 'I have a big dream.' },
    { word: 'Light', meaning: 'Yorug\'lik', example: 'Turn on the light.' },
  ],
  spanish: [
    { word: 'Hola', meaning: 'Salom', example: '¡Hola! ¿Cómo estás?' },
    { word: 'Gracias', meaning: 'Rahmat', example: 'Muchas gracias por tu ayuda.' },
    { word: 'Adiós', meaning: 'Xayr', example: 'Adiós, ¡hasta mañana!' },
    { word: 'Agua', meaning: 'Suv', example: '¿Puedo tener agua?' },
    { word: 'Comida', meaning: 'Ovqat', example: 'La comida está deliciosa.' },
    { word: 'Amigo', meaning: "Do'st", example: 'Él es mi mejor amigo.' },
    { word: 'Libro', meaning: 'Kitob', example: 'Estoy leyendo un libro.' },
    { word: 'Casa', meaning: 'Uy', example: 'Esta es mi casa.' },
    { word: 'Sol', meaning: 'Quyosh', example: 'El sol está brillando.' },
    { word: 'Luna', meaning: 'Oy', example: 'La luna es hermosa esta noche.' },
    { word: 'Árbol', meaning: 'Daraxt', example: 'Hay un árbol alto en el jardín.' },
    { word: 'Gato', meaning: 'Mushuk', example: 'El gato está durmiendo.' },
    { word: 'Perro', meaning: 'It', example: 'El perro está jugando.' },
    { word: 'Pájaro', meaning: 'Qush', example: 'El pájaro puede volar.' },
    { word: 'Manzana', meaning: 'Olma', example: 'Como una manzana cada día.' },
    { word: 'Amor', meaning: 'Sevgi', example: 'El amor es hermoso.' },
    { word: 'Feliz', meaning: 'Baxtli', example: 'Estoy muy feliz hoy.' },
    { word: 'Hermoso', meaning: "Go'zal", example: 'El jardín es hermoso.' },
    { word: 'Tiempo', meaning: 'Vaqt', example: '¿Qué hora es?' },
    { word: 'Mundo', meaning: 'Dunyo', example: 'El mundo es grande.' },
  ],
  french: [
    { word: 'Bonjour', meaning: 'Salom', example: 'Bonjour, comment allez-vous?' },
    { word: 'Merci', meaning: 'Rahmat', example: 'Merci beaucoup pour votre aide.' },
    { word: 'Au revoir', meaning: 'Xayr', example: 'Au revoir, à demain!' },
    { word: 'Eau', meaning: 'Suv', example: "Puis-je avoir de l'eau?" },
    { word: 'Nourriture', meaning: 'Ovqat', example: 'La nourriture est délicieuse.' },
    { word: 'Ami', meaning: "Do'st", example: 'Il est mon meilleur ami.' },
    { word: 'Livre', meaning: 'Kitob', example: 'Je lis un livre.' },
    { word: 'Maison', meaning: 'Uy', example: "C'est ma maison." },
    { word: 'Soleil', meaning: 'Quyosh', example: 'Le soleil brille.' },
    { word: 'Lune', meaning: 'Oy', example: 'La lune est belle ce soir.' },
    { word: 'Arbre', meaning: 'Daraxt', example: "Il y a un arbre dans le jardin." },
    { word: 'Chat', meaning: 'Mushuk', example: 'Le chat dort.' },
    { word: 'Chien', meaning: 'It', example: 'Le chien joue.' },
    { word: 'Oiseau', meaning: 'Qush', example: "L'oiseau peut voler." },
    { word: 'Pomme', meaning: 'Olma', example: 'Je mange une pomme chaque jour.' },
    { word: 'Amour', meaning: 'Sevgi', example: "L'amour est beau." },
    { word: 'Heureux', meaning: 'Baxtli', example: "Je suis très heureux aujourd'hui." },
    { word: 'Beau', meaning: "Go'zal", example: 'Le jardin est beau.' },
    { word: 'Temps', meaning: 'Vaqt', example: "Quelle heure est-il?" },
    { word: 'Monde', meaning: 'Dunyo', example: 'Le monde est grand.' },
  ],
  german: [
    { word: 'Hallo', meaning: 'Salom', example: 'Hallo, wie geht es Ihnen?' },
    { word: 'Danke', meaning: 'Rahmat', example: 'Vielen Dank für Ihre Hilfe.' },
    { word: 'Tschüss', meaning: 'Xayr', example: 'Tschüss, bis morgen!' },
    { word: 'Wasser', meaning: 'Suv', example: 'Kann ich Wasser haben?' },
    { word: 'Essen', meaning: 'Ovqat', example: 'Das Essen ist köstlich.' },
    { word: 'Freund', meaning: "Do'st", example: 'Er ist mein bester Freund.' },
    { word: 'Buch', meaning: 'Kitob', example: 'Ich lese ein Buch.' },
    { word: 'Haus', meaning: 'Uy', example: 'Das ist mein Haus.' },
    { word: 'Sonne', meaning: 'Quyosh', example: 'Die Sonne scheint.' },
    { word: 'Mond', meaning: 'Oy', example: 'Der Mond ist heute Abend schön.' },
    { word: 'Baum', meaning: 'Daraxt', example: 'Es gibt einen hohen Baum im Garten.' },
    { word: 'Katze', meaning: 'Mushuk', example: 'Die Katze schläft.' },
    { word: 'Hund', meaning: 'It', example: 'Der Hund spielt.' },
    { word: 'Vogel', meaning: 'Qush', example: 'Der Vogel kann fliegen.' },
    { word: 'Apfel', meaning: 'Olma', example: 'Ich esse jeden Tag einen Apfel.' },
    { word: 'Liebe', meaning: 'Sevgi', example: 'Liebe ist schön.' },
    { word: 'Glücklich', meaning: 'Baxtli', example: 'Ich bin heute sehr glücklich.' },
    { word: 'Schön', meaning: "Go'zal", example: 'Der Garten ist schön.' },
    { word: 'Zeit', meaning: 'Vaqt', example: 'Wie spät ist es?' },
    { word: 'Welt', meaning: 'Dunyo', example: 'Die Welt ist groß.' },
  ],
  korean: [
    { word: '안녕하세요', meaning: 'Salom', example: '안녕하세요, 잘 지내세요?' },
    { word: '감사합니다', meaning: 'Rahmat', example: '도움 주셔서 감사합니다.' },
    { word: '안녕히 가세요', meaning: 'Xayr', example: '안녕히 가세요, 내일 봐요!' },
    { word: '물', meaning: 'Suv', example: '물 좀 주세요.' },
    { word: '음식', meaning: 'Ovqat', example: '음식이 맛있어요.' },
    { word: '친구', meaning: "Do'st", example: '그는 제最好的 친구예요.' },
    { word: '책', meaning: 'Kitob', example: '책을 읽고 있어요.' },
    { word: '집', meaning: 'Uy', example: '이것은 제 집이에요.' },
    { word: '태양', meaning: 'Quyosh', example: '태양이 빛나고 있어요.' },
    { word: '달', meaning: 'Oy', example: '오늘 밤 달이 예뻐요.' },
  ],
  japanese: [
    { word: 'こんにちは', meaning: 'Salom', example: 'こんにちは、お元気ですか？' },
    { word: 'ありがとう', meaning: 'Rahmat', example: 'たくさんありがとう。' },
    { word: 'さようなら', meaning: 'Xayr', example: 'さようなら、また明日！' },
    { word: '水', meaning: 'Suv', example: '水をください。' },
    { word: '食べ物', meaning: 'Ovqat', example: '食べ物はおいしいです。' },
    { word: '友達', meaning: "Do'st", example: '彼は私の親友です。' },
    { word: '本', meaning: 'Kitob', example: '本を読んでいます。' },
    { word: '家', meaning: 'Uy', example: 'これは私の家です。' },
    { word: '太陽', meaning: 'Quyosh', example: '太陽が輝いています。' },
    { word: '月', meaning: 'Oy', example: '今夜の月は綺麗です。' },
  ],
  chinese: [
    { word: '你好', meaning: 'Salom', example: '你好，你好吗？' },
    { word: '谢谢', meaning: 'Rahmat', example: '非常感谢你的帮助。' },
    { word: '再见', meaning: 'Xayr', example: '再见，明天见！' },
    { word: '水', meaning: 'Suv', example: '能给我一些水吗？' },
    { word: '食物', meaning: 'Ovqat', example: '食物很美味。' },
    { word: '朋友', meaning: "Do'st", example: '他是我最好的朋友。' },
    { word: '书', meaning: 'Kitob', example: '我在看书。' },
    { word: '家', meaning: 'Uy', example: '这是我的家。' },
    { word: '太阳', meaning: 'Quyosh', example: '太阳在闪耀。' },
    { word: '月亮', meaning: 'Oy', example: '今晚的月亮很美。' },
  ],
  russian: [
    { word: 'Привет', meaning: 'Salom', example: 'Привет, как дела?' },
    { word: 'Спасибо', meaning: 'Rahmat', example: 'Большое спасибо за помощь.' },
    { word: 'До свидания', meaning: 'Xayr', example: 'До свидания, до завтра!' },
    { word: 'Вода', meaning: 'Suv', example: 'Можно воды?' },
    { word: 'Еда', meaning: 'Ovqat', example: 'Еда очень вкусная.' },
    { word: 'Друг', meaning: "Do'st", example: 'Он мой лучший друг.' },
    { word: 'Книга', meaning: 'Kitob', example: 'Я читаю книгу.' },
    { word: 'Дом', meaning: 'Uy', example: 'Это мой дом.' },
    { word: 'Солнце', meaning: 'Quyosh', example: 'Солнце светит.' },
    { word: 'Луна', meaning: 'Oy', example: 'Луна今晚красива.' },
  ],
  turkish: [
    { word: 'Merhaba', meaning: 'Salom', example: 'Merhaba, nasılsınız?' },
    { word: 'Teşekkürler', meaning: 'Rahmat', example: 'Yardımınız için çok teşekkürler.' },
    { word: 'Hoşça kal', meaning: 'Xayr', example: 'Hoşça kal, yarın görüşürüz!' },
    { word: 'Su', meaning: 'Suv', example: 'Su alabilir miyim?' },
    { word: 'Yemek', meaning: 'Ovqat', example: 'Yemek çok lezzetli.' },
    { word: 'Arkadaş', meaning: "Do'st", example: 'O benim en iyi arkadaşım.' },
    { word: 'Kitap', meaning: 'Kitob', example: 'Bir kitap okuyorum.' },
    { word: 'Ev', meaning: 'Uy', example: 'Bu benim evim.' },
    { word: 'Güneş', meaning: 'Quyosh', example: 'Güneş parlıyor.' },
    { word: 'Ay', meaning: 'Oy', example: 'Bu gece ay çok güzel.' },
  ],
  uzbek: [
    { word: "Assalomu alaykum", meaning: 'Salom', example: "Assalomu alaykum, qalaysiz?" },
    { word: 'Rahmat', meaning: 'Rahmat', example: "Ko'p rahmat yordamingiz uchun!" },
    { word: 'Xayr', meaning: 'Xayr', example: 'Xayr, ertaga ko\'rishguncha!' },
    { word: 'Suv', meaning: 'Suv', example: "Suv olsam bo'ladimi?" },
    { word: 'Ovqat', meaning: 'Ovqat', example: "Ovqat juda mazali." },
    { word: "Do'st", meaning: "Do'st", example: "U mening eng yaxshi do'stim." },
    { word: 'Kitob', meaning: 'Kitob', example: 'Men kitob o\'qiyapman.' },
    { word: 'Uy', meaning: 'Uy', example: "Bu mening uyim." },
    { word: 'Quyosh', meaning: 'Quyosh', example: 'Quyosh nurlanyapti.' },
    { word: 'Oy', meaning: 'Oy', example: "Bugun kechasi oy go'zal." },
  ],
};

// Gap bloklari — SentenceBuilder uchun
const SENTENCES = {
  english: [
    { words: ['I', 'am', 'a', 'student'], translation: 'Men talabaman', difficulty: 'beginner' },
    { words: ['She', 'is', 'very', 'beautiful'], translation: "U juda go'zal", difficulty: 'beginner' },
    { words: ['We', 'go', 'to', 'school', 'every', 'day'], translation: 'Biz har kuni maktabga boramiz', difficulty: 'beginner' },
    { words: ['The', 'cat', 'is', 'sleeping', 'on', 'the', 'sofa'], translation: 'Mushuk divanda yotibdi', difficulty: 'intermediate' },
    { words: ['I', 'would', 'like', 'to', 'order', 'some', 'tea'], translation: 'Men choy buyurmoqchiman', difficulty: 'intermediate' },
    { words: ['He', 'does', 'not', 'speak', 'English', 'very', 'well'], translation: "U yaxshi inglizcha gapirmaydi", difficulty: 'intermediate' },
    { words: ['The', 'weather', 'is', 'very', 'nice', 'today'], translation: "Bugun ob-havo juda yoqimli", difficulty: 'beginner' },
    { words: ['Can', 'you', 'help', 'me', 'please'], translation: "Menga yordam bera olasizmi", difficulty: 'beginner' },
    { words: ['My', 'family', 'lives', 'in', 'Tashkent'], translation: "Mening oilam Toshkentda yashaydi", difficulty: 'intermediate' },
    { words: ['I', 'want', 'to', 'learn', 'new', 'languages'], translation: "Men yangi tillarni o'rganmoqchiman", difficulty: 'intermediate' },
  ],
  spanish: [
    { words: ['Yo', 'soy', 'un', 'estudiante'], translation: 'Men talabaman', difficulty: 'beginner' },
    { words: ['Ella', 'es', 'muy', 'bonita'], translation: "U juda go'zal", difficulty: 'beginner' },
    { words: ['Nosotros', 'vamos', 'a', 'la', 'escuela', 'todos', 'los', 'días'], translation: 'Biz har kuni maktabga boramiz', difficulty: 'intermediate' },
    { words: ['El', 'gato', 'está', 'durmiendo'], translation: 'Mushuk yotibdi', difficulty: 'beginner' },
    { words: ['¿Puedes', 'ayudarme', 'por', 'favor'], translation: "Menga yordam bera olasizmi", difficulty: 'beginner' },
  ],
  french: [
    { words: ['Je', 'suis', 'un', 'étudiant'], translation: 'Men talabaman', difficulty: 'beginner' },
    { words: ['Elle', 'est', 'très', 'belle'], translation: "U juda go'zal", difficulty: 'beginner' },
    { words: ['Nous', 'allons', 'à', 'l\'école', 'tous', 'les', 'jours'], translation: 'Biz har kuni maktabga boramiz', difficulty: 'intermediate' },
    { words: ['Le', 'chat', 'dort'], translation: 'Mushuk yotibdi', difficulty: 'beginner' },
    { words: ['Pouvez-vous', 'm\'aider', 's\'il', 'vous', 'plaît'], translation: "Menga yordam bera olasizmi", difficulty: 'intermediate' },
  ],
  german: [
    { words: ['Ich', 'bin', 'ein', 'Schüler'], translation: 'Men talabaman', difficulty: 'beginner' },
    { words: ['Sie', 'ist', 'sehr', 'schön'], translation: "U juda go'zal", difficulty: 'beginner' },
    { words: ['Wir', 'gehen', 'jeden', 'Tag', 'in', 'die', 'Schule'], translation: 'Biz har kuni maktabga boramiz', difficulty: 'intermediate' },
    { words: ['Die', 'Katze', 'schläft'], translation: 'Mushuk yotibdi', difficulty: 'beginner' },
  ],
  russian: [
    { words: ['Я', 'ученик'], translation: 'Men talabaman', difficulty: 'beginner' },
    { words: ['Она', 'очень', 'красивая'], translation: "U juda go'zal", difficulty: 'beginner' },
    { words: ['Мы', 'ходим', 'в', 'школу', 'каждый', 'день'], translation: 'Biz har kuni maktabga boramiz', difficulty: 'intermediate' },
    { words: ['Кот', 'спит'], translation: 'Mushuk yotibdi', difficulty: 'beginner' },
  ],
  korean: [
    { words: ['저는', '학생입니다'], translation: 'Men talabaman', difficulty: 'beginner' },
    { words: ['그녀는', '아주', '예쁩니다'], translation: "U juda go'zal", difficulty: 'beginner' },
    { words: ['우리는', '매일', '학교에', '갑니다'], translation: 'Biz har kuni maktabga boramiz', difficulty: 'intermediate' },
    { words: ['고양이가', '잠자고', '있습니다'], translation: 'Mushuk yotibdi', difficulty: 'beginner' },
  ],
  japanese: [
    { words: ['私は', '学生です'], translation: 'Men talabaman', difficulty: 'beginner' },
    { words: ['彼女は', 'とても', '綺麗です'], translation: "U juda go'zal", difficulty: 'beginner' },
    { words: ['私たちは', '毎日', '学校に', '行きます'], translation: 'Biz har kuni maktabga boramiz', difficulty: 'intermediate' },
    { words: ['猫が', '寝ています'], translation: 'Mushuk yotibdi', difficulty: 'beginner' },
  ],
  uzbek: [
    { words: ['Men', 'talabaman'], translation: 'Men talabaman', difficulty: 'beginner' },
    { words: ['U', 'juda', "go'zal"], translation: "U juda go'zal", difficulty: 'beginner' },
    { words: ['Biz', 'har', 'kuni', 'maktabga', 'boramiz'], translation: 'Biz har kuni maktabga boramiz', difficulty: 'intermediate' },
    { words: ['Mushuk', 'yotibdi'], translation: 'Mushuk yotibdi', difficulty: 'beginner' },
  ],
};

// Tasodifiy so'zlar — SpeedTyping uchun
const SPEED_WORDS = {
  english: [
    'hello', 'water', 'beautiful', 'language', 'learning', 'education',
    'knowledge', 'student', 'teacher', 'wonderful', 'adventure', 'challenge',
    'vocabulary', 'practice', 'communication', 'friendly', 'important',
    'opportunity', 'information', 'technology', 'development', 'environment',
    'education', 'motivation', 'concentration', 'imagination', 'celebration',
    'achievement', 'independent', 'conversation', 'experience', 'recommendation',
  ],
  spanish: [
    'hola', 'agua', 'hermoso', 'lenguaje', 'aprendizaje', 'educación',
    'conocimiento', 'estudiante', 'profesor', 'maravilloso', 'aventura',
    'desafío', 'vocabulario', 'práctica', 'comunicación', 'amigable',
    'importante', 'oportunidad', 'información', 'tecnología', 'desarrollo',
    'educación', 'motivación', 'concentración', 'imaginación', 'celebración',
  ],
  french: [
    'bonjour', 'eau', 'beau', 'langue', 'apprentissage', 'éducation',
    'connaissance', 'étudiant', 'professeur', 'merveilleux', 'aventure',
    'défi', 'vocabulaire', 'pratique', 'communication', 'amical',
    'important', 'opportunité', 'information', 'technologie', 'développement',
    'éducation', 'motivation', 'concentration', 'imagination', 'célébration',
  ],
  german: [
    'hallo', 'wasser', 'schön', 'sprache', 'lernen', 'bildung',
    'wissen', 'schüler', 'lehrer', 'wunderbar', 'abenteuer',
    'herausforderung', 'wortschatz', 'übung', 'kommunikation', 'freundlich',
    'wichtig', 'möglichkeit', 'information', 'technologie', 'entwicklung',
    'bildung', 'motivation', 'konzentration', 'vorstellung', 'feier',
  ],
  russian: [
    'привет', 'вода', 'красивый', 'язык', 'обучение', 'образование',
    'знание', 'ученик', 'учитель', 'прекрасный', 'приключение',
    'вызов', 'словарь', 'практика', 'общение', 'дружелюбный',
    'важный', 'возможность', 'информация', 'технология', 'развитие',
  ],
  korean: [
    '안녕', '물', '아름다운', '언어', '학습', '교육',
    '지식', '학생', '선생님', '멋진', '모험', '도전',
  ],
  japanese: [
    'こんにちは', '水', '美しい', '言語', '学習', '教育',
    '知識', '学生', '先生', '素晴らしい', '冒険', '挑戦',
  ],
  chinese: [
    '你好', '水', '美丽', '语言', '学习', '教育',
    '知识', '学生', '老师', '精彩', '冒险', '挑战',
  ],
  uzbek: [
    'salom', 'suv', "go'zal", "til", "o'rganish", "ta'lim",
    'bilim', 'talaba', "o'qituvchi", "ajoyib", 'sarguzasht', 'sinov',
  ],
  turkish: [
    'merhaba', 'su', 'güzel', 'dil', 'öğrenme', 'eğitim',
    'bilgi', 'öğrenci', 'öğretmen', 'harika', 'macera', 'meydan okuma',
  ],
};

export function getWordPairs(langId) {
  return WORD_PAIRS[langId] || WORD_PAIRS.english;
}

export function getSentences(langId) {
  return SENTENCES[langId] || SENTENCES.english;
}

export function getSpeedWords(langId) {
  return SPEED_WORDS[langId] || SPEED_WORDS.english;
}

// Tasodifiy massivni aralashtirish (Fisher-Yates)
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Bir nechta tasodifiy element tanlash
export function pickRandom(arr, count) {
  return shuffle(arr).slice(0, count);
}
