// ========= logica.js (VERSIONE FINALE con Vera Logica a Lotti) =========

import { GoogleGenAI } from "https://esm.run/@google/genai";
import { db, auth } from '../firebase-init.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
// --- Sezione Controlli UI (Invariata) ---
const video_effettivo = document.getElementById('video_effettivo');
document.querySelector(".domanda").addEventListener("click", function () {
    gsap.to("#video_effettivo", { duration: 1, scale: 1, opacity: 1, zIndex: 1000 });
    gsap.to(".container", { opacity: 0, zIndex: -1 });
    gsap.to(".chiudi", { opacity: 1, zIndex: 1000, scale: 0.7 });
    video_effettivo.currentTime = 0;
    video_effettivo.play();
});
document.querySelector(".chiudi").addEventListener("click", function () {
    gsap.to("#video_effettivo", { duration: 0.5, opacity: 0, zIndex: -100 });
    gsap.to(".container", { opacity: 1, zIndex: 100 });
    gsap.to(".chiudi", { opacity: 0, zIndex: -100, scale: 0 });
    video_effettivo.pause();
});


// --- Sezione Logica Principale Gemini AI ---

let genAIInstance;

// ID degli elementi HTML
const API_KEY_INPUT_ID = 'apiKeyInput';
const START_BUTTON_ID = 'startButton';
const RESULTS_CONTAINER_ID = 'resultsContainer';
const STATUS_MESSAGE_ID = 'statusMessage';
const DOWNLOAD_PDF_BUTTON_ID = 'downloadPdfButtonvero';
const SAVE_TO_DASHBOARD_BUTTON_ID = 'saveToDashboardButton';

// Variabili e Costanti Globali
let materia = "bla";
const MODELLO_ANALISI_PRO = "gemini-2.5-flash-preview-05-20";
const MODELLO_RIASSUNTI_FLASH = "gemini-2.5-flash-preview-05-20";
const MODEL_OUTPUT_TOKEN_LIMIT = 65000;

// --- Funzioni Helper UI (Invariate) ---
function displayStatus(message, isError = false) {
    const statusElement = document.getElementById(STATUS_MESSAGE_ID);
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.style.color = isError ? '#ff6b6b' : '#ffffff';
        statusElement.style.borderColor = isError ? '#ff6b6b' : 'rgb(164, 193, 204)';
    }
}
function enableInitialControls(show = true) {
    const startButton = document.getElementById(START_BUTTON_ID);
    const apiKeyInput = document.getElementById(API_KEY_INPUT_ID);
    const apiKeyLabel = document.querySelector('label[for="apiKeyInput"]');
    const displayValue = show ? '' : 'none';
    if (startButton) { startButton.disabled = false; startButton.style.display = displayValue; }
    if (apiKeyInput) { apiKeyInput.disabled = false; apiKeyInput.style.display = displayValue; }
    if (apiKeyLabel) apiKeyLabel.style.display = displayValue;
}
function showResultButtons(show = true) {
    const downloadButton = document.getElementById(DOWNLOAD_PDF_BUTTON_ID);
    const saveToDashboardButton = document.getElementById(SAVE_TO_DASHBOARD_BUTTON_ID);
    const displayValue = show ? 'inline-block' : 'none';
    if (downloadButton) downloadButton.style.display = displayValue;
    if (saveToDashboardButton) saveToDashboardButton.style.display = displayValue;
}

/**
 * Genera un riassunto per un singolo argomento con logica di retry.
 */
