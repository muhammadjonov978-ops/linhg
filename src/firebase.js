import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  updateProfile, sendPasswordResetEmail,
} from 'firebase/auth';

// ==== FIREBASE REALTIME DATABASE (live visitor counter) + AUTH ====
// Fill these in a .env file (see .env.example) to enable REAL cross-device
// live counting + REAL Google sign-in + email/password accounts.
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

if (HAS_FIREBASE) {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
}

// ===== GOOGLE SIGN-IN (real Firebase Auth) =====
// Returns a profile object or null when Firebase is not configured.
export async function signInWithGoogle() {
  if (!auth || !googleProvider) return null;
  const result = await signInWithPopup(auth, googleProvider);
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
  if (!auth) return null;
  const result = await createUserWithEmailAndPassword(auth, email, password);
  // Foydalanuvchi ko'rinadigan ismini o'rnatamiz
  await updateProfile(result.user, { displayName: name }).catch(() => {});
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
  if (!auth) return null;
  const result = await signInWithEmailAndPassword(auth, email, password);
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
  if (!auth) return null;
  await sendPasswordResetEmail(auth, email);
  return true;
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
