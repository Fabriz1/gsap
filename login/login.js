// File: login/login.js

// 1. IMPORTIAMO GLI STRUMENTI CHE CI SERVONO
import { auth } from '../firebase-init.js'; // Il nostro auth già pronto
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";

// 2. RECUPERIAMO IL BOTTONE DALL'HTML
const googleLoginBtn = document.getElementById('google-login-btn');
const errorMessage = document.getElementById('error-message');

// 3. CREIAMO UN "FORNITORE DI AUTENTICAZIONE GOOGLE"
// Questo è un oggetto speciale che dice a Firebase: "Vogliamo usare Google".
const provider = new GoogleAuthProvider();

// 4. METTIAMO IL BOTTONE IN ASCOLTO PER IL CLICK
googleLoginBtn.addEventListener('click', () => {
    // Quando l'utente clicca...
    console.log("Tentativo di login con Google...");

    // ...usiamo la funzione signInWithPopup.
    // Questa funzione fa tutto il lavoro pesante:
    // - Apre la finestra di login di Google.
    // - Gestisce l'autenticazione.
    // - Ritorna con le informazioni dell'utente se ha successo.
    signInWithPopup(auth, provider)
        .then((result) => {
            // SUCCESSO! L'utente ha effettuato l'accesso.
            const user = result.user;
            console.log("Login con Google riuscito per:", user.displayName);
            alert(`Bentornato, ${user.displayName}!`);

            // Ora lo reindirizziamo alla pagina principale.
            window.location.href = "../index.html";
        })
        .catch((error) => {
            // ERRORE! Qualcosa è andato storto.
            console.error("Errore durante il login con Google:", error);
            // Mostriamo un messaggio di errore all'utente.
            errorMessage.textContent = `Errore: ${error.message}`;
        });
});