async function generateSummaryWithRetry(argomento, index, apiConfig, promptText, maxRetries = 3, currentAttempt = 1) {
    console.log(`Tentativo ${currentAttempt}/${maxRetries} per: "${argomento}"`);
    try {
        const contents = [{ text: promptText }];
        const responseSummary = await genAIInstance.models.generateContent({ model: MODELLO_RIASSUNTI_FLASH, contents: contents, config: apiConfig });
        const generatedText = responseSummary.text || responseSummary?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (generatedText.trim()) {
            return { index, html: generatedText, success: true };
        } else {
            const errorHtml = `<h2 style="color:red;">Errore per ${argomento}</h2><p style="color:orange;">L'API non ha restituito contenuto.</p>`;
            return { index, html: errorHtml, success: false };
        }
    } catch (error) {
        const isRateLimitError = error.message && (error.message.includes('429') || error.message.toLowerCase().includes('rate limit'));
        if (isRateLimitError && currentAttempt < maxRetries) {
            const delay = 10000 + Math.random() * 5000;
            const waitSeconds = (delay / 1000).toFixed(1);
            console.warn(`Quota superata per "${argomento}". Riprovo tra ${waitSeconds} secondi...`);
            displayStatus(`Quota API superata. Metto in pausa per ${waitSeconds}s e riprovo...`, false);
            await new Promise(resolve => setTimeout(resolve, delay));
            return generateSummaryWithRetry(argomento, index, apiConfig, promptText, maxRetries, currentAttempt + 1);
        } else {
            const errorHtml = `<h2 style="color:red;">Errore per ${argomento}</h2><p style="color:orange;">Impossibile generare: ${error.message}</p>`;
            return { index, html: errorHtml, success: false, error };
        }
    }
}

/**
 * Funzione principale che orchestra l'intero processo.
 */
