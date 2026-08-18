// ==== FIREBASE REALTIME DATABASE (live visitor counter) + AUTH ====
// Fill these in a .env file (see .env.example) to enable REAL cross-device
// live counting + REAL Google sign-in + email/password accounts.
//
// ⚠️ PERFORMANCE: Firebase SDK (~150 KB) endi LAZY yuklanadi — faqat .env'da
// VITE_FIREBASE_* kalitlari sozlangan bo'lsa import qilinadi. Sozlanmagan
// bo'lsa SDK bundle'ga umuman kirmaydi / yuklanmaydi (birinchi yuklash tezroq).
// Barcha firebase funksiyalari ishlatishdan oldin ensureFirebaseInit()'ni kutadi.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Firebase is usable only when the key config fields are present
// (apiKey + authDomain for auth, databaseURL for the realtime live counter)
export const HAS_FIREBASE = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.databaseURL
);

let app = null;
let db = null;
let auth = null;
let googleProvider = null;
let authModRef = null; // firebase/auth modulining o'zi (funksiyalar uchun)
let initPromise = null;

// Firebase'ni (kerak bo'lganda) ishga tushiradi. SDK faqat shu yerda dinamik
// import qilinadi — HAS_FIREBASE false bo'lsa hech narsa yuklanmaydi.
export function ensureFirebaseInit() {
  if (!HAS_FIREBASE) return Promise.resolve();
  if (!initPromise) {
    initPromise = (async () => {
      const [{ initializeApp }, { getDatabase }, authMod] = await Promise.all([
        import('firebase/app'),
        import('firebase/database'),
        import('firebase/auth'),
      ]);
      authModRef = authMod;
      app = initializeApp(firebaseConfig);
      db = getDatabase(app);
      auth = authMod.getAuth(app);
      googleProvider = new authMod.GoogleAuthProvider();
    })();
  }
  return initPromise;
}

// ===== GOOGLE SIGN-IN (real Firebase Auth) =====
// Returns a profile object or null when Firebase is not configured.
export async function signInWithGoogle() {
  await ensureFirebaseInit();
  if (!auth || !googleProvider || !authModRef) return null;
  const result = await authModRef.signInWithPopup(auth, googleProvider);
  const u = result.user;
  return {
    sub: u.uid,
    name: u.displayName || u.email || 'Foydalanuvchi',
    givenName: (u.displayName || '').split(' ')[0] || u.email || 'Foydalanuvchi',
    email: u.email || '',
    picture: u.photoURL || '',
    isGoogle: true,
  };
}

// ===== EMAIL / PASSWORD SIGN-UP (real Firebase Auth) =====
// Creates a new account and signs the user in. Returns a profile object.
export async function registerWithEmail(name, email, password) {
  await ensureFirebaseInit();
  if (!auth || !authModRef) return null;
  const result = await authModRef.createUserWithEmailAndPassword(auth, email, password);
  // Foydalanuvchi ko'rinadigan ismini o'rnatamiz
  await authModRef.updateProfile(result.user, { displayName: name }).catch(() => {});
  const u = result.user;
  return {
    sub: u.uid,
    name: name || u.email || 'Foydalanuvchi',
    givenName: (name || '').split(' ')[0] || u.email || 'Foydalanuvchi',
    email: u.email || '',
    picture: u.photoURL || '',
    isGoogle: false,
  };
}

// ===== EMAIL / PASSWORD LOGIN (real Firebase Auth) =====
// Signs an existing user in. Returns a profile object.
export async function loginWithEmail(email, password) {
  await ensureFirebaseInit();
  if (!auth || !authModRef) return null;
  const result = await authModRef.signInWithEmailAndPassword(auth, email, password);
  const u = result.user;
  return {
    sub: u.uid,
    name: u.displayName || u.email || 'Foydalanuvchi',
    givenName: (u.displayName || '').split(' ')[0] || u.email || 'Foydalanuvchi',
    email: u.email || '',
    picture: u.photoURL || '',
    isGoogle: false,
  };
}

// ===== PASSWORD RESET =====
// Sends a password reset email to the given address.
export async function sendPasswordReset(email) {
  await ensureFirebaseInit();
  if (!auth || !authModRef) return null;
  await authModRef.sendPasswordResetEmail(auth, email);
  return true;
}

export async function signOutGoogle() {
  await ensureFirebaseInit();
  if (!auth || !authModRef) return;
  try {
    await authModRef.signOut(auth);
  } catch {
    /* noop */
  }
}

export { app, db, auth, googleProvider };
