import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: Replace these with your actual Firebase project config
// You can also use environment variables here
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyReplaceMe",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "qlf-barber-shop.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "qlf-barber-shop",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "qlf-barber-shop.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abc123def456"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);