

import { GoogleGenAI } from "https://esm.run/@google/genai";

let genAIInstance; 

// ID degli elementi HTML
const API_KEY_INPUT_ID = 'apiKeyInput';
const START_BUTTON_ID = 'startButton';
const RESULTS_CONTAINER_ID = 'resultsContainer';
const STATUS_MESSAGE_ID = 'statusMessage';
const DOWNLOAD_PDF_BUTTON_ID = 'downloadPdfButtonvero';
const SAVE_TO_DASHBOARD_BUTTON_ID = 'saveToDashboardButton';

let materia = "bla"; // Variabile globale per la materia
const NOME_MODELLO_API = "gemini-2.5-flash-preview-05-20";
const MODEL_OUTPUT_TOKEN_LIMIT = 65000;

// Funzione per mostrare messaggi di stato all'utente
function displayStatus(message, isError = false) {
    const statusElement = document.getElementById(STATUS_MESSAGE_ID);
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.style.color = isError ? '#ff6b6b' : '#ffffff';
        statusElement.style.borderColor = isError ? '#ff6b6b' : 'rgb(164, 193, 204)';
    } else {
        console.warn("Elemento statusMessage non trovato nel DOM:", message);
    }
}

// Funzioni helper per UI
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

async function processProgramAndGenerateSummaries(programData) {
    if (!genAIInstance) {
        displayStatus("Errore critico: l'istanza AI non è inizializzata.", true);
        enableInitialControls(true);
        showResultButtons(false);
        return;
    }

    const resultsContainer = document.getElementById(RESULTS_CONTAINER_ID);
    resultsContainer.innerHTML = '';
    displayStatus("Fase 1: Analisi del programma scolastico in corso...");
    showResultButtons(false);

    let firstPromptContents = [];
    const firstPromptInstructionText = `Analizza attentamente il documento fornito, che contiene un programma scolastico.

Il tuo compito principale è identificare tutti gli argomenti principali distinti, i temi trattati o le unità di studio che compongono il programma. Questi argomenti possono essere presentati in vari modi all'interno del documento (es. liste puntate, liste numerate, sottotitoli, paragrafi descrittivi, ecc.). Non limitarti a cercare un formato specifico; leggi e comprendi il contenuto generale.

Una volta identificati gli argomenti principali, forniscili in un formato STRETTAMENTE SPECIFICO:
1.  Inizia con il numero totale di argomenti principali distinti che hai identificato. Scrivi solo il numero.
2.  Subito dopo il numero, metti un punto e virgola (;).
3.  Successivamente, elenca CIASCUNO argomento principale che hai trovato. Per ogni argomento, usa una sintesi chiara o il titolo come appare nel documento, e includi un brevissimo contesto se necessario per distinguerlo da altri argomenti simili o per indicare a quale sezione generale appartiene nel programma originale (es. "Argomento X (parte di Capitolo Y)").
4.  Separa ogni argomento dal successivo con un punto e virgola (;).
5.  NON includere alcun altro testo, introduzioni, commenti o formattazioni aggiuntive (come markdown, grassetto, ecc.) oltre agli argomenti e ai separatori punto e virgola.
6.  Alla fine dell'elenco di argomenti, aggiungi un altro punto e virgola (;).
7.  Come ULTIMO elemento, scrivi il nome della materia a cui si riferisce il programma (es. italiano, matematica, sistemi e reti, GESTIONE PROGETTO ORGANIZZAZIONE D'IMPRESA).

L'output DEVE consistere unicamente in una singola stringa di testo formattata in questo modo: NumeroTotale;Argomento1;Argomento2;...;ArgomentoN;Materia

Esempio di output atteso (per 3 argomenti e la materia): 3;Primo Argomento Trovato;Secondo Argomento (contesto);Terzo Argomento come da testo;Nome Materia
`;

    if (programData.sourceType === 'file' && programData.isBase64) {
        firstPromptContents.push({ text: "Il seguente è un documento (" + programData.mimeType + ") contenente un programma scolastico. " + firstPromptInstructionText });
        firstPromptContents.push({
            inlineData: { mimeType: programData.mimeType, data: programData.content }
        });
    } else if (programData.sourceType === 'text' && programData.content) {
        firstPromptContents.push({ text: firstPromptInstructionText + "\nProgramma Scolastico:\n---\n" + programData.content + "\n---" });
    } else {
        displayStatus("Errore: Dati del programma non validi o mancanti.", true);
        enableInitialControls(true);
        return;
    }

    let analysisText;
    try {
        const analysisAPIConfig = { // Rinominato per chiarezza
            temperature: 0.2,
            maxOutputTokens: 2000
        };
        // Utilizzo di genAIInstance.models.generateContent
        const response = await genAIInstance.models.generateContent({
            model: NOME_MODELLO_API,
            contents: firstPromptContents,
            // L'SDK potrebbe aspettarsi 'generationConfig' o 'config'.
            // Se 'config' non funziona, prova 'generationConfig: analysisAPIConfig'
            config: analysisAPIConfig
        });

        let textFromResponse = "";
        if (response && typeof response.text === 'string' && response.text.trim()) {
            textFromResponse = response.text;
        } else { // Fallback al percorso completo di Gemini se response.text non è disponibile
            const fullPathText = response?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (typeof fullPathText === 'string' && fullPathText.trim()) {
                textFromResponse = fullPathText;
            }
        }

        if (!textFromResponse) {
            throw new Error("Risposta API (analisi programma) non contiene testo valido o struttura inattesa.");
        }
        analysisText = textFromResponse;
        console.log("TESTO ANALISI PROGRAMMA DALL'AI:", analysisText);
    } catch (error) {
        console.error("Errore API durante l'analisi del programma:", error);
        displayStatus(`Errore API (Fase 1): ${error.message}.`, true);
        enableInitialControls(true);
        return;
    }

    const analysisParts = analysisText.split(';');
    if (!analysisParts || analysisParts.length < 2) {
        displayStatus(`Errore: Formato risposta analisi non valido (meno di 2 parti attese). Risposta: "${analysisText}"`, true);
        enableInitialControls(true);
        return;
    }

    materia = analysisParts.pop()?.trim() || "Materia non specificata";
    console.log("Materia identificata:", materia);

    const numArgomentiStr = analysisParts[0]?.trim();
    const numArgomenti = parseInt(numArgomentiStr, 10);

    if (isNaN(numArgomenti) || numArgomenti < 0) {
        displayStatus(`Errore: Numero argomenti non valido ('${numArgomentiStr}'). Risposta: "${analysisText}"`, true);
        enableInitialControls(true);
        return;
    }

    let argomentiList = [];
    if (numArgomenti > 0) {
        argomentiList = analysisParts.slice(1).map(arg => arg.trim()).filter(arg => arg.length > 0);
        if (argomentiList.length === 0) {
            displayStatus(`Errore: AI indica ${numArgomenti} argomenti, ma 0 estratti correttamente. Risposta: "${analysisText}"`, true);
            enableInitialControls(true);
            return;
        }
        if (argomentiList.length !== numArgomenti) {
            console.warn(`Avviso: Argomenti dichiarati (${numArgomenti}) vs estratti (${argomentiList.length}). Si usano gli estratti.`);
        }
    } else {
        displayStatus("Nessun argomento identificato nel programma.", false);
        enableInitialControls(false); // Nascondi controlli iniziali
        showResultButtons(false);
        return;
    }

    displayStatus(`Fase 1 OK. ${argomentiList.length} argomenti. Generazione riassunti in parallelo...`);
    const [prefLunghezza, prefLessico, prefColori, prefCreativita, prefSchematico] = programData.preferences;

    const generatePromises = argomentiList.map(async (argomento, index) => {
        let lunghezzaDescrittivaPrompt;
        let requestedMaxTokens;

        switch (prefLunghezza) {
            case 0:
                lunghezzaDescrittivaPrompt = "DEVE ESSERE ESTREMAMENTE BREVE E CONCISO. Fornisci solo i 2-3 concetti fondamentali o una definizione sintetica. Non più di 50-100 parole. Pensa a una voce di glossario.";
                requestedMaxTokens = 64000;
                break;
            case 1:
                lunghezzaDescrittivaPrompt = "DEVE ESSERE BREVE. Copri i punti principali in modo succinto. Circa 150-300 parole, 2-3 paragrafi al massimo.";
                requestedMaxTokens = 64000;
                break;
            case 2:
                lunghezzaDescrittivaPrompt = "DEVE AVERE UNA LUNGHEZZA NORMALE/STANDARD. Fornisci una buona panoramica, coprendo gli aspetti essenziali. Circa 400-700 parole.";
                requestedMaxTokens = 64000;
                break;
            case 3:
                lunghezzaDescrittivaPrompt = "DEVE ESSERE DI LUNGHEZZA MEDIA, PIUTTOSTO DETTAGLIATO. Approfondisci i concetti chiave, fornisci alcuni esempi. Circa 800-1500 parole.";
                requestedMaxTokens = 64000;
                break;
            case 4:
                lunghezzaDescrittivaPrompt = "DEVE ESSERE SIGNIFICATIVAMENTE LUNGO E DETTAGLIATO. Esplora l'argomento con buona profondità, includendo sotto-argomenti, esempi, analisi. Circa 2000-3500 parole.";
                requestedMaxTokens = 64000;
                break;
            case 5:
                lunghezzaDescrittivaPrompt = "DEVE ESSERE ESTREMAMENTE LUNGO, PROFONDAMENTE DETTAGLIATO ED ESAUSTIVO. Un 'deep dive' completo. Esplora ogni aspetto, sotto-temi, molteplici esempi, contestualizzazione, analisi. Oltre 4000 parole, puntando a un elaborato ricco e completo.";
                requestedMaxTokens = MODEL_OUTPUT_TOKEN_LIMIT - 2000;
                break;
            default:
                lunghezzaDescrittivaPrompt = "DEVE AVERE UNA LUNGHEZZA NORMALE/STANDARD.";
                requestedMaxTokens = 64000;
        }

        if (requestedMaxTokens >= MODEL_OUTPUT_TOKEN_LIMIT) {
            requestedMaxTokens = MODEL_OUTPUT_TOKEN_LIMIT - 100;
        }
        if (requestedMaxTokens <= 0) { requestedMaxTokens = 500; }

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
*   Struttura Schematica (Valore: ${prefSchematico}): (0=discorsivo; 5=molto strutturato con h1,h2,h3,h4, liste, paragrafi brevi. Usa tabelle se utili.)

Output Richiesto (HTML):
*   Inizia DIRETTAMENTE con un tag <h1> contenente il titolo: "${argomento}".
*   Segui scrupolosamente tutte le preferenze utente, specialmente quella sulla LUNGHEZZA.
*   Produci HTML valido e semanticamente corretto.
*   Il contenuto deve essere accurato e adatto a studenti liceali.
*   NON includere \`\`\`html o commenti personali/introduttivi.
`;
        const secondPromptContents = [{ text: secondPromptText }];
        const summaryAPIConfig = { // Rinominato per chiarezza
            temperature: 0.3 + (prefCreativita * 0.1),
            maxOutputTokens: requestedMaxTokens,
        };
        console.log(`Lancio richiesta per "${argomento}" (Index ${index})...`);

        return genAIInstance.models.generateContent({
            model: NOME_MODELLO_API,
            contents: secondPromptContents,
            // Come prima, se 'config' non funziona, prova 'generationConfig: summaryAPIConfig'
            config: summaryAPIConfig
        })
        .then(responseSummary => {
            let summaryHtml = "";
            let generatedText = "";
            if (responseSummary && typeof responseSummary.text === 'string' && responseSummary.text.trim()) {
                generatedText = responseSummary.text;
            } else {
                const fullPathText = responseSummary?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (typeof fullPathText === 'string' && fullPathText.trim()) {
                    generatedText = fullPathText;
                }
            }

            if (generatedText) {
                summaryHtml = generatedText;
                console.log(`Riassunto per "${argomento}" (Index ${index}) gen., lunghezza: ${summaryHtml.length} chars.`);
            } else {
                console.warn(`Risposta non contiene testo valido per "${argomento}" (Index ${index}).`, responseSummary);
                summaryHtml = `<p style="color:orange;">Impossibile generare riassunto per "${argomento}". Risposta API non valida.</p>`;
            }
            return { index: index, html: summaryHtml, success: true };
        })
        .catch(error => {
            console.error(`Errore API gen. riassunto per "${argomento}" (Index ${index}):`, error);
            let detailedErrorMessage = error.message || 'Errore sconosciuto';
            const errorHtml = `<h2 style="color:red;">Errore per ${argomento}</h2><p style="color:orange;">Impossibile generare: ${detailedErrorMessage}</p>`;
            return { index: index, html: errorHtml, success: false, error: error };
        });
    });

    displayStatus(`Generazione in corso per ${generatePromises.length} argomenti. Attendere...`);
    const results = await Promise.allSettled(generatePromises);

    results.forEach(settledResult => {
        const itemResult = settledResult.value;
        const argomentoDiv = document.createElement('div');
        argomentoDiv.classList.add('argomento-summary');
        if (itemResult && itemResult.html) {
            argomentoDiv.innerHTML = itemResult.html;
        } else {
            console.error("Risultato promessa inaspettato o malformato:", settledResult);
            argomentoDiv.innerHTML = `<h2 style="color:red;">Errore di sistema</h2><p style="color:orange;">Impossibile ottenere il risultato per un argomento (${itemResult?.index}).</p>`;
        }
        resultsContainer.appendChild(argomentoDiv);
    });

    displayStatus("Elaborazione completata! Controlla i risultati.", false);
    enableInitialControls(false); // Nascondi controlli iniziali

    if (resultsContainer && resultsContainer.hasChildNodes()) {
        showResultButtons(true);
    } else {
        displayStatus("Nessun riassunto generato o errori. Riprova.", true);
        enableInitialControls(true);
        showResultButtons(false);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof GoogleGenAI === 'undefined') {
        console.error("Errore critico: GoogleGenAI non importato.");
        displayStatus("Errore critico: SDK Google non caricato. Controlla console.", true);
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

    if (!apiKeyInput || !startButton) { // Controlli minimi per partire
         console.error("Errore: Elementi DOM essenziali (apiKeyInput o startButton) non trovati.");
         displayStatus("Errore critico: Elementi pagina mancanti.", true);
         if (startButton) startButton.disabled = true;
         return;
    }

    showResultButtons(false); // Nascondi bottoni di risultato all'inizio

    startButton.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) { displayStatus("Inserisci API Key Gemini.", true); return; }

        startButton.disabled = true;
        apiKeyInput.disabled = true;
        // L'etichetta viene gestita da enableInitialControls(false) alla fine di process...

        try {
            genAIInstance = new GoogleGenAI({ apiKey: apiKey }); // CORRETTO
            displayStatus("API Key OK. Elaborazione...");
            await processProgramAndGenerateSummaries(programData);
        } catch (error) {
            console.error("Errore principale (durante inizializzazione AI o chiamata iniziale):", error);
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
    } else {
        console.warn("Pulsante download PDF non trovato.");
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
    } else {
        console.warn("Pulsante salva su dashboard non trovato.");
    }

    async function salva() {
        const Materia_messaggio = materia || "materia non specificata";
        console.log("Salvataggio riassunto per materia:", Materia_messaggio);
        const resultsContainer = document.getElementById(RESULTS_CONTAINER_ID);
        const riassunto_html = resultsContainer ? resultsContainer.innerHTML : "";

        if (!riassunto_html.trim()) {
            alert("Nessun contenuto da salvare.");
            return;
        }

        const downloadBtn = document.getElementById(DOWNLOAD_PDF_BUTTON_ID);
        const saveToDashboardBtn = document.getElementById(SAVE_TO_DASHBOARD_BUTTON_ID);
        if (downloadBtn) downloadBtn.disabled = true;
        if (saveToDashboardBtn) saveToDashboardBtn.disabled = true;

        try {
            const risposta = await fetch("salvataggio.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contenuto: riassunto_html,
                    materia: Materia_messaggio
                })
            });

            const esito = await risposta.json();
            console.log("Risposta da salvataggio.php:", esito);

            if (esito && esito.success) {
                 alert("Riassunto salvato con successo!");
            } else {
                 alert("Errore durante il salvataggio: " + (esito.error || JSON.stringify(esito)));
            }
        } catch (error) {
            console.error("Errore nella chiamata fetch per il salvataggio:", error);
             alert("Errore tecnico durante il salvataggio: " + error.message);
        } finally {
             if (downloadBtn) downloadBtn.disabled = false;
             if (saveToDashboardBtn) saveToDashboardBtn.disabled = false;
        }
    }
});