async function processProgramAndGenerateSummaries(programData) {
    if (!genAIInstance) {
        displayStatus("Errore critico: l'istanza AI non è inizializzata.", true);
        enableInitialControls(true);
        return;
    }

    const resultsContainer = document.getElementById(RESULTS_CONTAINER_ID);
    resultsContainer.innerHTML = '';
    displayStatus("Fase 1: Analisi del programma scolastico con Gemini 2.5 Pro...");
    showResultButtons(false);

    const firstPromptInstructionText = `Sei un assistente didattico specializzato nell'analisi di documenti accademici. Il tuo compito è smontare il programma scolastico fornito in ogni sua singola componente di studio.
**PRINCIPIO GUIDA FONDAMENTALE:**
Un "argomento" è la più piccola unità di conoscenza discreta elencata nel documento. Se un concetto è presentato su una riga a sé, come un punto elenco, una voce numerata, o un sottotitolo, esso costituisce un singolo argomento. Ignora la formattazione e concentrati sulla struttura logica e sulla suddivisione dei contenuti fatta dal docente.
**ISTRUZIONI DETTAGLIATE:**
1.  **IDENTIFICA LE MACRO-AREE:** Prima di tutto, riconosci le materie principali o le sezioni del documento (es. "Materia: Italiano", "MODULO 1 - IL LIVELLO TRASPORTO", "FASE/UdA: Architettura di rete", "CONTENUTI DISCIPLINARI"). Queste ti serviranno per dare contesto.
2.  **ESTRAZIONE GRANULARE (REGOLA PIÙ IMPORTANTE):**
    - Scandisci il documento riga per riga.
    - Estrai ogni singola voce che rappresenta un tema di studio come un argomento separato.
    - **NON DEVI ASSOLUTAMENTE RAGGRUPPARE O RIASSUMERE.** Se trovi "Derivate" e poi "Derivate fondamentali" su due righe, sono DUE argomenti distinti.
    - Estrai anche i titoli delle sezioni se rappresentano un argomento a sé (es. "Laboratorio", "AREA TEORICA").
3.  **AGGIUNGI CONTESTO OBBLIGATORIO:**
    - Per ogni argomento estratto, devi indicare tra parentesi la sua macro-area di origine. Esempi: "(da Italiano)", "(da Matematica - DERIVATE)", "(da Sistemi e Reti - MODULO 3)". Questo è cruciale per la chiarezza.
4.  **IDENTIFICA LA MATERIA:** Alla fine, identifica la materia generale a cui si riferisce ogni programma (es. Italiano, Matematica, Storia, Informatica, ecc.). Se il documento contiene più programmi, estrai la materia per ogni blocco. L'output finale conterrà la materia più pertinente all'ultimo blocco di argomenti analizzato.
**FORMATO DI OUTPUT - SEGUIRE ALLA LETTERA:**
L'output deve essere una SINGOLA STRINGA DI TESTO, senza introduzioni, commenti o markdown. La struttura è la seguente:
\`NumeroTotaleArgomenti;Argomento1 (Contesto1);Argomento2 (Contesto2);...;ArgomentoN (ContestoN);MateriaPrincipale\`
**ESEMPIO PRATICO DI OUTPUT ATTESO:**
\`152;La belle époque: definizione e caratteristiche (da Storia - Unità 1);Il concetto di Fair Play: rispetto, lealtà, integrazione (da Scienze Motorie - AREA TEORICA);Derivata di una funzione (da Matematica - DERIVATE);Comprendere il modello client-server (da Tecnologie - FASE/UdA: Architettura di rete);...;Il Neorealismo (da Italiano);Italiano\`
Sappi che questra stringa verrà passata ad un file javascript e verra utilizzata per creare tanti riassunti quanti sono gli argomenti, sii preciso`;

    let firstPromptContents = [];
    if (programData.sourceType === 'file' && programData.isBase64) {
        firstPromptContents = [{ text: firstPromptInstructionText }, { inlineData: { mimeType: programData.mimeType, data: programData.content } }];
    } else if (programData.sourceType === 'text' && programData.content) {
        firstPromptContents = [{ text: firstPromptInstructionText + "\n\nProgramma:\n---\n" + programData.content }];
    } else {
        displayStatus("Errore: Dati del programma non validi.", true);
        enableInitialControls(true);
        return;
    }

    let analysisText;
    try {
        const analysisAPIConfig = { temperature: 0.1, maxOutputTokens: 30000 };
        const result = await genAIInstance.models.generateContent({ model: MODELLO_ANALISI_PRO, contents: firstPromptContents, config: analysisAPIConfig });
        const response = result;
        if (!response || !response.candidates || response.candidates.length === 0) {
            let reason = `La risposta API era vuota. Bloccata per: ${response?.promptFeedback?.blockReason || 'motivo sconosciuto'}.`;
            throw new Error(`Analisi fallita. ${reason}`);
        }
        analysisText = response.candidates[0]?.content?.parts?.[0]?.text || "";
        if (!analysisText.trim()) {
            let reason = `La risposta non conteneva testo. Motivo fine: ${response.candidates[0]?.finishReason || 'sconosciuto'}.`;
            if (response.candidates[0]?.finishReason === 'SAFETY') reason += ` Ratings: ${JSON.stringify(response.candidates[0].safetyRatings)}`;
            throw new Error(reason);
        }
    } catch (error) {
        displayStatus(`Errore API (Fase 1 con Modello Pro): ${error.message}.`, true);
        enableInitialControls(true);
        return;
    }

    const analysisParts = analysisText.split(';').map(p => p.trim()).filter(p => p);
    if (analysisParts.length < 2) {
        displayStatus(`Errore: Formato risposta analisi non valido: "${analysisText}"`, true);
        enableInitialControls(true);
        return;
    }
    materia = analysisParts.pop() || "Materia non specificata";
    const numArgomenti = parseInt(analysisParts.shift(), 10);
    const argomentiList = analysisParts;
    if (isNaN(numArgomenti) || argomentiList.length === 0) {
        displayStatus(`Nessun argomento valido identificato.`, false);
        enableInitialControls(true);
        return;
    }

    displayStatus(`Fase 1 OK. ${argomentiList.length} argomenti trovati. Inizio elaborazione ibrida...`);
    const [prefLunghezza, prefLessico, prefColori, prefCreativita, prefSchematico] = programData.preferences;

    // --- LOGICA IBRIDA CORRETTA: CREAZIONE E GESTIONE LOTTI ---
    const BATCH_SIZE = 3;
    const PAUSE_BETWEEN_BATCHES_MS = 5000;
    const allResults = [];

    for (let i = 0; i < argomentiList.length; i += BATCH_SIZE) {
        const batchOfTopics = argomentiList.slice(i, i + BATCH_SIZE);
        const currentProgress = i + batchOfTopics.length;
        const totalTopics = argomentiList.length;

        displayStatus(`Preparazione lotto ${Math.floor(i / BATCH_SIZE) + 1}. Argomenti ${currentProgress}/${totalTopics}...`, false);

        const batchPromises = batchOfTopics.map((argomento, indexInBatch) => {
            const globalIndex = i + indexInBatch;

            let lunghezzaDescrittivaPrompt, requestedMaxTokens;
            switch (prefLunghezza) {
                case 0: lunghezzaDescrittivaPrompt = "BREVISSIMO devi scrivere prorpio due informazioni. 50 circa parole."; requestedMaxTokens = 60000; break;
                case 1: lunghezzaDescrittivaPrompt = "BREVE i conmcetti principali circa 100 parole."; requestedMaxTokens = 60000; break;
                case 2: lunghezzaDescrittivaPrompt = "STANDARD. 200 parole."; requestedMaxTokens = 60000; break;
                case 3: lunghezzaDescrittivaPrompt = "DETTAGLIATO. scrivi abbastanza ma non troppo circa 400 parole."; requestedMaxTokens = 60000; break;
                case 4: lunghezzaDescrittivaPrompt = "LUNGO. approfondisci senza esagerare circa 700 parole."; requestedMaxTokens = 60000; break;
                case 5: lunghezzaDescrittivaPrompt = "ESAUSTIVO. approfondisci circa 1000."; requestedMaxTokens = 60000; break;
                default: lunghezzaDescrittivaPrompt = "STANDARD."; requestedMaxTokens = 60000;
            }
            if (requestedMaxTokens >= MODEL_OUTPUT_TOKEN_LIMIT) requestedMaxTokens = MODEL_OUTPUT_TOKEN_LIMIT - 100;
            const summaryAPIConfig = { temperature: 0.3 + (prefCreativita * 0.1), maxOutputTokens: 64000 };
            const secondPromptText = `Sei un ricercatore esperto e un autore di testi didattici di altissimo livello, specializzato nel rendere argomenti complessi accessibili e interessanti per studenti liceali.

Il tuo compito è produrre un elaborato completo, accurato e approfondito sull'argomento: "${argomento}"

Istruzioni Fondamentali:
1.  **Ricerca e Conoscenza:** Attingi dalla tua vasta conoscenza per trattare l'argomento in modo completo. Immagina di aver consultato diverse fonti autorevoli.
2.  **Struttura e Chiarezza:** Organizza le informazioni in modo logico e fluente.
3.  **Profondità del Contenuto:** Il livello di dettaglio e l'estensione del testo devono corrispondere ESATTAMENTE alla seguente specifica di lunghezza utente.

Preferenze Utente (Scala 0-5):
*   **Lunghezza del Riassunto (Valore: ${prefLunghezza}): ${lunghezzaDescrittivaPrompt}**
*   Complessità del Lessico (Valore: ${prefLessico}): (0=molto semplice; 3=standard; 5=ricco e preciso, termini tecnici spiegati)
*   Uso di Colori (Valore: ${prefColori}): (0=no colori; 5=uso frequente e strategico. Usa <span> con style="color: #..."; scegli colori leggibili su sfondo scuro come lightblue, lightgreen, gold, lightpink, lightcoral, e anche altri, tutti i colori che vuoi.)
*   Creatività Espositiva (Valore: ${prefCreativita}): (0=fattuale; 5=coinvolgente, con analogie/collegamenti, mantenendo rigore)
*   Struttura Schematica (Valore: ${prefSchematico}): (0=discorsivo; 5=molto strutturato con h1,h2,h3,h4, liste, paragrafi brevi. Usa tabelle se utili, e usa molti elenchi puntati.)

Output Richiesto (HTML):
*   Inizia DIRETTAMENTE con un tag <h1> contenente il titolo: "${argomento}".
*   Segui scrupolosamente tutte le preferenze utente, specialmente quella sulla LUNGHEZZA.
*   Produci HTML valido e semanticamente corretto.
*   Il contenuto deve essere accurato e adatto a studenti liceali.
*   NON includere \`\`\`html o commenti personali/introduttivi.
*   Se l'argomento fornito non da la possibilità di creare un riasssunto rispondere con un h1 con dentro scritto "${argomento} non trovato" 
`;

            return generateSummaryWithRetry(argomento, globalIndex, summaryAPIConfig, secondPromptText);
        });

        displayStatus(`Elaborazione lotto ${Math.floor(i / BATCH_SIZE) + 1} in corso...`, false);

        const batchResults = await Promise.all(batchPromises);

        batchResults.forEach(itemResult => {
            allResults.push(itemResult);
            const argomentoDiv = document.createElement('div');
            argomentoDiv.classList.add('argomento-summary');
            argomentoDiv.innerHTML = itemResult.html;
            resultsContainer.appendChild(argomentoDiv);
        });

        if (currentProgress < totalTopics) {
            displayStatus(`Pausa di ${PAUSE_BETWEEN_BATCHES_MS / 1000}s per rispettare i limiti API...`, false);
            await new Promise(resolve => setTimeout(resolve, PAUSE_BETWEEN_BATCHES_MS));
        }
    }
    const results = allResults;

    const successfulCount = results.filter(r => r.success).length;
    displayStatus(`Elaborazione completata. ${successfulCount}/${results.length} riassunti generati.`, successfulCount === 0);

    enableInitialControls(false);
    if (resultsContainer.hasChildNodes()) {
        showResultButtons(true);
    } else {
        enableInitialControls(true);
        showResultButtons(false);
    }
}

