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

// 🔥 غير هذا الجزء فقط - استخدم القيم المباشرة من Firebase Console:
const firebaseConfig = {
  apiKey: "AIzaSyBYBkGpGSFg8gbTjT06L4x5jxsweD__0pQ",
  authDomain: "yalla-58ccd.firebaseapp.com",
  projectId: "yalla-58ccd",
  storageBucket: "yalla-58ccd.firebasestorage.app",
  messagingSenderId: "476107263423",
  appId: "1:476107263423:web:11677d0ffdbe5dab83250a",
  measurementId: "G-1113KEEG6Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);