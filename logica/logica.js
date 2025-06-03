// logica.js
import { GoogleGenAI } from "https://esm.run/@google/genai";

let genAIInstance; // Istanza di GoogleGenAI

// ID degli elementi HTML
const API_KEY_INPUT_ID = 'apiKeyInput';
const START_BUTTON_ID = 'startButton';
const RESULTS_CONTAINER_ID = 'resultsContainer';
const STATUS_MESSAGE_ID = 'statusMessage';
const DOWNLOAD_PDF_BUTTON_ID = 'downloadPdfButtonvero';


const NOME_MODELLO_API = "gemini-2.5-flash-preview-05-20"; // <<<--- !!! MODIFICA QUESTO VALORE !!!
const MODEL_OUTPUT_TOKEN_LIMIT = 65000; // Limite output specifico per il modello target (65k per 2.5 Flash Preview)

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

async function processProgramAndGenerateSummaries(programData) {
    if (!genAIInstance) {
        displayStatus("Errore critico: l'istanza AI non è inizializzata.", true);
        document.getElementById(START_BUTTON_ID).disabled = false;
        document.getElementById(API_KEY_INPUT_ID).disabled = false;
        return;
    }

    const resultsContainer = document.getElementById(RESULTS_CONTAINER_ID);
    resultsContainer.innerHTML = '';

    displayStatus("Fase 1: Analisi del programma scolastico in corso...");

    let firstPromptContents = [];
    const firstPromptInstructionText = `Analizza il programma scolastico fornito.
Identifica il numero totale di argomenti principali distinti. Scrivi solo questo numero.
Subito dopo il numero, metti un punto e virgola (;).
Poi, elenca ciascun argomento principale. Separa ogni argomento dal successivo con un punto e virgola (;).
Per ogni argomento, includi il suo titolo esatto (o una sintesi fedele) e un breve contesto essenziale (es. capitolo, periodo, sottotema) per evitare ambiguità e assicurare che l'analisi futura sia pertinente.
Non aggiungere altro testo, introduzioni, o formattazioni (es. markdown, grassetto). Fornisci solo il numero seguito dall'elenco come testo puro, alla fine di tutto aggiungi un altro punto e virgola e scrivi la materia del programma inviato es (italiano, matematica, sistemi e reti , ecc) e basta, nient'altro.

Esempio di output atteso: 3;Argomento 1 con contesto;Argomento 2 con contesto;Argomento 3 con contesto;Italiano
`;

    if (programData.sourceType === 'file' && programData.isBase64) {
        firstPromptContents.push({ text: "Il seguente è un documento (" + programData.mimeType + ") contenente un programma scolastico. " + firstPromptInstructionText });
        firstPromptContents.push({
            inlineData: { mimeType: programData.mimeType, data: programData.content }
        });
    } else if (programData.sourceType === 'text' && programData.content) {
        firstPromptContents.push({ text: firstPromptInstructionText + "\nProgramma Scolastico:\n---\n" + programData.content + "\n---" });
    } else {
        displayStatus("Errore: Dati del programma non validi o mancanti.", true); return;
    }

    let analysisText;
    try {
        const analysisConfig = { temperature: 0.2, maxOutputTokens: 2000 };
        const response = await genAIInstance.models.generateContent({
            model: NOME_MODELLO_API,
            contents: firstPromptContents,
            config: analysisConfig
        });
        if (!response || typeof response.text !== 'string') {
            throw new Error("Risposta API (analisi programma) non contiene testo valido.");
        }
        analysisText = response.text;
        console.log("TESTO ANALISI PROGRAMMA DALL'AI:", analysisText);
    } catch (error) {
        console.error("Errore API durante l'analisi del programma:", error);
        displayStatus(`Errore API (Fase 1): ${error.message}.`, true);
        document.getElementById(START_BUTTON_ID).disabled = false;
        document.getElementById(API_KEY_INPUT_ID).disabled = false;
        return;
    }

    const analysisParts = analysisText.split(';');
    if (!analysisParts || analysisParts.length === 0) { displayStatus(`Errore: Formato risposta analisi non valido. Risposta: "${analysisText}"`, true); return; }
    const numArgomentiStr = analysisParts[0].trim();
    const numArgomenti = parseInt(numArgomentiStr, 10);
    if (isNaN(numArgomenti) || numArgomenti < 0) { displayStatus(`Errore: Numero argomenti non valido ('${numArgomentiStr}'). Risposta: "${analysisText}"`, true); return; }
    let argomentiList = [];
    if (numArgomenti > 0) {
        if (analysisParts.length > 1) {
            argomentiList = analysisParts.slice(1).map(arg => arg.trim()).filter(arg => arg.length > 0);
        }
        if (argomentiList.length === 0) { displayStatus(`Errore: AI indica ${numArgomenti} argomenti, ma 0 estratti. Risposta: "${analysisText}"`, true); return; }
        if (argomentiList.length !== numArgomenti) { console.warn(`Avviso: Argomenti dichiarati (${numArgomenti}) vs estratti (${argomentiList.length}). Si usano gli estratti.`); }
    } else {
        displayStatus("Nessun argomento identificato nel programma.", false);
        document.getElementById(START_BUTTON_ID).disabled = false; document.getElementById(API_KEY_INPUT_ID).disabled = false; return;
    }

    displayStatus(`Fase 1 OK. ${argomentiList.length} argomenti. Generazione riassunti...`);

    const [prefLunghezza, prefLessico, prefColori, prefCreativita, prefSchematico] = programData.preferences;

    for (let i = 0; i < argomentiList.length; i++) {
        const argomento = argomentiList[i];

        if (i > 0) {
            let currentDelay = 7000; // Base delay 7 secondi (circa 8-9 RPM max)
            if (prefLunghezza >= 4) { // Per riassunti molto lunghi che consumano TPM
                currentDelay = Math.max(currentDelay, 15000); // Almeno 15 secondi
            } else if (prefLunghezza === 3) {
                currentDelay = Math.max(currentDelay, 10000); // Almeno 10 secondi
            }
            displayStatus(`Pausa di ${Math.round(currentDelay / 1000)}s per limiti API prima di "${argomento}"...`);
            await new Promise(resolve => setTimeout(resolve, currentDelay));
        }

        displayStatus(`Ricerca  generazione riassunto per: "${argomento}" (${i + 1}/${argomentiList.length})`);

        let lunghezzaDescrittivaPrompt;
        let requestedMaxTokens;

        switch (prefLunghezza) {
            case 0:
                lunghezzaDescrittivaPrompt = "DEVE ESSERE ESTREMAMENTE BREVE E CONCISO. Fornisci solo i 2-3 concetti fondamentali o una definizione sintetica. Non più di 50-100 parole. Pensa a una voce di glossario.";
                requestedMaxTokens = 500;
                break;
            case 1:
                lunghezzaDescrittivaPrompt = "DEVE ESSERE BREVE. Copri i punti principali in modo succinto. Circa 150-300 parole, 2-3 paragrafi al massimo.";
                requestedMaxTokens = 1500;
                break;
            case 2:
                lunghezzaDescrittivaPrompt = "DEVE AVERE UNA LUNGHEZZA NORMALE/STANDARD. Fornisci una buona panoramica, coprendo gli aspetti essenziali. Circa 400-700 parole.";
                requestedMaxTokens = 4000;
                break;
            case 3:
                lunghezzaDescrittivaPrompt = "DEVE ESSERE DI LUNGHEZZA MEDIA, PIUTTOSTO DETTAGLIATO. Approfondisci i concetti chiave, fornisci alcuni esempi. Circa 800-1500 parole.";
                requestedMaxTokens = 10000;
                break;
            case 4:
                lunghezzaDescrittivaPrompt = "DEVE ESSERE SIGNIFICATIVAMENTE LUNGO E DETTAGLIATO. Esplora l'argomento con buona profondità, includendo sotto-argomenti, esempi, analisi. Circa 2000-3500 parole.";
                requestedMaxTokens = 30000;
                break;
            case 5:
                lunghezzaDescrittivaPrompt = "DEVE ESSERE ESTREMAMENTE LUNGO, PROFONDAMENTE DETTAGLIATO ED ESAUSTIVO. Un 'deep dive' completo. Esplora ogni aspetto, sotto-temi, molteplici esempi, contestualizzazione, analisi. Oltre 4000 parole, puntando a un elaborato ricco e completo.";
                requestedMaxTokens = MODEL_OUTPUT_TOKEN_LIMIT - 2000; // Buffer di 2000 token
                break;
            default:
                lunghezzaDescrittivaPrompt = "DEVE AVERE UNA LUNGHEZZA NORMALE/STANDARD.";
                requestedMaxTokens = 4000;
        }

        if (requestedMaxTokens >= MODEL_OUTPUT_TOKEN_LIMIT) {
            requestedMaxTokens = MODEL_OUTPUT_TOKEN_LIMIT - 100;
        }
        if (requestedMaxTokens <=0) { requestedMaxTokens = 500; }

        const secondPromptText = `Sei un ricercatore esperto e un autore di testi didattici di altissimo livello, specializzato nel rendere argomenti complessi accessibili e interessanti per studenti liceali.

Il tuo compito è produrre un elaborato completo, accurato e approfondito sull'argomento: "${argomento}"

Istruzioni Fondamentali:
1.  **Ricerca e Conoscenza:** Attingi dalla tua vasta conoscenza per trattare l'argomento in modo completo. Immagina di aver consultato diverse fonti autorevoli.
2.  **Struttura e Chiarezza:** Organizza le informazioni in modo logico e fluente.
3.  **Profondità del Contenuto:** Il livello di dettaglio e l'estensione del testo devono corrispondere ESATTAMENTE alla seguente specifica di lunghezza utente.

Preferenze Utente (Scala 0-5):
*   **Lunghezza del Riassunto (Valore: ${prefLunghezza}): ${lunghezzaDescrittivaPrompt}**
*   Complessità del Lessico (Valore: ${prefLessico}): (0=molto semplice; 3=standard; 5=ricco e preciso, termini tecnici spiegati)
*   Uso di Colori (Valore: ${prefColori}): (0=no colori; 5=uso frequente e strategico. Usa <span> con style="color: #..."; scegli colori leggibili su sfondo scuro come lightblue, lightgreen, gold, lightpink, lightcoral.)
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

        try {
            const summaryConfig = {
                temperature: 0.3 + (prefCreativita * 0.1),
                maxOutputTokens: requestedMaxTokens,
            };
            console.log(`Richiesta API per "${argomento}" con config:`, summaryConfig);

            const responseSummary = await genAIInstance.models.generateContent({
                model: NOME_MODELLO_API,
                contents: secondPromptContents,
                config: summaryConfig
            });










































            
            let summaryHtml = "";
            if (responseSummary && typeof responseSummary.text === 'string') {
                summaryHtml = responseSummary.text;
                console.log(`Riassunto per "${argomento}" gen., lunghezza: ${summaryHtml.length} chars.`);
            } else {
                console.warn(`Risposta non valida per "${argomento}".`, responseSummary);
                summaryHtml = `<p style="color:orange;">Impossibile generare riassunto per "${argomento}". Risposta API non valida.</p>`;
            }
            const argomentoDiv = document.createElement('div');
            argomentoDiv.classList.add('argomento-summary');
            argomentoDiv.innerHTML = summaryHtml;
            resultsContainer.appendChild(argomentoDiv);
        } catch (error) {
            console.error(`Errore API gen. riassunto per "${argomento}":`, error);
            const errorDiv = document.createElement('div');
            errorDiv.classList.add('argomento-summary');
            let detailedErrorMessage = error.message;
            errorDiv.innerHTML = `<h2 style="color:red;">Errore per ${argomento}</h2><p style="color:orange;">Impossibile generare: ${detailedErrorMessage}</p>`;
            resultsContainer.appendChild(errorDiv);
        }
    } // Fine loop for argomenti

    displayStatus("Elaborazione completata! Controlla i risultati.", false);
    document.getElementById(START_BUTTON_ID).style.display = 'none';
    document.getElementById(API_KEY_INPUT_ID).style.display = 'none';
    const apiKeyLabel = document.querySelector('label[for="apiKeyInput"]');
    if(apiKeyLabel) apiKeyLabel.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof GoogleGenAI === 'undefined') {
        console.error("Errore critico: GoogleGenAI non importato.");
        displayStatus("Errore critico: SDK Google non caricato. Controlla console.", true);
        const sb = document.getElementById(START_BUTTON_ID); if(sb) sb.disabled = true;
        return;
    }
    const storedData = localStorage.getItem('programDataForLogic');
    if (!storedData) {
        displayStatus("Errore: Dati programma non trovati. Riprova.", true);
        const sb = document.getElementById(START_BUTTON_ID); if(sb) sb.disabled = true;
        return;
    }
    const programData = JSON.parse(storedData);
    const apiKeyInput = document.getElementById(API_KEY_INPUT_ID);
    const startButton = document.getElementById(START_BUTTON_ID);
    const downloadButton = document.getElementById(DOWNLOAD_PDF_BUTTON_ID);

    startButton.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) { displayStatus("Inserisci API Key Gemini.", true); return; }
        try {
            genAIInstance = new GoogleGenAI({ apiKey: apiKey });
            displayStatus("API Key OK. Elaborazione...");
            startButton.disabled = true; apiKeyInput.disabled = true;
            await processProgramAndGenerateSummaries(programData);
            if (document.getElementById(RESULTS_CONTAINER_ID).hasChildNodes()) {
                downloadButton.style.display = 'inline-block';
            } else { displayStatus("Nessun riassunto generato o errori.", true); }
        } catch (error) {
            console.error("Errore principale:", error);
            displayStatus(`Errore: ${error.message}.`, true);
            startButton.disabled = false; apiKeyInput.disabled = false;
        }
    });
    downloadButton.addEventListener('click', () => {
        const rc = document.getElementById(RESULTS_CONTAINER_ID);
        if (!rc.hasChildNodes() || rc.innerHTML.trim() === "") {
            alert("Niente da stampare/salvare."); return;
        }
        window.print();
    });
    document.querySelector(".bottone_salva").addEventListener('click',function(){
        
    });
});




