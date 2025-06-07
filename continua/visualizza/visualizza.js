import { db } from '../../firebase-init.js'; 
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const riassuntoId = urlParams.get("id");

const contenitore=document.querySelector("#resultsContainer");
caricaSingoloRiassunto(riassuntoId);
async function caricaSingoloRiassunto(id) {
    contenitore.innerHTML = "<p>Caricamento riassunto...</p>";

    try {
        // Creiamo un "riferimento" diretto al documento che vogliamo.
        // È come dire a un bibliotecario "Voglio il libro con questo codice ISBN".
        const docRef = doc(db, "riassunti", id);

        // Chiediamo di recuperare quel singolo documento
        const docSnap = await getDoc(docRef);

        // Controlliamo se il documento esiste (potrebbe essere un ID sbagliato)
        if (docSnap.exists()) {
            // Se esiste, prendiamo i suoi dati
            const data = docSnap.data();
            // E inseriamo il contenuto HTML nella pagina!
            contenitore.innerHTML = data.contenuto;
        } else {
            // Le regole di sicurezza dovrebbero già bloccare l'accesso non autorizzato,
            // ma questo errore appare se l'ID è semplicemente inesistente.
            contenitore.innerHTML = "<h1>Errore 404</h1><p>Questo riassunto non è stato trovato.</p>";
        }
    } catch (error) {
        console.error("Errore nel recuperare il documento:", error);
        contenitore.innerHTML = `<h1>Errore</h1><p>Impossibile caricare il riassunto. Dettagli: ${error.message}</p>`;
    }
}