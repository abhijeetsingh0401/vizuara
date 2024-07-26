import {initializeApp} from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore, doc, setDoc, getDoc, writeBatch, collection, getDocs, onSnapshot, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBRRDpCHLRSzDDU-BamqkQeS1ijZsu7A9g",
    authDomain: "vizuara-8eb52.firebaseapp.com",
    projectId: "vizuara-8eb52",
    storageBucket: "vizuara-8eb52.appspot.com",
    messagingSenderId: "659945327",
    appId: "1:659945327:web:d13feb07f07eb5b401da9a",
    measurementId: "G-BBDRVF9EZ9"
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
