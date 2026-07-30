export interface Language {
  id: string;
  name: string;
  flag: string;
  color: string;
  description: string;
  totalLearners: number;
}

export interface Level {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  isPremium: boolean;
  passThreshold: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number;
}

export interface ReadingExercise {
  id: string;
  title: string;
  passage: string;
  questions: Question[];
}

export interface ListeningWordExercise {
  id: string;
  title: string;
  words: string[];
}

export interface ListeningSentenceExercise {
  id: string;
  title: string;
  sentences: string[];
}

export interface WritingPromptExercise {
  id: string;
  title: string;
  prompt: string;
  requirements: WritingRequirements;
}

export interface WritingErrorExercise {
  id: string;
  title: string;
  text: string;
  errors: WritingError[];
}

export interface WritingRequirements {
  minWords: number;
  maxWords: number;
  grammarCheck: boolean;
}

export interface WritingError {
  word: string;
  correction: string;
  explanation: string;
}

export interface SpeakingWordExercise {
  id: string;
  title: string;
  words: string[];
}

export interface SpeakingSentenceExercise {
  id: string;
  title: string;
  sentences: string[];
}

export interface SkillExercises {
  reading: ReadingExercise[];
  listening: (ListeningWordExercise | ListeningSentenceExercise)[];
  writing: (WritingPromptExercise | WritingErrorExercise)[];
  speaking: (SpeakingWordExercise | SpeakingSentenceExercise)[];
}

export interface LanguageData extends Level {
  exercises: SkillExercises;
}

