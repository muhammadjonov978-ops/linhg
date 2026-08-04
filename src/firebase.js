import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// ==== FIREBASE REALTIME DATABASE (live visitor counter) ====
// Fill these in a .env file (see .env.example) to enable REAL cross-device
// live counting. Without them the app falls back to same-browser demo mode.
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

if (HAS_FIREBASE) {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
}

export { app, db };
