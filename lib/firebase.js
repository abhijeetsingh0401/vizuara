import {initializeApp} from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore, doc, setDoc, getDoc, writeBatch, collection, getDocs, onSnapshot, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {

  apiKey: "AIzaSyDjztgFnWPi6yMVi3w65graGFwegIKrk88",

  authDomain: "vizuaraschoolai.firebaseapp.com",

  projectId: "vizuaraschoolai",

  storageBucket: "vizuaraschoolai.appspot.com",

  messagingSenderId: "925234080706",

  appId: "1:925234080706:web:f94f738b4014a3a01e045b",

  measurementId: "G-BYXK2W866T"

};

//let firebase = null
const firebase = initializeApp(firebaseConfig);

// Auth exports
const auth = getAuth();
const googleAuthProvider = new GoogleAuthProvider();

// // Firestore exports
//const firestore = getDatabase();
const firestore = getFirestore(firebase);

export { auth, googleAuthProvider, signInWithPopup, firestore, doc, setDoc, getDoc, writeBatch, collection, getDocs, onSnapshot, signOut, deleteDoc  };
