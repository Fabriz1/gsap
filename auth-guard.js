
import { auth } from './firebase-init.js'; 
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";


onAuthStateChanged(auth, (user) => {
    

    if (user) {
        
        console.log("Guardia: Accesso consentito per l'utente:", user.email);
    } else {
       
        console.log("Guardia: Accesso negato! Utente non loggato. Reindirizzamento a /login/");
        alert("Per accedere a questa sezione devi prima effettuare il login.");

        
        window.location.href = '/login/login.html';
    }
});