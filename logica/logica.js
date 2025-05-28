// logica.js
import { GoogleGenAI } from "https://esm.run/@google/genai";

let genAIInstance; // Istanza di GoogleGenAI

// ID degli elementi HTML
const API_KEY_INPUT_ID = 'apiKeyInput';
const START_BUTTON_ID = 'startButton';
const RESULTS_CONTAINER_ID = 'resultsContainer';
const STATUS_MESSAGE_ID = 'statusMessage';
const DOWNLOAD_PDF_BUTTON_ID = 'downloadPdfButton';

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

// Funzione principale per elaborare il programma e generare i riassunti
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
Non aggiungere altro testo, introduzioni, o formattazioni (es. markdown, grassetto). Fornisci solo il numero seguito dall'elenco come testo puro.

Esempio di output atteso: 3;Argomento 1 con contesto;Argomento 2 con contesto;Argomento 3 con contesto
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
        return;
    }

    let analysisText;
    try {
        const analysisConfig = {
            temperature: 0.2,
            maxOutputTokens: 1500,
        };
        const response = await genAIInstance.models.generateContent({
            model: "gemini-1.5-flash-latest",
            contents: firstPromptContents,
            config: analysisConfig
        });
        if (!response || typeof response.text !== 'string') {
            throw new Error("La risposta API per l'analisi del programma non contiene testo valido.");
        }
        analysisText = response.text;
        console.log("TESTO ANALISI PROGRAMMA DALL'AI:", analysisText);
    } catch (error) {
        console.error("Errore API durante l'analisi del programma:", error);
        displayStatus(`Errore API (Fase 1): ${error.message}. Controlla la console.`, true);
        document.getElementById(START_BUTTON_ID).disabled = false;
        document.getElementById(API_KEY_INPUT_ID).disabled = false;
        return;
    }

    const analysisParts = analysisText.split(';');
    if (!analysisParts || analysisParts.length === 0) {
        displayStatus(`Errore: Formato risposta analisi programma non valido (vuoto). Risposta: "${analysisText}"`, true); return;
    }
    const numArgomentiStr = analysisParts[0].trim();
    const numArgomenti = parseInt(numArgomentiStr, 10);
    if (isNaN(numArgomenti) || numArgomenti < 0) {
        displayStatus(`Errore: Numero di argomenti non valido ('${numArgomentiStr}') nella risposta: "${analysisText}"`, true); return;
    }
    let argomentiList = [];
    if (numArgomenti > 0) {
        if (analysisParts.length > 1) {
            argomentiList = analysisParts.slice(1).map(arg => arg.trim()).filter(arg => arg.length > 0);
        }
        if (argomentiList.length === 0) {
            displayStatus(`Errore: L'AI ha indicato ${numArgomenti} argomenti, ma nessuno è stato estratto. Risposta: "${analysisText}"`, true); return;
        }
        if (argomentiList.length !== numArgomenti) {
            console.warn(`Avviso: Numero argomenti dichiarato (${numArgomenti}) vs estratti (${argomentiList.length}). Si usano gli estratti.`);
        }
    } else {
        displayStatus("Nessun argomento identificato nel programma.", false);
        document.getElementById(START_BUTTON_ID).disabled = false;
        document.getElementById(API_KEY_INPUT_ID).disabled = false;
        return;
    }

    displayStatus(`Fase 1 completata. Trovati ${argomentiList.length} argomenti. Inizio generazione riassunti...`);

    const [prefLunghezza, prefLessico, prefColori, prefCreativita, prefSchematico] = programData.preferences;

    for (let i = 0; i < argomentiList.length; i++) {
        const argomento = argomentiList[i];
        displayStatus(`Ricerca e generazione riassunto per: "${argomento}" (${i + 1}/${argomentiList.length})`);

        const secondPromptText = `Sei un esperto accademico e un eccellente divulgatore, incaricato di creare materiale di studio di alta qualità per studenti delle scuole superiori.

Il tuo compito è generare un riassunto completo e dettagliato sull'argomento seguente: "${argomento}"

Per fare ciò, devi:
1.  **Comprendere a fondo l'argomento specificato.** Considera il contesto fornito (se presente nell'argomento stesso, es. "La Rivoluzione Francese: dal 1789 al Terrore").
2.  **Attingere alla tua vasta base di conoscenza** per raccogliere tutte le informazioni essenziali relative a questo argomento. Immagina di dover spiegare questo concetto a qualcuno che non lo conosce.
3.  **Strutturare le informazioni** in modo logico e coerente.
4.  **Produrre un riassunto esaustivo** che copra gli aspetti chiave, le definizioni, gli eventi importanti, le figure significative, le cause, le conseguenze, e qualsiasi altro dettaglio rilevante per una comprensione completa dell'argomento a livello di scuola superiore.
5.  **Adattare lo stile e il formato del riassunto** finale in base alle seguenti preferenze dell'utente (scala 0-5):
    *   Lunghezza del riassunto: ${prefLunghezza} (0=estremamente conciso, solo i punti salienti; 3=bilanciato; 5=molto esteso, approfondito e ricco di dettagli)
    *   Complessità del lessico: ${prefLessico} (0=linguaggio molto semplice e accessibile; 3=standard, chiaro; 5=lessico preciso, tecnico o formale se appropriato all'argomento, ma sempre comprensibile per uno studente)
    *   Uso di colori nel testo (per evidenziare): ${prefColori} (0=nessun colore; 3=uso moderato; 5=uso più frequente di colori per parole chiave, date, nomi o sezioni importanti. Usa tag <span> con stili inline, es. style="color: #lightcoral;", scegliendo colori leggibili su sfondo scuro come lightblue, lightgreen, gold, lightpink.)
    *   Livello di creatività/originalità nella presentazione: ${prefCreativita} (0=esposizione puramente fattuale e diretta; 3=qualche riformulazione interessante; 5=presentazione più coinvolgente, con possibili analogie o collegamenti pertinenti, mantenendo l'accuratezza)
    *   Struttura schematica: ${prefSchematico} (0=testo prevalentemente discorsivo; 3=buona suddivisione in paragrafi e alcuni elenchi; 5=uso intensivo di sottotitoli chiari [<h2>, <h3>], elenchi puntati/numerati [<ul>, <ol>, <li>], e paragrafi brevi e focalizzati per facilitare la lettura e la memorizzazione. Se appropriato, considera l'uso di tabelle semplici per confronti o dati.)

Output richiesto:
*   Il riassunto DEVE essere formattato in HTML valido e semanticamente corretto.
*   Il titolo principale del riassunto (usando <h1>) deve essere il nome dell'argomento: "${argomento}".
*   Assicurati che il contenuto sia accurato, ben scritto e facile da comprendere per uno studente delle superiori.
*   Non includere \`\`\`html all'inizio o \`\`\` alla fine. Fornisci solo il blocco di codice HTML del riassunto.
*   Non aggiungere commenti personali o frasi come "Ecco il riassunto che hai chiesto". Inizia direttamente con il titolo <h1>.
`;
        const secondPromptContents = [{ text: secondPromptText }];

        try {
            let requestedMaxTokens = 1024 + (prefLunghezza * 512);
            const modelOutputTokenLimit = 100000; // Limite per gemini-1.5-flash (circa, verifica documentazione ufficiale)
            if (requestedMaxTokens > modelOutputTokenLimit) {
                console.warn(`MaxOutputTokens richiesti (${requestedMaxTokens}) per "${argomento}" superano il limite del modello (${modelOutputTokenLimit}). Saranno limitati.`);
                requestedMaxTokens = modelOutputTokenLimit;
            }

            const summaryConfig = {
                temperature: 0.4 + (prefCreativita * 0.1),
                maxOutputTokens: requestedMaxTokens,
            };

            const responseSummary = await genAIInstance.models.generateContent({
                model: "gemini-2.5-flash-preview-05-20",
                contents: secondPromptContents,
                config: summaryConfig
            });

            let summaryHtml = "";
            if (responseSummary && typeof responseSummary.text === 'string') {
                summaryHtml = responseSummary.text;
            } else {
                console.warn(`Risposta non valida o senza testo per argomento "${argomento}".`, responseSummary);
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
            // Tenta di estrarre più info se disponibili (questo è speculativo, dipende da come l'errore è strutturato)
            if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
                 detailedErrorMessage = error.response.data.error.message;
            }
            errorDiv.innerHTML = `<h2 style="color:red;">Errore per ${argomento}</h2><p style="color:orange;">Impossibile generare: ${detailedErrorMessage}</p>`;
            resultsContainer.appendChild(errorDiv);
        }
    }
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
        if (!apiKey) {
            displayStatus("Inserisci API Key Gemini.", true); return;
        }
        try {
            genAIInstance = new GoogleGenAI({ apiKey: apiKey });
            displayStatus("API Key OK. Elaborazione...");
            startButton.disabled = true; apiKeyInput.disabled = true;
            await processProgramAndGenerateSummaries(programData);
            if (document.getElementById(RESULTS_CONTAINER_ID).hasChildNodes()) {
                downloadButton.style.display = 'inline-block';
            } else {
                 displayStatus("Nessun riassunto o errori.", true);
            }
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
});