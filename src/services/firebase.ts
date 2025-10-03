// Fix: The original import `from 'firebase/app'` fails, suggesting an SDK version mismatch or configuration issue.
// Using the v9 compat library for initialization is a robust workaround that allows the rest of the app to use modular functions.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Re-export v9 modular functions for convenience throughout the app
export { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
export { 
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
  increment
} from "firebase/firestore";
export { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";


// Fix: Use import.meta.env for Vite environment variables on the client-side.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Diagnostic log to check if environment variables are loaded
console.log('[DIAGNOSTIC] Firebase Service: Initializing...');
console.log('[DIAGNOSTIC] Firebase Project ID Loaded:', !!import.meta.env.VITE_FIREBASE_PROJECT_ID);
// Avoid logging sensitive keys directly
console.log('[DIAGNOSTIC] Firebase API Key Loaded:', import.meta.env.VITE_FIREBASE_API_KEY ? 'Yes' : 'No');


// Initialize Firebase
// Fix: Call `initializeApp` using the compat library.
const app = firebase.initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);