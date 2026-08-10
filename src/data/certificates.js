// ==== SERTIFIKAT TURLARI ====
// Foydalanuvchi turli yutuqlar uchun sertifikat olishi mumkin:
//  - course     — til kursini 100% tugatish (🎓 katta sertifikat)
//  - milestone  — kurs bosqichlari (25% / 50% / 75%)
//  - cefr       — daraja testi (A1, A2, B1, B2)
//  - streak     — ketma-ket o'qish (7 kun, 30 kun)

export const CERT_TYPES = {
  course: {
    id: 'course',
    icon: '🏆',
    title: 'Kursni tugatish',
    color: '#fbbf24',
    desc: 'Til kursini 100% tugatish',
  },
  milestone: {
    id: 'milestone',
    icon: '🌟',
    title: 'Kurs bosqichi',
    color: '#34d399',
    desc: 'Kursning 25% / 50% / 75% bosqichlari',
  },
  cefr: {
    id: 'cefr',
    icon: '🎓',
    title: 'CEFR daraja',
    color: '#818cf8',
    desc: 'Daraja testi natijasi (A1–B2)',
  },
  streak: {
    id: 'streak',
    icon: '🔥',
    title: 'Streak',
    color: '#f97316',
    desc: 'Ketma-ket o\'qish kunlari',
  },
};

export const CERT_TYPES_LIST = Object.values(CERT_TYPES);

// CEFR daraja ma'lumotlari (placement.js bilan mos)
export const CEFR_CERTS = [
  { level: 'A1', label: 'Boshlang\'ich', icon: '🌱' },
  { level: 'A2', label: 'Elementar', icon: '🌿' },
  { level: 'B1', label: 'O\'rta', icon: '🌳' },
  { level: 'B2', label: 'O\'rta yuqori', icon: '🌲' },
];

export const MILESTONES = [25, 50, 75];

export const STREAK_CERTS = [7, 30];
