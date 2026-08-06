import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// ==== FIREBASE REALTIME DATABASE (live visitor counter) ====
// Fill these in a .env file (see .env.example) to enable REAL cross-device
// live counting + REAL Google sign-in. Without them the app falls back to
// same-browser demo mode (name-based local login).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Firebase is usable only when apiKey AND databaseURL are present
export const HAS_FIREBASE = Boolean(
  firebaseConfig.apiKey && firebaseConfig.databaseURL
);

let app = null;
let db = null;
let auth = null;
let googleProvider = null;

if (HAS_FIREBASE) {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
}

// Haqiqiy Google orqali kirish (Firebase Auth). Agar .env sozlanmagan
// bo'lsa — null qaytadi va ilova oddiy (ismli) kirishga tushadi.
export async function signInWithGoogle() {
  if (!auth || !googleProvider) return null;
  const result = await signInWithPopup(auth, googleProvider);
  const u = result.user;
  return {
    sub: u.uid,
    name: u.displayName || u.email || 'Google user',
    givenName: (u.displayName || '').split(' ')[0] || u.email || 'Google user',
    email: u.email || '',
    picture: u.photoURL || '',
    isGoogle: true,
  };
}

export async function signOutGoogle() {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch {
    /* noop */
  }
}

export { app, db, auth, googleProvider };
