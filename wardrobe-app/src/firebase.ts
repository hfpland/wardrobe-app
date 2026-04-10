import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBuNdOhapcAl6gIzDMNDDJBVsoj4aoKA94",
  authDomain: "wardrobe-app-fab19.firebaseapp.com",
  projectId: "wardrobe-app-fab19",
  storageBucket: "wardrobe-app-fab19.firebasestorage.app",
  messagingSenderId: "933852342185",
  appId: "1:933852342185:web:ac06acfb7474cb194c06b8",
  measurementId: "G-7SX89EXF2M",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
