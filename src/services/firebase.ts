// Fix: Replaced mixed compat/modular Firebase setup with a fully modular (v9+) approach.
// This resolves errors where functions like `getFirestore` and `collection` were not found.
import { initializeApp } from 'firebase/app';
// Fix: Refactored Firebase imports to be explicit, resolving module resolution errors.
// This changes from re-exporting directly to importing and then exporting.
import { 
  getAuth,
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
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
  getDownloadURL 
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
  getDownloadURL 
};


// Fix: Standardized on Vite's native `import.meta.env` for all environment variables.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
// Fix: Call `initializeApp` from the modular SDK.
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
