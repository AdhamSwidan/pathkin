import { initializeApp } from 'firebase/app';
import { 
  getAuth,
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore,
  collection, 
  doc, 
  getDoc,
  getDocs,
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  addDoc, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove, 
  Timestamp,
  deleteDoc,
  runTransaction,
  increment,
  writeBatch
} from "firebase/firestore";
import { 
  getStorage,
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject
} from "firebase/storage";


// Re-export v9 modular functions for convenience throughout the app
export { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  collection, 
  doc, 
  getDoc,
  getDocs,
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  addDoc, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove, 
  Timestamp,
  deleteDoc,
  runTransaction,
  increment,
  writeBatch,
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject
};

export type { FirebaseUser };

// Helper function to remove quotes from environment variables
const stripQuotes = (str: string | undefined): string => {
    if (!str) return '';
    // This regex removes leading and trailing quotes (single or double)
    return str.replace(/^["']|["']$/g, '');
};


// Standardized on Vite's native `import.meta.env` for all environment variables.
const firebaseConfig = {
  apiKey: stripQuotes(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: stripQuotes(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: stripQuotes(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: stripQuotes(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: stripQuotes(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: stripQuotes(import.meta.env.VITE_FIREBASE_APP_ID),
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);