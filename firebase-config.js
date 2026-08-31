// Firebase do MestreXit
// Este arquivo concentra a configuração e as funções do Firestore usadas pelo site.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyASZW0rPGb_-xnsWjlFkV0-d3UH6MNVzYo",
  authDomain: "keys-gerador.firebaseapp.com",
  projectId: "keys-gerador",
  storageBucket: "keys-gerador.firebasestorage.app",
  messagingSenderId: "181530577721",
  appId: "1:181530577721:web:0bb38f186b5241c776f6e8",
  measurementId: "G-S0558S0WPZ"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { doc, getDoc, updateDoc };