export const languages: Language[] = [
  {
    id: 'english',
    name: 'English',
    flag: '🇬🇧',
    color: 'primary',
    description: "Global communication tili",
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
    description: "Musiqa va taom tili",
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

export const levels: Level[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    code: 'A1',
    description: "Boshlang'ich daraja. Asosiy so'z va iboralar.",
    icon: '🌱',
    isPremium: false,
    passThreshold: 80,
  },
  {
    id: 'elementary',
    name: 'Elementary',
    code: 'A2',
    description: 'Oddiy gaplar va kundalik mavzular.',
    icon: '🌿',
    isPremium: false,
    passThreshold: 80,
  },
  {
    id: 'pre-intermediate',
    name: 'Pre-Intermediate',
    code: 'B1',
    description: "Murakkabroq mavzular va fikr bildirish.",
    icon: '🌳',
    isPremium: false,
    passThreshold: 80,
  },
  {
    id: 'advanced',
    name: 'Advanced',
    code: 'B2-C1',
    description: 'Professional daraja. Erkin va aniq nutq.',
    icon: '👑',
    isPremium: true,
    passThreshold: 80,
  },
];

function generateExercises(langId: string, levelId: string): SkillExercises {
  const readingExercises: ReadingExercise[] = [
    {
      id: `${langId}-${levelId}-reading-1`,
      title: "Matnni o'qish va tushunish",
      passage: getPassage(langId, levelId),
      questions: getComprehensionQuestions(langId, levelId),
    },
    {
      id: `${langId}-${levelId}-reading-2`,
      title: "Asosiy g'oyani topish",
      passage: getPassage(langId, levelId, true),
      questions: getComprehensionQuestions(langId, levelId, true),
    },
  ];

  const listeningExercises = [
    {
      id: `${langId}-${levelId}-listening-1`,
      title: "So'zlarni tinglash va yozish",
      words: getListeningWords(langId, levelId),
    },
    {
      id: `${langId}-${levelId}-listening-2`,
      title: 'Gaplarni tinglab tushunish',
      sentences: getListeningSentences(langId, levelId),
    },
  ];

  const writingExercises = [
    {
      id: `${langId}-${levelId}-writing-1`,
      title: 'Mavzuga oid insho yozish',
      prompt: getWritingPrompt(langId, levelId),
      requirements: getWritingRequirements(levelId),
    },
    {
      id: `${langId}-${levelId}-writing-2`,
      title: 'Xatolarni tuzatish',
      text: getWritingErrorText(langId, levelId),
      errors: getWritingErrors(langId, levelId),
    },
  ];

  const speakingExercises = [
    {
      id: `${langId}-${levelId}-speaking-1`,
      title: "So'zlarni talaffuz qilish",
      words: getSpeakingWords(langId, levelId),
    },
    {
      id: `${langId}-${levelId}-speaking-2`,
      title: 'Gaplarni aytish',
      sentences: getSpeakingSentences(langId, levelId),
    },
  ];

  return { reading: readingExercises, listening: listeningExercises, writing: writingExercises, speaking: speakingExercises };
}

function getPassage(langId: string, levelId: string, alt = false): string {
  const passages: Record<string, Record<string, string[]>> = {
    english: {
      beginner: ["Hello! My name is John. I am a student. I study English every day. I like to read books and watch movies. My favorite color is blue. I have a cat and a dog.", "The weather is nice today. The sun is shining. Birds are singing in the trees. I go to the park with my friends. We play football and eat ice cream."],
      elementary: ["Last weekend, my family and I went to the beach. The weather was warm and sunny. We swam in the sea and built sandcastles. My little sister collected shells. In the evening, we ate seafood at a restaurant near the shore.", "Tom works in a hospital. He is a doctor. He helps people every day. His job is hard but he loves it. He wakes up at 6 AM and starts work at 8 AM. He finishes work at 5 PM."],
      'pre-intermediate': ["Climate change is one of the biggest problems facing our planet today. Scientists warn that global temperatures are rising due to greenhouse gas emissions. This causes melting ice caps, rising sea levels, and extreme weather events. Many governments are now working together to find solutions.", "Social media has changed the way we communicate. People can now connect with friends and family across the world instantly. However, there are also negative effects. Some studies show that too much social media can lead to anxiety and depression."],
      advanced: ["The rapid advancement of artificial intelligence presents both unprecedented opportunities and significant ethical challenges for humanity. As machine learning algorithms become increasingly sophisticated, questions about privacy, employment, and the very nature of consciousness demand our attention. Society must carefully consider the implications of delegating decision-making to autonomous systems.", "Quantum computing represents a paradigm shift in computational capability. Unlike classical computers that use bits, quantum computers utilize qubits, which can exist in multiple states simultaneously through superposition. This property, combined with quantum entanglement, enables these systems to solve certain problems exponentially faster than their classical counterparts."],
    },
    spanish: {
      beginner: ["¡Hola! Me llamo María. Soy estudiante. Estudio español cada día. Me gusta leer libros y escuchar música. Mi color favorito es el rojo.", "Hoy hace buen tiempo. El sol brilla. Los pájaros cantan en los árboles. Voy al parque con mis amigos. Jugamos al fútbol y comemos helado."],
      elementary: ["El fin de semana pasado, mi familia y yo fuimos a la playa. El clima era cálido y soleado. Nadamos en el mar y construimos castillos de arena.", "Pedro trabaja en un hospital. Él es médico. Ayuda a las personas cada día. Su trabajo es difícil pero le encanta."],
      'pre-intermediate': ["El cambio climático es uno de los problemas más grandes que enfrenta nuestro planeta hoy. Los científicos advierten que las temperaturas globales están aumentando.", "Las redes sociales han cambiado la forma en que nos comunicamos. Las personas pueden conectarse con amigos y familiares en todo el mundo instantáneamente."],
      advanced: ["El rápido avance de la inteligencia artificial presenta oportunidades sin precedentes y desafíos éticos significativos para la humanidad. Los algoritmos de aprendizaje automático son cada vez más sofisticados."],
    },
    french: {
      beginner: ["Bonjour ! Je m'appelle Sophie. Je suis étudiante. J'apprends le français chaque jour. J'aime lire des livres et regarder des films.", "Aujourd'hui, il fait beau. Le soleil brille. Les oiseaux chantent dans les arbres. Je vais au parc avec mes amis."],
      elementary: ["Le week-end dernier, ma famille et moi sommes allés à la plage. Il faisait chaud et ensoleillé. Nous avons nagé dans la mer.", "Pierre travaille dans un hôpital. Il est médecin. Il aide les gens tous les jours."],
      'pre-intermediate': ["Le changement climatique est l'un des plus grands problèmes auxquels notre planète est confrontée aujourd'hui. Les scientifiques préviennent que les températures mondiales augmentent."],
      advanced: ["L'avancement rapide de l'intelligence artificielle présente des opportunités sans précédent et des défis éthiques importants pour l'humanité. Les algorithmes d'apprentissage automatique deviennent de plus en plus sophistiqués."],
    },
    german: {
      beginner: ["Hallo! Ich heiße Lukas. Ich bin Student. Ich lerne jeden Tag Deutsch. Ich lese gerne Bücher und sehe Filme. Meine Lieblingsfarbe ist Blau.", "Heute ist das Wetter schön. Die Sonne scheint. Die Vögel singen in den Bäumen. Ich gehe mit meinen Freunden in den Park."],
      elementary: ["Letztes Wochenende bin ich mit meiner Familie an den Strand gefahren. Das Wetter war warm und sonnig. Wir sind im Meer geschwommen.", "Anna arbeitet in einem Krankenhaus. Sie ist Ärztin. Sie hilft jeden Tag Menschen."],
      'pre-intermediate': ["Der Klimawandel ist eines der größten Probleme unseres Planeten. Wissenschaftler warnen, dass die globalen Temperaturen steigen."],
      advanced: ["Der schnelle Fortschritt der künstlichen Intelligenz bietet beispiellose Chancen und bedeutende ethische Herausforderungen für die Menschheit."],
    },
    italian: {
      beginner: ["Ciao! Mi chiamo Marco. Sono studente. Studio italiano ogni giorno. Mi piace leggere libri e guardare film. Il mio colore preferito è il blu.", "Oggi il tempo è bello. Il sole splende. Gli uccelli cantano sugli alberi. Vado al parco con i miei amici."],
      elementary: ["Lo scorso fine settimana, io e la mia famiglia siamo andati al mare. Il tempo era caldo e soleggiato. Abbiamo nuotato nel mare.", "Luigi lavora in un ospedale. Lui è un medico. Aiuta le persone ogni giorno."],
      'pre-intermediate': ["Il cambiamento climatico è uno dei più grandi problemi che il nostro pianeta affronta oggi. Gli scienziati avvertono che le temperature globali stanno aumentando."],
      advanced: ["Il rapido progresso dell'intelligenza artificiale presenta opportunità senza precedenti e significative sfide etiche per l'umanità."],
    },
    portuguese: {
      beginner: ["Olá! Meu nome é Ana. Sou estudante. Estudo português todos os dias. Gosto de ler livros e assistir filmes.", "Hoje o tempo está bom. O sol brilha. Os pássaros cantam nas árvores. Vou ao parque com meus amigos."],
      elementary: ["No fim de semana passado, minha família e eu fomos à praia. O tempo estava quente e ensolarado. Nadamos no mar.", "Carlos trabalha em um hospital. Ele é médico. Ajuda as pessoas todos os dias."],
      'pre-intermediate': ["A mudança climática é um dos maiores problemas que nosso planeta enfrenta hoje. Os cientistas alertam que as temperaturas globais estão aumentando."],
      advanced: ["O rápido avanço da inteligência artificial apresenta oportunidades sem precedentes e desafios éticos significativos para a humanidade."],
    },
    russian: {
      beginner: ["Привет! Меня зовут Анна. Я студентка. Я учу русский каждый день. Я люблю читать книги и смотреть фильмы.", "Сегодня хорошая погода. Солнце светит. Птицы поют на деревьях. Я иду в парк с друзьями."],
      elementary: ["В прошлые выходные мы с семьёй ездили на пляж. Погода была тёплая и солнечная. Мы купались в море.", "Иван работает в больнице. Он врач. Он помогает людям каждый день."],
      'pre-intermediate': ["Изменение климата — одна из самых больших проблем, стоящих перед нашей планетой сегодня. Учёные предупреждают, что глобальная температура повышается."],
      advanced: ["Быстрый прогресс искусственного интеллекта открывает беспрецедентные возможности и создаёт значительные этические проблемы для человечества."],
    },
  };
  const level = passages[langId]?.[levelId];
  if (!level) return 'Sample text for learning.';
  return alt && level[1] ? level[1] : level[0];
}

function getComprehensionQuestions(langId: string, levelId: string, alt = false): Question[] {
  const q: Question[] = [
    { id: 'q1', question: "Matnning asosiy mavzusi nima?", options: ['Tabiat', "Kundalik hayot", 'Texnologiya', 'Sport'], correct: 1 },
    { id: 'q2', question: "Bu matnda nechta qahramon haqida so'z bor?", options: ['1 ta', '2 ta', '3 ta', '4 ta'], correct: 0 },
    { id: 'q3', question: "Matn qanday ohangda yozilgan?", options: ["Qayg'uli", 'Neytral/ijobiy', 'Jahldor', 'Rasmiy'], correct: 1 },
    { id: 'q4', question: "Quyidagilardan qaysi biri matnda eslatib o'tilmagan?", options: [alt ? 'Kompyuter' : 'Kitoblar', "Ob-havo", "Do'stlar", 'Hayvonlar'], correct: 3 },
  ];
  return levelId === 'advanced' ? q.map(qi => ({ ...qi, options: qi.options.map(o => o + '...'), correct: qi.correct })) : q;
}

function getListeningWords(langId: string, levelId: string): string[] {
  const wordSets: Record<string, Record<string, string[]>> = {
    english: {
      beginner: ['hello', 'book', 'water', 'friend', 'school', 'house', 'apple', 'music', 'happy', 'morning'],
      elementary: ['beautiful', 'important', 'yesterday', 'together', 'weather', 'holiday', 'message', 'journey', 'culture', 'language'],
      'pre-intermediate': ['communication', 'environment', 'experience', 'knowledge', 'education', 'government', 'community', 'particular', 'development', 'situation'],
      advanced: ['unprecedented', 'sophisticated', 'consciousness', 'paradigm', 'autonomous', 'quantum', 'algorithm', 'exponentially', 'entanglement', 'implications'],
    },
    spanish: {
      beginner: ['hola', 'agua', 'casa', 'amigo', 'libro', 'música', 'gato', 'sol', 'feliz', 'escuela'],
      elementary: ['importante', 'hermoso', 'familia', 'trabajo', 'ciudad', 'playa', 'comida', 'viaje', 'tiempo', 'persona'],
      'pre-intermediate': ['comunicación', 'experiencia', 'sociedad', 'naturaleza', 'educación', 'gobierno', 'comunidad', 'conocimiento', 'desarrollo', 'situación'],
      advanced: ['inteligencia', 'oportunidad', 'significativo', 'tecnología', 'innovación', 'sostenible', 'transformación', 'investigación', 'competitivo', 'estratégico'],
    },
    french: {
      beginner: ['bonjour', 'livre', 'ami', 'maison', 'école', 'chat', 'soleil', 'musique', 'heureux', 'eau'],
      elementary: ['important', 'familie', 'travail', 'ville', 'plage', 'voyage', 'temps', 'culture', 'langue', 'personne'],
      'pre-intermediate': ['communication', 'environnement', 'expérience', 'éducation', 'gouvernement', 'communauté', 'connaissance', 'développement', 'situation', 'particulier'],
      advanced: ['intelligence', 'opportunité', 'technologie', 'conscience', 'algorithmes', 'autonome', 'éthique', 'transformation', 'innovation', 'stratégique'],
    },
    german: {
      beginner: ['hallo', 'Buch', 'Wasser', 'Freund', 'Schule', 'Haus', 'Katze', 'Musik', 'glücklich', 'Morgen'],
      elementary: ['wichtig', 'schön', 'Familie', 'Arbeit', 'Stadt', 'Strand', 'Reise', 'Kultur', 'Sprache', 'Person'],
      'pre-intermediate': ['Kommunikation', 'Umwelt', 'Erfahrung', 'Bildung', 'Regierung', 'Gemeinschaft', 'Wissen', 'Entwicklung', 'Situation', 'besonders'],
      advanced: ['Künstliche', 'Intelligenz', 'Möglichkeit', 'Technologie', 'Bewusstsein', 'Algorithmus', 'autonom', 'Transformation', 'Innovation', 'strategisch'],
    },
    italian: {
      beginner: ['ciao', 'libro', 'acqua', 'amico', 'casa', 'scuola', 'gatto', 'musica', 'felice', 'sole'],
      elementary: ['importante', 'bello', 'famiglia', 'lavoro', 'città', 'spiaggia', 'viaggio', 'tempo', 'cultura', 'persona'],
      'pre-intermediate': ['comunicazione', 'ambiente', 'esperienza', 'educazione', 'governo', 'comunità', 'conoscenza', 'sviluppo', 'situazione', 'particolare'],
      advanced: ['intelligenza', 'opportunità', 'tecnologia', 'coscienza', 'algoritmo', 'autonomo', 'etico', 'trasformazione', 'innovazione', 'strategico'],
    },
    portuguese: {
      beginner: ['olá', 'livro', 'água', 'amigo', 'casa', 'escola', 'gato', 'música', 'feliz', 'sol'],
      elementary: ['importante', 'bonito', 'família', 'trabalho', 'cidade', 'praia', 'viagem', 'tempo', 'cultura', 'pessoa'],
      'pre-intermediate': ['comunicação', 'ambiente', 'experiência', 'educação', 'governo', 'comunidade', 'conhecimento', 'desenvolvimento', 'situação', 'particular'],
      advanced: ['inteligência', 'oportunidade', 'tecnologia', 'consciência', 'algoritmo', 'autônomo', 'ético', 'transformação', 'inovação', 'estratégico'],
    },
    russian: {
      beginner: ['привет', 'книга', 'вода', 'друг', 'школа', 'дом', 'кошка', 'музыка', 'счастливый', 'утро'],
      elementary: ['важный', 'красивый', 'семья', 'работа', 'город', 'пляж', 'путешествие', 'культура', 'язык', 'человек'],
      'pre-intermediate': ['общение', 'окружающая', 'опыт', 'образование', 'правительство', 'сообщество', 'знание', 'развитие', 'ситуация', 'особенный'],
      advanced: ['искусственный', 'интеллект', 'возможность', 'технология', 'сознание', 'алгоритм', 'автономный', 'этический', 'трансформация', 'инновация'],
    },
  };
  return wordSets[langId]?.[levelId] || wordSets.english[levelId] || [];
}

function getListeningSentences(langId: string, levelId: string): string[] {
  const sets: Record<string, Record<string, string[]>> = {
    english: {
      beginner: ['I like to read books.', 'The cat is sleeping.', 'We go to school.', 'She has a red apple.', 'They are happy today.'],
      elementary: ['Yesterday we went to the park.', 'She is reading an interesting book.', 'They will arrive tomorrow morning.', 'The weather is beautiful today.', 'I have been studying English for two years.'],
      'pre-intermediate': ['The government should invest more in education.', 'Environmental protection is crucial for our future.', 'Communication technology has transformed our daily lives.', 'Many people believe that exercise improves mental health.', 'The conference has been postponed until next month.'],
      advanced: ['The implications of quantum computing extend far beyond traditional computational boundaries.', 'Autonomous systems must be designed with robust ethical frameworks and safety protocols.', 'The paradigm shift in machine learning has enabled unprecedented breakthroughs in natural language processing.', 'Consciousness and artificial intelligence remain one of the most profound philosophical questions of our time.'],
    },
  };
  const langSet = sets[langId] || sets.english;
  return langSet[levelId] || langSet.beginner;
}

function getWritingPrompt(langId: string, levelId: string): string {
  const prompts: Record<string, Record<string, string>> = {
    english: {
      beginner: "O'zingiz haqingizda 5-6 gap yozing. Ismingiz, yoshingiz, qiziqishlaringiz haqida so'zlab bering.",
      elementary: "Oxirgi ta'tilingiz haqida yozing. Qayerga bordingiz? Nima qildingiz? Kim bilan bo'ldingiz? (8-10 gap)",
      'pre-intermediate': '"Internetning ijobiy va salbiy tomonlari" mavzusida insho yozing. Har bir fikringizni misollar bilan isbotlang. (10-15 gap)',
      advanced: '"Technology and Human Connection: A Double-Edged Sword" mavzusida argumentativ insho yozing. O\'z fikringizni ilmiy dalillar bilan asoslang. (20-25 gap)',
    },
  };
  const langPrompt = prompts[langId] || prompts.english;
  return langPrompt[levelId] || langPrompt.beginner;
}

function getWritingRequirements(levelId: string): WritingRequirements {
  const reqs: Record<string, WritingRequirements> = {
    beginner: { minWords: 30, maxWords: 60, grammarCheck: false },
    elementary: { minWords: 60, maxWords: 120, grammarCheck: true },
    'pre-intermediate': { minWords: 120, maxWords: 200, grammarCheck: true },
    advanced: { minWords: 200, maxWords: 400, grammarCheck: true },
  };
  return reqs[levelId] || reqs.beginner;
}

function getWritingErrorText(langId: string, levelId: string): string {
  const texts: Record<string, Record<string, string>> = {
    english: {
      beginner: "I goes to school every day. She dont like apples. They is happy.",
      elementary: "He go to the store yesterday. She don't have any money. We was tired after the trip.",
      'pre-intermediate': "The company have increased their profits last year. People which lives in cities are more likely to develop allergies.",
      advanced: "The data which was collected suggests that there is a correlation between social media usage and decreased attention spans amongst teenagers. However their are several limitations to this study.",
    },
  };
  return texts[langId]?.[levelId] || texts.english[levelId] || texts.english.beginner;
}

function getWritingErrors(langId: string, levelId: string): WritingError[] {
  const errs: Record<string, Record<string, WritingError[]>> = {
    english: {
      beginner: [
        { word: 'goes', correction: 'go', explanation: 'I dan keyin "go" ishlatiladi' },
        { word: 'dont', correction: "don't", explanation: "dont emas, don't yoziladi" },
        { word: 'is', correction: 'are', explanation: 'They bilan "are" ishlatiladi' },
      ],
      elementary: [
        { word: 'go', correction: 'went', explanation: "O'tgan zamon: go -> went" },
        { word: "don't", correction: "doesn't", explanation: 'She bilan "doesn\'t" ishlatiladi' },
        { word: 'was', correction: 'were', explanation: 'We bilan "were" ishlatiladi' },
      ],
      'pre-intermediate': [
        { word: 'have', correction: 'has', explanation: 'Company (singular) bilan "has" ishlatiladi' },
        { word: 'which', correction: 'who', explanation: 'Odamlar uchun "who" ishlatiladi' },
      ],
      advanced: [
        { word: 'which', correction: 'that', explanation: 'Bu kontekstda "that" to\'g\'ri' },
        { word: 'amongst', correction: 'among', explanation: '"Amongst" archaic, "among" zamonaviy' },
        { word: 'their', correction: 'there', explanation: '"Their" egalik, "there" esa joy/borlik' },
      ],
    },
  };
  return errs[langId]?.[levelId] || errs.english[levelId] || errs.english.beginner;
}

function getSpeakingWords(langId: string, levelId: string): string[] {
  const wordSets: Record<string, Record<string, string[]>> = {
    english: {
      beginner: ['hello', 'please', 'thank you', 'water', 'book', 'friend', 'happy', 'school', 'family', 'goodbye'],
      elementary: ['beautiful', 'yesterday', 'tomorrow', 'together', 'holiday', 'delicious', 'important', 'weather', 'journey', 'message'],
      'pre-intermediate': ['communication', 'environment', 'experience', 'knowledge', 'education', 'government', 'community', 'particular', 'development', 'situation'],
      advanced: ['unprecedented', 'sophisticated', 'consciousness', 'paradigm', 'autonomous', 'quantum', 'algorithm', 'exponentially', 'entanglement', 'philosophical'],
    },
    spanish: {
      beginner: ['hola', 'por favor', 'gracias', 'agua', 'libro', 'amigo', 'feliz', 'escuela', 'familia', 'adiós'],
      elementary: ['hermoso', 'ayer', 'mañana', 'juntos', 'vacaciones', 'delicioso', 'importante', 'tiempo', 'viaje', 'mensaje'],
      'pre-intermediate': ['comunicación', 'experiencia', 'conocimiento', 'educación', 'gobierno', 'comunidad', 'naturaleza', 'desarrollo', 'situación', 'sociedad'],
      advanced: ['oportunidad', 'inteligencia', 'tecnología', 'consciencia', 'autónomo', 'transformación', 'innovación', 'investigación', 'estratégico', 'sostenible'],
    },
    french: {
      beginner: ['bonjour', "s'il vous plaît", 'merci', 'eau', 'livre', 'ami', 'heureux', 'école', 'famille', 'au revoir'],
      elementary: ['beau', 'hier', 'demain', 'ensemble', 'vacances', 'délicieux', 'important', 'temps', 'voyage', 'message'],
      'pre-intermediate': ['communication', 'environnement', 'expérience', 'connaissance', 'éducation', 'gouvernement', 'communauté', 'développement', 'situation', 'particulier'],
      advanced: ['intelligence', 'opportunité', 'technologie', 'conscience', 'autonome', 'éthique', 'transformation', 'innovation', 'stratégique', 'algorithmes'],
    },
    german: {
      beginner: ['hallo', 'bitte', 'danke', 'Wasser', 'Buch', 'Freund', 'glücklich', 'Schule', 'Familie', 'Tschüss'],
      elementary: ['schön', 'gestern', 'morgen', 'zusammen', 'Urlaub', 'lecker', 'wichtig', 'Wetter', 'Reise', 'Nachricht'],
      'pre-intermediate': ['Kommunikation', 'Erfahrung', 'Wissen', 'Bildung', 'Regierung', 'Gemeinschaft', 'Umwelt', 'Entwicklung', 'Situation', 'Gesellschaft'],
      advanced: ['Möglichkeit', 'Technologie', 'Bewusstsein', 'autonom', 'ethisch', 'Transformation', 'Innovation', 'strategisch', 'Algorithmus', 'künstlich'],
    },
    italian: {
      beginner: ['ciao', 'per favore', 'grazie', 'acqua', 'libro', 'amico', 'felice', 'scuola', 'famiglia', 'arrivederci'],
      elementary: ['bello', 'ieri', 'domani', 'insieme', 'vacanze', 'delizioso', 'importante', 'tempo', 'viaggio', 'messaggio'],
      'pre-intermediate': ['comunicazione', 'esperienza', 'conoscenza', 'educazione', 'governo', 'comunità', 'natura', 'sviluppo', 'situazione', 'società'],
      advanced: ['opportunità', 'intelligenza', 'tecnologia', 'coscienza', 'autonomo', 'etico', 'trasformazione', 'innovazione', 'strategico', 'sostenibile'],
    },
    portuguese: {
      beginner: ['olá', 'por favor', 'obrigado', 'água', 'livro', 'amigo', 'feliz', 'escola', 'família', 'tchau'],
      elementary: ['bonito', 'ontem', 'amanhã', 'juntos', 'férias', 'delicioso', 'importante', 'tempo', 'viagem', 'mensagem'],
      'pre-intermediate': ['comunicação', 'experiência', 'conhecimento', 'educação', 'governo', 'comunidade', 'natureza', 'desenvolvimento', 'situação', 'sociedade'],
      advanced: ['oportunidade', 'inteligência', 'tecnologia', 'consciência', 'autônomo', 'ético', 'transformação', 'inovação', 'estratégico', 'sustentável'],
    },
    russian: {
      beginner: ['привет', 'пожалуйста', 'спасибо', 'вода', 'книга', 'друг', 'счастливый', 'школа', 'семья', 'до свидания'],
      elementary: ['красивый', 'вчера', 'завтра', 'вместе', 'каникулы', 'вкусный', 'важный', 'погода', 'путешествие', 'сообщение'],
      'pre-intermediate': ['общение', 'опыт', 'знание', 'образование', 'правительство', 'сообщество', 'природа', 'развитие', 'ситуация', 'общество'],
      advanced: ['возможность', 'интеллект', 'технология', 'сознание', 'автономный', 'этический', 'трансформация', 'инновация', 'стратегический', 'устойчивый'],
    },
  };
  return wordSets[langId]?.[levelId] || wordSets.english[levelId] || [];
}

function getSpeakingSentences(langId: string, levelId: string): string[] {
  const sets: Record<string, Record<string, string[]>> = {
    english: {
      beginner: ['Hello, how are you?', 'My name is John.', 'I like to read books.', 'The weather is nice today.', 'I have a cat.'],
      elementary: ['Yesterday I went to the park with my friends.', 'She is reading an interesting book.', 'We will travel to London next summer.', 'What do you like to do in your free time?', 'I have been learning English for two years.'],
      'pre-intermediate': ['I believe that education is the key to success in life.', 'Could you please explain this concept in more detail?', 'Environmental protection should be a priority for every government.', 'Despite the challenges, we managed to complete the project on time.', 'What are your thoughts on the impact of social media on society?'],
      advanced: ['The rapid advancement of artificial intelligence presents both unprecedented opportunities and significant ethical challenges.', 'In my opinion, quantum computing will revolutionize the field of cryptography within the next decade.', 'I would argue that the most pressing issue of our time is the balance between technological progress and environmental sustainability.'],
    },
  };
  const langSet = sets[langId] || sets.english;
  return langSet[levelId] || langSet.beginner;
}

export function getLanguageData(langId: string, levelId: string): LanguageData | null {
  const lang = languages.find(l => l.id === langId);
  const level = levels.find(l => l.id === levelId);
  if (!lang || !level) return null;
  const exercises = generateExercises(langId, levelId);
  return { ...level, exercises };
}

export function getAllExercises(langId: string): Record<string, SkillExercises> {
  return levels.reduce((acc, level) => {
    acc[level.id] = generateExercises(langId, level.id);
    return acc;
  }, {} as Record<string, SkillExercises>);
}
