import {
  ArrowLeft, Briefcase, Phone, Send, Code2, Palette,
  Globe, GraduationCap, Star, ExternalLink, MapPin, Rocket, Heart, Zap,
} from 'lucide-react';

// ====================================================================
//  PORTFOLIO MA'LUMOTLARI — shu yerdan o'z ma'lumotlaringizni kiriting
// ====================================================================
const PORTFOLIO = {
  name: 'Akbarshox',
  initials: 'AK',
  role: 'Yosh Frontend Dasturchi',
  location: 'Toshkent, O\u2018zbekiston',
  phone: '+998 97 159 52 36',
  telegram: 'https://t.me/SH9XSH',
  github: 'https://github.com/muhammadjonov978-ops',
  about: [
    'Men Muhammadjonov Akbarshox. Men 12 yoshdaman va men 100 ga yaqin startap saytlarini qilganman.',
    'Men Dasturlash kursining 12-oyini o\u2018qiyapman.',
  ],
  stats: [
    { icon: Rocket, value: '100+', label: 'Yaratilgan saytlar' },
    { icon: Briefcase, value: '27', label: 'Til platforma' },
    { icon: GraduationCap, value: '12', label: 'Yosh dasturchi' },
    { icon: Star, value: '100%', label: 'Ishtiyoq' },
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
      desc: "27 tilda interaktiv o'rganish platformasi — reading, listening, writing va speaking mashqlari, AI-tutor, yutuqlar va statistika.",
      tags: ['React', 'Vite', 'Firebase', 'AI'],
      featured: true,
      url: 'https://lingohub.uz',
    },
    {
      title: 'Loyiha 2',
      desc: 'Qisqacha loyiha tavsifi — bu karta o\u2018rniga o\u2018z loyihalaringizni yozing.',
      tags: ['React', 'API'],
    },
    {
      title: 'Loyiha 3',
      desc: 'Yana bir loyiha haqida qisqacha ma\u2019lumot — havola va texnologiyalarni qo\u2018shing.',
      tags: ['JavaScript', 'CSS'],
    },
  ],
};

export default function PortfolioPage() {
  return (
    <div className="min-h-full pb-16">
      {/* HERO */}
      <div className="relative overflow-hidden bg-gradient-to-br from-base-200 via-base-100 to-base-200">
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
                <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center text-3xl font-extrabold">
                  <span className="bg-gradient-to-tr from-primary to-secondary bg-clip-text text-transparent">
                    {PORTFOLIO.initials}
                  </span>
                </div>
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
                <Phone className="w-4 h-4" /> Bog\u2018lanish
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
      </div>

      {/* ABOUT */}
      <div className="max-w-5xl mx-auto px-4 py-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-extrabold">Men haqimda</h2>
        </div>
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-6 md:p-8 space-y-3">
            {PORTFOLIO.about.map((p, i) => (
              <p key={i} className="opacity-75 leading-relaxed">{p}</p>
            ))}
          </div>
        </div>
      </div>

      {/* SKILLS */}
      <div className="bg-base-300/30 py-14">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-secondary" />
            </div>
            <h2 className="text-2xl font-extrabold">Ko\u2018nikmalar</h2>
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
        </div>
      </div>

      {/* PROJECTS */}
      <div className="max-w-5xl mx-auto px-4 py-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-warning" />
          </div>
          <h2 className="text-2xl font-extrabold">Loyihalar</h2>
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
      </div>

      {/* CONTACT CTA */}
      <div className="max-w-5xl mx-auto px-4 pb-4">
        <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-xl shadow-primary/20">
          <div className="card-body items-center text-center p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Loyiha haqida fikr bildiring</h2>
            <p className="opacity-80 mb-6 max-w-md">
              Hamkorlik, savol yoki takliflaringiz bo\u2018lsa — bemalol yozing, albatta javob beraman!
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
      </div>

      {/* Footer */}
      <footer className="text-center pt-10">
        <p className="text-xs opacity-40">
          © 2026 {PORTFOLIO.name} · Portfolio · Lingohub bilan yaratildi 💛
        </p>
      </footer>
    </div>
  );
}
