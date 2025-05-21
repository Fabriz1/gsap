let tl = gsap.timeline();
tl.from(".carica", {
    duration: 1.5, // Leggermente più veloce
    opacity: 0,
    x: "-100%",
    ease: "power2.out",
    scale: 0.5,
})
.to(".descrizione-carica", {
    opacity: 1,
    scale: 1,
    duration: 0.7, // Durata per coerenza
}, "-=0.5") // Sovrapponi leggermente l'animazione
.to(".input-container", { // Modificato per animare il nuovo contenitore
    opacity: 1,
    scale: 1,
    duration: 0.7,
}, "-=0.5")
.from(".icona-clicca", { // Modificato per l'icona PDF
    y: -20, // Parte da sopra
    opacity: 0,
    duration: 0.5,
    delay: 0.2 // Piccolo ritardo
})
.to(".icona-clicca", {
    y: 10,
    duration: 0.8, // Leggermente più lento
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut" // Un ease più fluido
});
// L'animazione di rotazione è stata rimossa per semplicità, puoi riaggiungerla se vuoi
// .to(".icona-clicca svg", { // Targettiamo l'SVG interno per la rotazione
//     rotation: 360,
//     duration: 2, // Più lenta
//     repeat: -1,
//     repeatDelay: Math.floor(Math.random() * 3) + 2, // Delay più lungo
//     ease: "power1.inOut",
// });


// Riferimenti agli elementi DOM
const caricaFilePdfDiv = document.getElementById('carica-file-pdf');
const textInputArea = document.getElementById('text-input');
const useTextButton = document.getElementById('use-text-button');
const apiKeyInput = document.getElementById('api-key-input'); // Aggiunto

// Creazione dell'input file (nascosto)
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'application/pdf';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

// Variabili per memorizzare i dati
let pdfFileObject = null; // Salva l'oggetto File del PDF
let inputTextData = null;
let userApiKey = null; // Per l'API key

// Funzione per procedere alla sezione opzioni
function proceedToOptions() {
    let tl2 = gsap.timeline();
    tl2.to(".carica", {
        duration: 1.2, // Leggermente più veloce
        opacity: 0,
        scale: 0.7,
        x: "100%", // Esce verso destra
        ease: "power2.in", // Cambiato ease per l'uscita
    })
    .to(".opzioni", {
        duration: 1.5,
        opacity: 1,
        x: "0%", // Entra da sinistra (come definito in CSS)
        ease: "power2.out",
        scale: 1,
    }, "-=0.5") // Sovrapponi leggermente
    .to(".descrizione-opzioni", {
        opacity: 1,
        scale: 1,
        duration: 0.7,
    }, "-=0.7") // Sovrapponi
    .to(".def-opzioni", {
        opacity: 1,
        scale: 1,
        duration: 0.7,
    }, "-=0.5"); // Sovrapponi
}

// 1. Apri il file picker al click sul div di upload PDF
caricaFilePdfDiv.addEventListener('click', () => {
    fileInput.click();
});

// 2. Al cambio di selezione del file PDF
fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return; // Nessuna selezione

    if (file.type === "application/pdf") {
        pdfFileObject = file; // Salva l'oggetto File
        inputTextData = null; // Resetta l'input testuale
        console.log("PDF Selezionato:", pdfFileObject.name);
        proceedToOptions();
    } else {
        alert("Per favore, carica un file in formato PDF.");
        fileInput.value = ''; // Resetta l'input file se il formato non è corretto
    }
});

// 3. Gestione del pulsante "Usa Questo Testo"
useTextButton.addEventListener('click', () => {
    const text = textInputArea.value.trim();
    if (text) {
        inputTextData = text;
        pdfFileObject = null; // Resetta il file PDF
        console.log("Testo Inserito:", inputTextData.substring(0, 50) + "..."); // Log di anteprima
        proceedToOptions();
    } else {
        alert("Per favore, inserisci del testo nell'area apposita.");
    }
});

// 4. (Opzionale) Memorizzare l'API key quando l'utente la inserisce o quando si passa oltre
// Per ora, la leggiamo quando serve, ma potresti volerla salvare su un evento 'blur' o 'change'
apiKeyInput.addEventListener('change', () => {
    userApiKey = apiKeyInput.value.trim();
    if(userApiKey) {
        console.log("API Key inserita (prime 5 cifre):", userApiKey.substring(0,5) + "...");
    } else {
        console.log("API Key rimossa.");
    }
});


// Esempio di come potresti accedere ai dati più tardi (es. in un pulsante "Genera"):
// document.getElementById('GENERATE_BUTTON_ID').addEventListener('click', () => {
//     userApiKey = apiKeyInput.value.trim(); // Assicurati di avere l'ultima versione
//     if (!userApiKey) {
//         alert("Per favore, inserisci la tua API Key di Google AI Studio.");
//         return;
//     }

//     if (pdfFileObject) {
//         console.log("Processando PDF:", pdfFileObject.name);
//         console.log("Con API Key:", userApiKey.substring(0,5) + "...");
//         // Qui la logica per inviare pdfFileObject e userApiKey al backend o API
//     } else if (inputTextData) {
//         console.log("Processando Testo:", inputTextData.substring(0, 30) + "...");
//         console.log("Con API Key:", userApiKey.substring(0,5) + "...");
//         // Qui la logica per inviare inputTextData e userApiKey al backend o API
//     } else {
//         alert("Nessun contenuto (PDF o testo) fornito!");
//     }
// });