import { useState, useEffect, useRef } from 'react';
import {
  FaArrowLeft as ArrowLeft, FaBriefcase as Briefcase, FaPhone as Phone,
  FaPaperPlane as Send, FaCode as Code2, FaPalette as Palette, FaGlobe as Globe,
  FaGraduationCap as GraduationCap, FaStar as Star, FaExternalLinkAlt as ExternalLink,
  FaMapMarkerAlt as MapPin, FaRocket as Rocket, FaHeart as Heart, FaBolt as Zap,
  FaCamera as Camera, FaTimes as X, FaChevronLeft as ChevronLeft,
  FaChevronRight as ChevronRight, FaAward as Award, FaTrophy as Trophy,
  FaMedal as Medal, FaLanguage as Language, FaLaptop as Laptop,
  FaLightbulb as Lightbulb, FaUsers as Users, FaTasks as Tasks,
  FaCheckCircle as CheckCircle, FaQuoteRight as QuoteRight,
} from 'react-icons/fa';
import photo1 from '../assets/portfolio/photo1.webp';
import photo2 from '../assets/portfolio/photo2.webp';
import photo3 from '../assets/portfolio/photo3.webp';
import photo4 from '../assets/portfolio/photo4.webp';

// ====================================================================
//  PORTFOLIO MA'LUMOTLARI — shu yerdan o'z ma'lumotlaringizni kiriting
// ====================================================================
const PORTFOLIO = {
  name: 'Akbarshox',
  fullName: "Muhammadjonov Akbarshox",
  initials: 'AK',
  role: 'Yosh Frontend Dasturchi va Onlayn Til Platformasi Asoschisi',
  location: 'Toshkent, O‘zbekiston',
  phone: '+998 97 159 52 36',
  telegram: 'https://t.me/SH9XSH',
  github: 'https://github.com/muhammadjonov978-ops',
  website: 'https://lingohub.uz',
  about: [
    "Men Muhammadjonov Akbarshox — O‘zbekiston, Toshkent shahridan bo‘lgan yosh dasturchiman. Hozir 12 yoshdaman, lekin bu yoshimga qaramay, IT sohasida jiddiy tajribaga ega bo‘ldim. Dasturlashga bo‘lgan qiziqishim menga 100 ga yaqin startap va loyiha saytlarini yaratish imkonini berdi.",
    "Hozirda dasturlash kursining 12-oyini o‘qiyapman va har kuni yangi texnologiyalarni o‘rganishda davom etaman. Asosiy yo‘nalishim — frontend dasturlash: React, JavaScript, HTML/CSS va zamonaviy toolinglar bilan ishlash.",
    "Eng katta loyiham — Lingohub. Bu 130+ tilda interaktiv til o‘rganish platformasi bo‘lib, unda reading, listening, writing va speaking mashqlari, AI-tutor, yutuqlar, statistika va boshqa ko‘plab funksiyalar mavjud. Platformani butunlay o‘zim yaratganman — g‘oyadan tortib, dizayn, dasturlash va joylashgacha.",
    "Men oddiy sayt yasab qo‘yadigan dasturchi emasman. Men muammoni tushunib, foydalanuvchiga qulay va chiroyli yechim taklif qiladigan dasturchiman. Har bir loyihada nafaqat texnik sifat, balki dizayn va foydalanuvchi tajribasiga ham katta e'tibor beraman.",
    "Kelajakdagi maqsadim — o‘z IT-kompaniyamni ochish va O‘zbekistondagi yoshlarga dasturlashni o‘rgatish. Men ishonamanki, har qanday yoshdagi inson qattiq mehnat va qiziqish bilan katta natijalarga erisha oladi.",
  ],
  highlights: [
    "100+ yaratilgan startap va loyiha saytlari",
    "130+ tillik Lingohub platformasi asoschisi",
    "Dasturlash kursining 12-oyi bitiruvchisi",
    "Frontend: React, JavaScript, HTML/CSS, Vite",
    "UI/UX dizayn va performance optimizatsiya",
    "Firebase va backend integratsiyalari bilan tajriba",
  ],
  avatar: photo1,
  stats: [
    { icon: Rocket, value: '100+', label: 'Yaratilgan saytlar' },
    { icon: Briefcase, value: '130+', label: 'Til platforma' },
    { icon: GraduationCap, value: '12', label: 'Yosh dasturchi' },
    { icon: Star, value: '100%', label: 'Ishtiyoq va g‘ayrat' },
  ],
  timeline: [
    {
      year: '2024 — Boshlanish',
      title: 'Dasturlashga ilk qadam',
      text: "Dasturlash kursiga yozildim va birinchi HTML/CSS sahifalarimni yaratishni boshladim. Bu davrda asoslarini mustahkam o‘rgandim: semantik HTML, CSS stillar, adaptiv (responsive) dizayn.",
    },
    {
      year: '2024 — Birinchi loyihalar',
      title: 'Ilk startap saytlari',
      text: "Birinchi haqiqiy loyihalarim paydo bo‘ldi. Bir nechta kichik biznes va shaxsiy saytlarni yaratdim, JavaScript orqali sahifalarga interaktivlik qo‘shishni o‘rgandim.",
    },
    {
      year: '2025 — Katta sakrash',
      title: 'React va zamonaviy texnologiyalar',
      text: "React, Vite va zamonaviy toolinglarga o‘tdim. Komponentli arxitektura, state boshqaruvi va API integratsiyalarini o‘zlashtirdim. Loyihalarim soni 50 taga yetdi.",
    },
    {
      year: '2026 — Lingohub',
      title: '130+ tillik platforma yaratildi',
      text: "Eng yirik loyiham — Lingohub ishga tushdi. 130+ tilda interaktiv til o‘rganish, AI-tutor, yutuqlar, statistika va ko‘plab funksiyalar. Platformani butunlay o‘zim loyihaladim va dasturladim.",
    },
    {
      year: '2026 — Bugun',
      title: 'Kursning 12-oyi va davom etayotgan rivojlanish',
      text: "Dasturlash kursining 12-oyini o‘qishni davom ettiryapman. Har kuni yangi narsa o‘rganaman va portfolio to‘playman. Keyingi maqsad — o‘z IT-kompaniyamni ochish.",
    },
  ],
  achievements: [
    { icon: Award, title: '100+ loyiha', text: 'Yuzdan ortiq startap va loyiha saytlari yaratilgan' },
    { icon: Trophy, title: 'Lingohub asoschisi', text: '130+ tilda ishlaydigan to‘liq platforma yaratgan' },
    { icon: Medal, title: 'Kurs bitiruvchisi', text: 'Dasturlash kursining 12-oyi (eng yuqori bosqich)' },
    { icon: Users, title: 'Minglab foydalanuvchi', text: 'Lingohub orqali til o‘rganayotganlar soni oshmoqda' },
  ],
  photos: [
    {
      src: photo1,
      alt: 'Ochiq osmon ostida ko‘chada — yorqin kayfiyatdagi surat',
      caption: 'Yorqin kun — ko‘chada',
      tag: 'Hayotim',
    },
    {
      src: photo2,
      alt: 'Tog‘li manzara fonida suratga tushganman',
      caption: 'Tog‘lar bag‘rida',
      tag: 'Sayohat',
    },
    {
      src: photo3,
      alt: 'Hovlida divanda o‘tirib, telefonda suratga qarayapman',
      caption: 'Hovlida — dam olish daqiqalari',
      tag: 'Hayotim',
    },
    {
      src: photo4,
      alt: 'Kechqurun shahar ko‘chasida surat',
      caption: 'Shahar kechasi',
      tag: 'Kecha',
    },
  ],
  skills: [
    { icon: Code2, name: 'React / JavaScript', level: 90 },
    { icon: Code2, name: 'HTML5 / CSS3', level: 95 },
    { icon: Code2, name: 'Vite / Modern tooling', level: 85 },
    { icon: Palette, name: 'UI/UX Dizayn', level: 80 },
    { icon: Globe, name: 'Firebase / Backend integratsiya', level: 75 },
    { icon: Zap, name: 'Performance optimizatsiya', level: 85 },
  ],
  projects: [
    {
      title: 'Lingohub',
      desc: "130+ tilda interaktiv o'rganish platformasi — reading, listening, writing va speaking mashqlari, AI-tutor, yutuqlar, statistika, streak kalendar va ko'plab funksiyalar. Sayt butunlay o'zim tomonimdan yaratilgan: dizayn, dasturlash, backend va SEO.",
      tags: ['React', 'Vite', 'Firebase', 'AI', 'SEO'],
      featured: true,
      url: 'https://lingohub.uz',
    },
    {
      title: 'Startap saytlar',
      desc: "Kichik bizneslar, tadbirkorlar va startaplar uchun 100 dan ortiq saytlar yaratilgan. Har bir loyihada zamonaviy dizayn, adaptivlik va tezkor yuklanishga e'tibor beriladi.",
      tags: ['HTML', 'CSS', 'JavaScript', 'React'],
    },
    {
      title: 'Til o‘rganish interaktiv modullar',
      desc: "Lingohub doirasida 130+ til uchun alifbo, reading, listening, writing va speaking modullari. Har bir modul o'yinlashtirilgan va foydalanuvchini motivatsiya qiladigan tizimga ega.",
      tags: ['React', 'Audio', 'AI', 'Gamification'],
    },
  ],
  languages: [
    { name: 'O‘zbek tili', level: 'Ona tili', percent: 100 },
    { name: 'Rus tili', level: 'Yaxshi daraja', percent: 75 },
    { name: 'Ingliz tili', level: 'O‘rganilmoqda', percent: 60 },
  ],
  services: [
    {
      icon: Laptop,
      title: 'Veb-sayt yaratish',
      text: "Biznes, shaxsiy yoki startap uchun zamonaviy, tezkor va chiroyli saytlar. React va zamonaviy texnologiyalar asosida.",
    },
    {
      icon: Lightbulb,
      title: 'UI/UX dizayn',
      text: "Foydalanuvchiga qulay, zamonaviy va estetik dizaynlar. Interfeys nafaqat chiroyli, balki qulay bo'lishi kerak.",
    },
    {
      icon: Tasks,
      title: 'Interaktiv platformalar',
      text: "Til o'rganish, ta'lim va o'yinlashtirilgan platformalar. AI-integrasiyalar va real vaqt rejimidagi funksiyalar bilan.",
    },
  ],
  quote: "Yosh bo'lish — to'siq emas, imkoniyat. Men 12 yoshda yuzdan ortiq sayt yaratdim. Siz ham boshlang!",
};