// --- Event Listener e Inizializzazione (Invariato) ---
document.addEventListener('DOMContentLoaded', () => {
    if (typeof GoogleGenAI === 'undefined') {
        displayStatus("Errore critico: SDK Google non caricato.", true);
        const sb = document.getElementById(START_BUTTON_ID); if (sb) sb.disabled = true;
        return;
    }
    const storedData = localStorage.getItem('programDataForLogic');
    if (!storedData) {
        displayStatus("Errore: Dati programma non trovati. Riprova.", true);
        const sb = document.getElementById(START_BUTTON_ID); if (sb) sb.disabled = true;
        return;
    }
    const programData = JSON.parse(storedData);
    const apiKeyInput = document.getElementById(API_KEY_INPUT_ID);
    const startButton = document.getElementById(START_BUTTON_ID);

    if (!apiKeyInput || !startButton) {
        displayStatus("Errore critico: Elementi pagina mancanti.", true);
        if (startButton) startButton.disabled = true;
        return;
    }

    showResultButtons(false);

    startButton.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) { displayStatus("Inserisci la tua API Key Gemini.", true); return; }
        startButton.disabled = true;
        apiKeyInput.disabled = true;
        try {
            genAIInstance = new GoogleGenAI({ apiKey: apiKey });
            displayStatus("API Key OK. Inizio elaborazione...");
            await processProgramAndGenerateSummaries(programData);
        } catch (error) {
            console.error("Errore principale:", error);
            displayStatus(`Errore: ${error.message}.`, true);
            enableInitialControls(true);
            showResultButtons(false);
        }
    });

    const downloadButton = document.getElementById(DOWNLOAD_PDF_BUTTON_ID);
    if (downloadButton) {
        downloadButton.addEventListener('click', () => {
            const rc = document.getElementById(RESULTS_CONTAINER_ID);
            if (!rc || !rc.hasChildNodes() || rc.innerHTML.trim() === "") {
                alert("Niente da stampare/salvare."); return;
            }
            window.print();
        });
    }

    const saveToDashboardButton = document.getElementById(SAVE_TO_DASHBOARD_BUTTON_ID);
    if (saveToDashboardButton) {
        saveToDashboardButton.addEventListener('click', () => {
            const rc = document.getElementById(RESULTS_CONTAINER_ID);
            if (!rc || !rc.hasChildNodes() || rc.innerHTML.trim() === "") {
                alert("Niente da salvare."); return;
            }
            salva();
        });
    }
    /*
        async function salva() {
            const Materia_messaggio = materia || "materia non specificata";
            const resultsContainer = document.getElementById(RESULTS_CONTAINER_ID);
            const riassunto_html = resultsContainer ? resultsContainer.innerHTML : "";
            if (!riassunto_html.trim()) { alert("Nessun contenuto da salvare."); return; }
            const downloadBtn = document.getElementById(DOWNLOAD_PDF_BUTTON_ID);
            const saveToDashboardBtn = document.getElementById(SAVE_TO_DASHBOARD_BUTTON_ID);
            if (downloadBtn) downloadBtn.disabled = true;
            if (saveToDashboardBtn) saveToDashboardBtn.disabled = true;
            try {
                const risposta = await fetch("salvataggio.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contenuto: riassunto_html, materia: Materia_messaggio })
                });
                const esito = await risposta.json();
                if (esito && esito.success) {
                    alert("Riassunto salvato con successo!");
                } else {
                    alert("Errore durante il salvataggio: " + (esito.error || JSON.stringify(esito)));
                }
            } catch (error) {
                alert("Errore tecnico durante il salvataggio: " + error.message);
            } finally {
                if (downloadBtn) downloadBtn.disabled = false;
                if (saveToDashboardBtn) saveToDashboardBtn.disabled = false;
            }
        }*/
    // Importa questo in cima al tuo file logica.js se non l'hai già fatto


    // ...

    async function salva() {
        // Elementi UI
        const saveToDashboardBtn = document.getElementById(SAVE_TO_DASHBOARD_BUTTON_ID);

        // 1. CONTROLLO DI SICUREZZA: L'utente è loggato?
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert("Errore: Utente non trovato. Per favore, effettua di nuovo il login per salvare.");
            return;
        }

        // Disabilita il bottone per prevenire doppi click
        if (saveToDashboardBtn) {
            saveToDashboardBtn.disabled = true;
            saveToDashboardBtn.textContent = "Salvataggio..."; // Feedback visivo
        }

        // 2. PREPARAZIONE DEI DATI
        const Materia_messaggio = materia || "materia non specificata";
        const resultsContainer = document.getElementById(RESULTS_CONTAINER_ID);
        const riassunto_html = resultsContainer ? resultsContainer.innerHTML : "";

        if (!riassunto_html.trim()) {
            alert("Nessun contenuto da salvare.");
            if (saveToDashboardBtn) { // Riattiva il bottone se non c'è niente da salvare
                saveToDashboardBtn.disabled = false;
                saveToDashboardBtn.textContent = "Salva il riassunto nella tua bacheca";
            }
            return;
        }

        // 3. CREAZIONE DELL'OGGETTO PER FIRESTORE
        // (Ho usato i tuoi nomi di campo, vanno benissimo!)
        const datiFire = {
            id_utente: currentUser.uid,
            materia: Materia_messaggio,
            contenuto: riassunto_html,
            dataC: serverTimestamp()
        };

        // 4. BLOCCO TRY...CATCH...FINALLY per il salvataggio
        try {
            // Eseguiamo il salvataggio
            await addDoc(collection(db, "riassunti"), datiFire);

            // Se siamo qui, il salvataggio è andato a buon fine!
            alert("Riassunto salvato con successo nella tua bacheca! 🎉");

        } catch (error) {
            // Se c'è un errore, lo comunichiamo
            console.error("Errore durante il salvataggio:", error);
            alert("Errore tecnico durante il salvataggio: " + error.message);
        } finally {
            // QUESTA PARTE VIENE ESEGUITA SEMPRE, sia in caso di successo che di errore.
            // È il posto perfetto per riattivare il bottone.
            if (saveToDashboardBtn) {
                saveToDashboardBtn.disabled = false;
                saveToDashboardBtn.textContent = "Salva il riassunto nella tua bacheca";
            }
        }
    }
});