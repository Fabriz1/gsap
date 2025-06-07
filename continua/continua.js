import { db, auth } from '../firebase-init.js';
import { collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";
const contenitore = document.querySelector(".paginazione"); // Assicurati che esista nel tuo HTML statico

if (!contenitore) {
    console.error("ERRORE CRITICO: Elemento '.paginazione' non trovato nel DOM.");
    // Potresti voler mostrare un messaggio di errore all'utente qui
    // Esempio: document.body.innerHTML = "<p>Errore nel caricamento della pagina. Contenitore non trovato.</p>";
    
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Se c'è un utente, carichiamo i suoi riassunti
        caricaRiassuntiUtente(user.uid);
    } else {
        // Altrimenti, mostriamo un messaggio (anche se la guardia principale dovrebbe già averlo reindirizzato)
        contenitore.innerHTML = '<p class="errore-caricamento">Devi essere loggato per vedere questa pagina.</p>';
    }
});



async function caricaRiassuntiUtente(idUtente) {
    contenitore.innerHTML = '<p style="color:white">Sto cercando i tuoi quaderni...</p>'; // Messaggio di attesa

    try {
        // Creiamo la nostra richiesta specifica (query) per Firestore
        const q = query(
            collection(db, "riassunti"),       // Cerca nella collezione "riassunti"
            where("id_utente", "==", idUtente), // DOVE il campo "id_utente" è UGUALE all'ID dell'utente loggato
            orderBy("dataC", "desc")         // E ordina i risultati dal più nuovo al più vecchio (basato sul campo dataC)
        );

        // Eseguiamo la richiesta
        const querySnapshot = await getDocs(q);

        // Puliamo il contenitore dal messaggio di attesa
        contenitore.innerHTML = '';

        if (querySnapshot.empty) {
            contenitore.innerHTML = '<p class="nessuna-materia">La tua bacheca è vuota! 😢<br>Crea il tuo primo riassunto.</p>';
            
        }

        // Per ogni documento trovato, creiamo la grafica del quaderno
        querySnapshot.forEach((doc) => {
            const riassunto = doc.data();
            const idRiassunto = doc.id; // L'ID del documento, non dell'utente
            const nomeMateria = riassunto.materia;

            const quaderno = document.createElement("div");
            quaderno.classList.add("quaderno");

            let anelliSpiraleHTML = '';
            for (let s = 0; s < 6; s++) { anelliSpiraleHTML += '<div></div>'; }

            quaderno.innerHTML = `
                <div class="id" style="display:none;">${idRiassunto}</div>
                <div class="copertina"><p class="materia">${nomeMateria}</p></div>
                <div class="spirale">${anelliSpiraleHTML}</div>
            `;

            quaderno.addEventListener("click", () => {
                window.location.href = `visualizza/visualizza.html?id=${idRiassunto}`;
            });
            contenitore.appendChild(quaderno);
        });

    } catch (error) {
        console.error("Errore nel caricare i riassunti:", error);
        contenitore.innerHTML = `<p class="errore-caricamento">Ops! C'è stato un problema nel recuperare i tuoi dati.</p>`;
    }
}