export default function PortfolioPage() {
  const [lightbox, setLightbox] = useState(null);
  const closeBtnRef = useRef(null);

  const openPhoto = (i) => setLightbox(i);
  const closeLightbox = () => setLightbox(null);
  const prevPhoto = (e) => {
    e?.stopPropagation();
    setLightbox((i) => (i === 0 ? PORTFOLIO.photos.length - 1 : i - 1));
  };
  const nextPhoto = (e) => {
    e?.stopPropagation();
    setLightbox((i) => (i === PORTFOLIO.photos.length - 1 ? 0 : i + 1));
  };

  // Lightbox ochiqligida keyboard boshqaruvi + body scroll lock
  useEffect(() => {
    if (lightbox === null) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') prevPhoto();
      else if (e.key === 'ArrowRight') nextPhoto();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    closeBtnRef.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightbox]);

  return (
    <article className="min-h-full pb-16">
      {/* HERO */}
      <header className="relative overflow-hidden bg-gradient-to-br from-base-200 via-base-100 to-base-200">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-16 left-10 text-6xl animate-float">💼</div>
          <div className="absolute top-32 right-16 text-5xl animate-float" style={{ animationDelay: '1s' }}>🚀</div>
          <div className="absolute bottom-32 left-1/4 text-4xl animate-float" style={{ animationDelay: '2s' }}>⚡</div>
          <div className="absolute bottom-16 right-1/4 text-5xl animate-float" style={{ animationDelay: '0.5s' }}>✨</div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-14 md:py-20">
          {/* Back home */}
          <button
            onClick={() => { window.location.hash = '#/'; }}
            className="btn btn-ghost btn-sm gap-1.5 mb-8 opacity-80 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" /> Bosh sahifaga qaytish
          </button>

          <div className="flex flex-col items-center text-center animate-[fadeInUp_0.5s_ease-out]">
            {/* Avatar */}
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-secondary blur-lg opacity-40 scale-110" />
              <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-primary to-secondary p-1 shadow-lg shadow-primary/20">
                <img
                  src={PORTFOLIO.avatar}
                  alt={PORTFOLIO.fullName}
                  className="w-full h-full rounded-full object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-base-100 border-2 border-base-200 flex items-center justify-center animate-[bounceIn_0.6s_ease-out]">
                <Heart className="w-4 h-4 text-error" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
              <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
                {PORTFOLIO.name}
              </span>
            </h1>
            <p className="text-lg md:text-xl opacity-70 font-medium mb-3">{PORTFOLIO.role}</p>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              <span className="badge badge-ghost gap-1">
                <MapPin className="w-3.5 h-3.5" /> {PORTFOLIO.location}
              </span>
              <span className="badge badge-primary gap-1">
                <Briefcase className="w-3.5 h-3.5" /> Portfolio
              </span>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={`tel:${PORTFOLIO.phone.replace(/\s/g, '')}`}
                className="btn btn-primary gap-2 btn-wave"
              >
                <Phone className="w-4 h-4" /> Bog‘lanish
              </a>
              <a
                href={PORTFOLIO.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost gap-2 border border-base-300 hover:border-primary/50 transition-colors"
              >
                <Send className="w-4 h-4" /> Telegram
              </a>
              <a
                href={PORTFOLIO.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost gap-2 border border-base-300 hover:border-primary/50 transition-colors"
              >
                <Code2 className="w-4 h-4" /> GitHub
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12">
            {PORTFOLIO.stats.map((s, i) => (
              <div
                key={s.label}
                className="card bg-base-100 border border-base-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 animate-[fadeIn_0.5s_ease-out]"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="card-body items-center text-center p-5">
                  <s.icon className="w-5 h-5 text-primary mb-1" />
                  <p className="text-2xl font-extrabold">{s.value}</p>
                  <p className="text-xs opacity-60">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ABOUT — katta matnli bo'lim */}
      <section aria-labelledby="about-title" className="max-w-5xl mx-auto px-4 py-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <h2 id="about-title" className="text-2xl font-extrabold">Men haqimda — to‘liq hikoyam</h2>
        </div>
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-6 md:p-10">
            <div className="space-y-5">
              {PORTFOLIO.about.map((p, i) => (
                <p key={i} className="opacity-80 leading-relaxed text-[15px]">{p}</p>
              ))}
            </div>

            {/* Asosiy ma'lumotlar ro'yxati */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
              {PORTFOLIO.highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl bg-base-200/60 border border-base-300/70 p-4 hover:border-primary/40 hover:bg-base-200 transition-colors"
                >
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm opacity-80">{h}</p>
                </div>
              ))}
            </div>

            {/* Iqtibos */}
            <blockquote className="mt-8 relative rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/25 p-6">
              <QuoteRight className="absolute top-4 right-4 w-6 h-6 text-primary/30" />
              <p className="text-lg md:text-xl italic font-medium leading-relaxed">
                “{PORTFOLIO.quote}”
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      {/* TIMELINE — yo'l xaritasi */}
      <section aria-labelledby="timeline-title" className="bg-base-300/30 py-14">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-info" />
            </div>
            <h2 id="timeline-title" className="text-2xl font-extrabold">Rivojlanish yo‘lim (Timeline)</h2>
          </div>
          <ol className="relative border-l-2 border-base-300 ml-4 space-y-8">
            {PORTFOLIO.timeline.map((t, i) => (
              <li key={i} className="relative pl-8">
                <span className="absolute -left-[10px] top-1 w-4 h-4 rounded-full bg-gradient-to-br from-primary to-secondary ring-4 ring-base-300" />
                <div className="card bg-base-100 border border-base-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <div className="card-body p-5 md:p-6">
                    <span className="badge badge-primary badge-sm font-semibold w-fit">{t.year}</span>
                    <h3 className="font-extrabold text-lg mt-2">{t.title}</h3>
                    <p className="text-sm opacity-70 leading-relaxed">{t.text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section aria-labelledby="achievements-title" className="max-w-5xl mx-auto px-4 py-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-warning" />
          </div>
          <h2 id="achievements-title" className="text-2xl font-extrabold">Yutuqlarim</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PORTFOLIO.achievements.map((a, i) => (
            <div
              key={a.title}
              className="card bg-base-100 border border-base-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group text-center"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="card-body items-center p-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-warning/20 to-primary/20 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <a.icon className="w-6 h-6 text-warning" />
                </div>
                <h3 className="font-extrabold">{a.title}</h3>
                <p className="text-xs opacity-60 leading-relaxed">{a.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LANGUAGES — tillar */}
      <section aria-labelledby="languages-title" className="bg-base-300/30 py-14">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Language className="w-5 h-5 text-secondary" />
            </div>
            <h2 id="languages-title" className="text-2xl font-extrabold">Men biladigan tillar</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PORTFOLIO.languages.map((l, i) => (
              <div
                key={l.name}
                className="card bg-base-100 border border-base-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="card-body p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold">{l.name}</p>
                    <span className="badge badge-ghost badge-sm">{l.level}</span>
                  </div>
                  <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-secondary to-primary transition-all duration-700"
                      style={{ width: `${l.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section aria-labelledby="gallery-title" className="max-w-5xl mx-auto px-4 pb-14 pt-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Camera className="w-5 h-5 text-primary" />
          </div>
          <h2 id="gallery-title" className="text-2xl font-extrabold">Fotogalereya</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {PORTFOLIO.photos.map((p, i) => (
            <button
              key={p.src}
              onClick={() => openPhoto(i)}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] border border-base-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 animate-[fadeIn_0.5s_ease-out] cursor-zoom-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <img
                src={p.src}
                alt={p.alt}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 md:opacity-0 max-md:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-left translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100 transition-all duration-300">
                <span className="badge badge-sm bg-primary/90 border-none text-primary-content mb-1.5">{p.tag}</span>
                <p className="text-white text-xs font-semibold leading-snug drop-shadow">{p.caption}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* LIGHTBOX */}
      {lightbox !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={PORTFOLIO.photos[lightbox].caption}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={closeLightbox}
        >
          <button
            ref={closeBtnRef}
            onClick={closeLightbox}
            className="absolute top-4 right-4 btn btn-circle btn-ghost text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Yopish (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={prevPhoto}
            className="absolute left-2 md:left-6 btn btn-circle btn-ghost text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Oldingi rasm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <figure
            className="max-w-2xl w-full max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={PORTFOLIO.photos[lightbox].src}
              alt={PORTFOLIO.photos[lightbox].alt}
              className="max-w-full max-h-[75vh] rounded-xl object-contain shadow-2xl"
            />
            <figcaption className="mt-4 text-white/80 text-sm text-center flex items-center gap-2">
              <span className="badge badge-sm bg-primary/90 border-none text-primary-content">
                {PORTFOLIO.photos[lightbox].tag}
              </span>
              {PORTFOLIO.photos[lightbox].caption}
              <span className="opacity-50 ml-2">
                {lightbox + 1} / {PORTFOLIO.photos.length}
              </span>
            </figcaption>
          </figure>
          <button
            onClick={nextPhoto}
            className="absolute right-2 md:right-6 btn btn-circle btn-ghost text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Keyingi rasm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* SKILLS */}
      <section aria-labelledby="skills-title" className="max-w-5xl mx-auto px-4 pb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-secondary" />
          </div>
          <h2 id="skills-title" className="text-2xl font-extrabold">Ko‘nikmalar</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PORTFOLIO.skills.map((s, i) => (
            <div
              key={s.name}
              className="card bg-base-100 border border-base-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="card-body p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <s.icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="font-bold text-sm">{s.name}</p>
                </div>
                <div className="w-full h-1.5 bg-base-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
                    style={{ width: `${s.level}%` }}
                  />
                </div>
                <p className="text-xs opacity-50 mt-1.5">{s.level}%</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES — xizmatlar */}
      <section aria-labelledby="services-title" className="bg-base-300/30 py-14">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-accent" />
            </div>
            <h2 id="services-title" className="text-2xl font-extrabold">Nima qilib beraman</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PORTFOLIO.services.map((s, i) => (
              <div
                key={s.title}
                className="card bg-base-100 border border-base-300 hover:border-primary/50 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="card-body p-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <s.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-extrabold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm opacity-70 leading-relaxed">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section aria-labelledby="projects-title" className="max-w-5xl mx-auto px-4 py-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-warning" />
          </div>
          <h2 id="projects-title" className="text-2xl font-extrabold">Loyihalarim</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PORTFOLIO.projects.map((p, i) => (
            <div
              key={p.title}
              className="card bg-base-100 border border-base-300 hover:border-primary/50 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group overflow-hidden"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {p.featured && (
                <div className="bg-gradient-to-r from-primary to-secondary text-primary-content text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 flex items-center gap-1.5">
                  <Star className="w-3 h-3" /> Asosiy loyiha
                </div>
              )}
              <div className="card-body p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-extrabold text-lg">{p.title}</h3>
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 transition-all text-primary hover:scale-110"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-xs opacity-60 leading-relaxed mb-4">{p.desc}</p>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {p.tags.map((t) => (
                    <span key={t} className="badge badge-ghost badge-sm text-[10px]">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT CTA */}
      <section aria-labelledby="contact-title" className="max-w-5xl mx-auto px-4 pb-4">
        <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-xl shadow-primary/20">
          <div className="card-body items-center text-center p-8 md:p-10">
            <h2 id="contact-title" className="text-2xl md:text-3xl font-extrabold mb-2">Loyiha haqida fikr bildiring</h2>
            <p className="opacity-80 mb-6 max-w-md">
              Hamkorlik, savol yoki takliflaringiz bo‘lsa — bemalol yozing, albatta javob beraman!
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href={`tel:${PORTFOLIO.phone.replace(/\s/g, '')}`} className="btn btn-base-100 gap-2">
                <Phone className="w-4 h-4" /> {PORTFOLIO.phone}
              </a>
              <a
                href={PORTFOLIO.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-base-content gap-2"
              >
                <Send className="w-4 h-4" /> Telegram
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center pt-10">
        <p className="text-xs opacity-40">
          © 2026 {PORTFOLIO.fullName} · Portfolio · Lingohub bilan yaratildi 💛
        </p>
      </footer>
    </article>
  );
}
