// File: firebase-init.js

// 1. IMPORTIAMO GLI STRUMENTI CHE CI SERVONO
// Abbiamo bisogno di:
// - initializeApp: per accendere la connessione
// - getAuth: per gestire utenti (login/registrazione)
// - getFirestore: per usare il database
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

// 2. LA TUA CONFIGURAZIONE PERSONALE (Questa è la tua, è perfetta)
const firebaseConfig = {
    apiKey: "AIzaSyCyScIu7zCiS6773vBtac5NldYbXI_IMZA",
    authDomain: "maturita--facile.firebaseapp.com",
    projectId: "maturita--facile",
    storageBucket: "maturita--facile.firebasestorage.app",
    messagingSenderId: "227653415063",
    appId: "1:227653415063:web:04c18300482f39fdc6b9d2",
    measurementId: "G-Z2D76NKY08"
};

// 3. ACCENDIAMO FIREBASE
const app = initializeApp(firebaseConfig);

// 4. PREPARIAMO GLI STRUMENTI E LI RENDIAMO DISPONIBILI PER GLI ALTRI FILE
// In questo modo, quando un altro file (es. login.js) avrà bisogno di gestire un utente,
// potrà semplicemente chiedere "auth" e lo troverà già pronto.
export const auth = getAuth(app);
export const db = getFirestore(app);