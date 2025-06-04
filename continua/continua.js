// --- START OF FILE continua.js (VERSAZIONE ADATTATA PER I QUADERNI MODERNI) ---
fetch("materia.php")
    .then(response => {
        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(risultato_vero => {
        const contenitore = document.querySelector(".paginazione"); // Assicurati che esista nel tuo HTML statico

        if (!contenitore) {
            console.error("ERRORE CRITICO: Elemento '.paginazione' non trovato nel DOM.");
            // Potresti voler mostrare un messaggio di errore all'utente qui
            // Esempio: document.body.innerHTML = "<p>Errore nel caricamento della pagina. Contenitore non trovato.</p>";
            return;
        }

        if (risultato_vero.errore) {
            // Gestisci l'errore specifico dell'applicazione (es. utente non loggato)
            alert("Devi accedere per vedere la tua lista di riassunti");
            window.location.href = "../login/login.html"; // Assicurati che questo percorso sia corretto
            return;
        }
        
        contenitore.innerHTML = ''; // Pulisce il contenitore prima di aggiungere nuovi elementi

        const numero_quaderni = risultato_vero.conta;
        const riassunti = risultato_vero.riassunto;

        if (!riassunti || numero_quaderni === 0) {
            contenitore.innerHTML = '<p class="nessuna-materia">Nessuna materia salvata nella tua bacheca.</p>';
            console.log("Nessun riassunto da visualizzare.");
            return;
        }

        console.log("Numero quaderni da creare:", numero_quaderni);
        console.log("Dati riassunti:", riassunti);

        for (let i = 0; i < numero_quaderni; i++) {
            if (!riassunti[i]) {
                console.warn(`Attenzione: riassunto all'indice ${i} non definito.`);
                continue; // Salta questo riassunto se i dati sono mancanti
            }

            const idRiassunto = riassunti[i].id_riassunto;
            const nomeMateria = riassunti[i].materia;

            if (idRiassunto === undefined || nomeMateria === undefined) {
                console.warn(`Attenzione: Dati mancanti per il riassunto all'indice ${i}. ID: ${idRiassunto}, Materia: ${nomeMateria}`);
                continue;
            }

            const quaderno = document.createElement("div");
            quaderno.classList.add("quaderno");
            
            // Creazione dinamica degli anelli della spirale
            let anelliSpiraleHTML = '';
            for (let s = 0; s < 6; s++) { // Crea 6 anelli come da esempio
                anelliSpiraleHTML += '<div></div>';
            }

            quaderno.innerHTML = `
                <div class="id" style="display:none;">${idRiassunto}</div>
                <div class="copertina">
                    <p class="materia">${nomeMateria}</p>
                </div>
                <div class="spirale">
                    ${anelliSpiraleHTML}
                </div>
            `;
            
            quaderno.addEventListener("click", function () {
                const id = this.querySelector(".id").textContent.trim();
                // Assicurati che il percorso visualizza/visualizza.html sia corretto
                // relativo alla pagina corrente (continua.html)
                window.location.href = `visualizza/visualizza.html?id=${id}`; 
            });
            contenitore.appendChild(quaderno);
        }
    })
    .catch(error => {
        console.error("Errore durante il fetch dei riassunti o elaborazione:", error);
        const contenitore = document.querySelector(".paginazione");
        if (contenitore) {
            contenitore.innerHTML = `<p class="errore-caricamento">Impossibile caricare i riassunti. Errore: ${error.message}. Riprova più tardi.</p>`;
        } else {
            // Fallback se anche il contenitore non esiste
            document.body.innerHTML = `<p>Errore grave nel caricamento della pagina: ${error.message}.</p>`;
        }
    });
// --- END OF FILE continua.js ---