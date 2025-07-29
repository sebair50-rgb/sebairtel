
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBKvz1jwLdthoyIObiFEdphjepxPshqNa4",
  authDomain: "sebairtel.firebaseapp.com",
  projectId: "sebairtel",
  storageBucket: "sebairtel.firebasestorage.app",
  messagingSenderId: "540802476349",
  appId: "1:540802476349:web:7677b2d345b41d64e0bd54",
  measurementId: "G-XVVDF2BN9C"
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
