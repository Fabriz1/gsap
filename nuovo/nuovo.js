gsap.registerPlugin(DrawSVGPlugin, SplitText, Draggable)

let fileOtesto; //se è falso è stato caricato testo altriemnti il file
let tl = gsap.timeline();
let split = SplitText.create(".testo1", { type: "chars" });
let split2 = SplitText.create(".testo2", { type: "chars" });
gsap.set(split.chars, {
    opacity: 0
})
gsap.set(split2.chars, {
    opacity: 0
})

tl.to(".carica-file", {
    x: 20,
    opacity: 1,
    duration: 2
}).to(".carica-testo", {
    x: -20,
    opacity: 1,
    duration: 2
}, "<")
    .fromTo("#mano", {
        drawSVG: "0% 0%"
    },
        {
            duration: 2,
            drawSVG: "0% 100%"
        }, "<+0.5").to(split.chars, {
            duration: 1,
            y: -40,         // animate from 100px below
            opacity: 1,   // fade in from opacity: 0 and visibility: hidden
            stagger: {
                each: 0.01,  // 0.05 seconds between each
                from: "random"
            }

        }, "<").to(split2.chars, {
            duration: 1,
            y: -40,         // animate from 100px below
            opacity: 1,   // fade in from opacity: 0 and visibility: hidden
            stagger: {
                each: 0.01,  // 0.05 seconds between each
                from: "random"
            }

        }, "<").to(".incolla", {
            opacity: 1

        }, "<").to(".inc", {
            scale: 1.1
        }, "<+0.2").to(".inc", {
            ease: "power2.in",
            duration: 0.5,
            scale: 0.4
        }, "<+0.5").to(".inc", {
            x: 165,
            y: -55,
            duration: 0.7,
            ease: "power1.out"
        }, "<+0.5")

    .to(".clicca", {
        y: 20,

        yoyo: true,
        ease: "power2.out",
        repeat: -1
    })

const incollaTimeline = gsap.timeline({ paused: true });

incollaTimeline
    .to(".incolla", {
        scale: 3.5,
        x: -450,
        background: "#3a3a3adc",
        borderWidth: "1px",
        duration: 0.7, // Aggiungi duration per ogni tween

    })
    .to(".inc", {
        scale: 0.2,
        x: 180,
        y: -60,
        duration: 0.7 // Aggiungi duration
    }, "<")
    .to(".conf", {
        x: 22,
        y: 18,
        opacity: 1,
        zIndex: 20,
        duration: 0.5 // Aggiungi duration
    }, "<")
    .to(".back", {
        x: -22,
        y: -16,
        opacity: 1,
        zIndex: 30,
        duration: 0.5 // Aggiungi duration
    }, "<")
    .to(".carica-file", {
        background: "black",
        borderColor: "black",
        boxShadow: "0 0 0",
        duration: 0.5 // Aggiungi duration
    }, "<")
    .to(".testo1", {
        opacity: 0,
        duration: 0.3 // Aggiungi duration
    }, "<")
    .to(".clicca", {
        opacity: 0,
        duration: 0.3 // Aggiungi duration
    }, "<")
    .to(".carica-testo", {
        background: "black",
        borderColor: "black",
        boxShadow: "0 0 0",
        duration: 0.5 // Aggiungi duration
    }, "<")
    .to(".testo2", {
        opacity: 0,
        duration: 0.3 // Aggiungi duration
    }, "<")
    .to("#text-input-area", {
        opacity: 1,
        scale: 1,
        pointerEvents: 'auto',
        duration: 0.7,
        ease: "back.out(1.7)"
    }, "-=0.3");


document.querySelector(".incolla").addEventListener("click", function () {
    console.log("incolla")
    // Quando clicchi su .incolla, vuoi sempre che l'animazione parta dall'inizio in avanti.
    // .restart() è il metodo perfetto per questo, perché resetta la timeline al progress 0 e la riproduce.
    incollaTimeline.restart();
});

// Event listener per .back (che dovrebbe far invertire l'animazione)
document.querySelector(".back").addEventListener("click", function (event) {
    event.stopPropagation()
    // Se la timeline non è già invertita (cioè sta andando avanti o è alla fine), invertila.
    // Questo previene chiamate multiple a reverse() quando è già al suo punto di inizio.
    if (!incollaTimeline.reversed()) {
        incollaTimeline.reverse();
    }
});

let fakeFile = document.querySelector(".file")
document.querySelector(".carica-file").addEventListener("click", function () {
    fakeFile.click()
})

let testoIncollato;
let areatesto = document.getElementById('text-input-area');
document.querySelector(".conf").addEventListener("click", function (event) {
    event.stopPropagation()
    fileOtesto= false 
    // Se la timeline non è già invertita (cioè sta andando avanti o è alla fine), invertila.
    // Questo previene chiamate multiple a reverse() quando è già al suo punto di inizio.
    if (!incollaTimeline.reversed()) {
        incollaTimeline.reverse();
    }
    testoIncollato = areatesto.value;
    console.log(testoIncollato)
    gsap.timeline().to(".carica-file", {
        x: "+8%",
        duration: 1,
        opacity: 0
    }, "+1").to(".carica-testo", {
        x: "-8%",
        duration: 1,
        opacity: 0
    }, "<").to(".preferenze", {
        scale: 1.2,
        duration: 2,
        zIndex: 1000,
        opacity: 1,
    }, "<+1.4").to("#blob-container",{
        duration: 3,
        opacity:1
    },"<+0.1").to(".carica",{
        display: "none"
    })

})
fakeFile.addEventListener('change', function (event) {
    fileOtesto = true; // Indica che è stato caricato un file
    // Se la timeline non è già invertita (cioè sta andando avanti o è alla fine), invertila.
    // Questo previene chiamate multiple a reverse() quando è già al suo punto di inizio.
    
    gsap.timeline().to(".carica-file", {
        x: "+8%",
        duration: 1,
        opacity: 0
    }, "+1").to(".carica-testo", {
        x: "-8%",
        duration: 1,
        opacity: 0
    }, "<").to(".preferenze", {
        scale: 1.2,
        duration: 2,
        zIndex: 1000,
        opacity: 1,
    }, "<+1.4").to("#blob-container",{
        duration: 3,
        opacity:1
    },"<+0.1").to(".carica",{
        display: "none"
    })

})




document.querySelector(".carica-file").addEventListener("mouseenter", function () {
gsap.to(".carica-file", {
    scale: 1.03,
    duration: 0.3,
    ease: "power2.out"
});
});
document.querySelector(".carica-file").addEventListener("mouseleave", function () {
gsap.to(".carica-file", {
    scale: 1,
    duration: 0.3,
    ease: "power2.out"
});
});


document.querySelector(".carica-testo").addEventListener("mouseenter", function () {
gsap.to(".carica-testo", {
    scale: 1.03,
    duration: 0.3,
    ease: "power2.out"
});
});
document.querySelector(".carica-testo").addEventListener("mouseleave", function () {
gsap.to(".carica-testo", {
    scale: 1,
    duration: 0.3,
    ease: "power2.out"
});
});



document.querySelector(".conf-preferenze").addEventListener("click", function () {
    const preferenzeCorrenti = window.pentagonChart.getValues();

    // Definisci le variabili per le preferenze arrotondate
    let lunghezza;
    let lessico;
    let colori;
    let creativita;
    let schematico;
    gsap.timeline().to(".preferenze", {
    opacity: 0,
    y: -200,
    scale: 0.7,
    }).to("#blob-container", {
        opacity: 0,
    },"<").to(".preferenze", {
        display: "none",
    })
    if (preferenzeCorrenti && preferenzeCorrenti.length === 5) {
        lunghezza = Math.round(preferenzeCorrenti[0]);
        lessico = Math.round(preferenzeCorrenti[1]);
        colori = Math.round(preferenzeCorrenti[2]);
        creativita = Math.round(preferenzeCorrenti[3]);
        schematico = Math.round(preferenzeCorrenti[4]);

        // Log per verifica (puoi rimuoverlo in produzione)
        console.log("Preferenze salvate:");
        console.log("Lunghezza:", lunghezza);
        console.log("Lessico:", lessico);
        console.log("Colori:", colori);
        console.log("Creatività:", creativita);
        console.log("Schematico:", schematico);

        // Qui puoi fare qualcos'altro con queste variabili,
        // ad esempio inviarle a un server o usarle per altre logiche nell'applicazione.

    } else {
        console.error("Errore: Impossibile recuperare le preferenze dal grafico.");
    }

});











console.log("DEBUG: Codice raggiunto PRIMA della definizione di BLOB_COLORS_RGB"); // LOG 1




const BLOB_COLORS_RGB = [
    [255, 100, 100], // Rosso chiaro
    [100, 255, 100], // Verde chiaro
    [100, 100, 255], // Blu chiaro
    [255, 255, 100], // Giallo chiaro
    [255, 100, 255]  // Magenta chiaro
];
console.log("DEBUG: BLOB_COLORS_RGB definito"); // LOG 2
// Posizioni iniziali e dimensioni massime indicative per i blob
// Queste sono relative al viewport. Puoi giocarci molto.
const BLOB_CONFIG = [
    { initialX: '40vw', initialY: '15vh', maxSize: '100vmin' },
    { initialX: '55vw', initialY: '30vh', maxSize: '90vmin' }, // Un po' più a destra
    { initialX: '40vw', initialY: '50vh', maxSize: '100vmin' }, // Un po' più in basso
    { initialX: '30vw', initialY: '35vh', maxSize: '110vmin' },
    { initialX: '50vw', initialY: '45vh', maxSize: '95vmin' }
];
console.log("DEBUG: BLOB_CONFIG definito"); // LOG 3

let blobElements = []; // Array per tenere traccia degli elementi blob DOM
console.log("DEBUG: blobElements inizializzato come array vuoto"); // LOG 4

const KEYFRAME_ANIMATIONS = [
    'floatAroundSmooth1',
    'floatAroundSmooth2',
    'floatAroundSmooth3',
    'floatAroundSmooth4',
    'floatAroundSmooth5'
];


function inizializzaBlobs() {
    console.log("DEBUG: DENTRO inizializzaBlobs - INIZIO (con animazioni @keyframes)");

    let blobContainer = document.getElementById('blob-container');
    if (!blobContainer) {
        blobContainer = document.createElement('div');
        blobContainer.id = 'blob-container';
        if (document.body) {
            document.body.insertBefore(blobContainer, document.body.firstChild);
            console.log("DEBUG: blobContainer creato e inserito nel body.");
        } else {
            console.error("ERRORE CRITICO: document.body non trovato in inizializzaBlobs!");
            return; // Esci se il body non c'è, non possiamo aggiungere blob
        }
    }

    // Svuota i blob esistenti se la funzione viene chiamata più volte (opzionale, ma buona pratica)
    // blobElements.forEach(blob => blob.remove()); // Rimuove dal DOM
    // blobElements = []; // Resetta l'array

    BLOB_COLORS_RGB.forEach((colorRgb, index) => {
        const blob = document.createElement('div');
        blob.classList.add('color-blob'); // La classe CSS gestirà la forma, il blur, il mix-blend-mode, ecc.
        
        // Imposta il colore di sfondo solido (il blur e il mix-blend-mode faranno il resto)
        blob.style.backgroundColor = `rgb(${colorRgb[0]}, ${colorRgb[1]}, ${colorRgb[2]})`;
        
        // Posizione iniziale base (left, top)
        const config = BLOB_CONFIG[index % BLOB_CONFIG.length]; // Usa modulo per sicurezza se ci sono più blob che config
        blob.style.left = config.initialX;
        blob.style.top = config.initialY;

        // Dimensioni iniziali (width/height a 0px) e opacità (a 0) per l'animazione di entrata
        // gestita da aggiornaBlobs e dalle transizioni CSS su width, height, opacity.
        blob.style.width = '0px';
        blob.style.height = '0px';
        blob.style.opacity = '0';

        // Applica l'animazione @keyframes CSS per il movimento continuo
        if (KEYFRAME_ANIMATIONS.length > 0) {
            const animationName = KEYFRAME_ANIMATIONS[index % KEYFRAME_ANIMATIONS.length];
            const duration = Math.random() * 10 + 20; // Durata casuale tra 20s e 30s (più lunga = più lento)
            const delay = Math.random() * 7;          // Delay iniziale casuale fino a 7s per sfasare
            
            blob.style.animationName = animationName;
            blob.style.animationDuration = `${duration.toFixed(2)}s`;
            blob.style.animationIterationCount = 'infinite';
            blob.style.animationTimingFunction = 'ease-in-out'; // <--- CAMBIAMENTO IMPORTANTE
            blob.style.animationDelay = `${delay.toFixed(2)}s`;

            // Assegna una direzione alternata casualmente per più varietà
            if (Math.random() > 0.5) {
                blob.style.animationDirection = 'alternate';
            }
        } else {
            console.warn("Nessuna animazione @keyframes definita in KEYFRAME_ANIMATIONS. I blob non si muoveranno con @keyframes.");
        }

        blobContainer.appendChild(blob);
        blobElements.push(blob);
    });

    console.log("DEBUG: DENTRO inizializzaBlobs - FINE. Creati e configurati per animazione " + blobElements.length + " blob.");
}


const BLOB_MOVE_TRANSITION_DURATION_MS = 2000; // Esempio: 2s (2000ms) - DEVI METTERE QUELLO DEL TUO CSS

// Intervallo minimo e massimo prima che un blob scelga una nuova destinazione
const MIN_INTERVAL_MS = 3000; // Esempio: minimo 3 secondi
const MAX_INTERVAL_MS = 7000; // Esempio: massimo 7 secondi

function animateSingleBlob(blob) {
    if (!blob) return;

    // Calcola nuove posizioni X e Y casuali
    const moveX = (Math.random() - 0.5) * 30; // Spostamento tra -15vw e +15vw
    const moveY = (Math.random() - 0.5) * 25; // Spostamento tra -12.5vh e +12.5vh
    
    // Applica la trasformazione
    blob.style.transform = `translate(${moveX}vw, ${moveY}vh)`;
    // console.log(`Blob ${blob.id || 'anonimo'} si muove a X:${moveX.toFixed(1)}vw, Y:${moveY.toFixed(1)}vh`);

    // Calcola quando questo specifico blob dovrebbe muoversi di nuovo
    // L'intervallo deve essere ALMENO la durata della transizione CSS
    // per permettere al movimento di completarsi.
    const nextMoveDelay = Math.max(
        BLOB_MOVE_TRANSITION_DURATION_MS,
        Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS) + MIN_INTERVAL_MS
    );

    // Imposta il timeout per il prossimo movimento di QUESTO blob
    setTimeout(() => animateSingleBlob(blob), nextMoveDelay);
}

// Questa funzione viene chiamata una volta per avviare l'animazione per tutti i blob
function startBlobAnimations() {
    if (blobElements.length === 0) return;
    blobElements.forEach((blob) => {
        const initialDelay = Math.random() * 2000; 
        setTimeout(() => animateSingleBlob(blob), initialDelay);
    });
}





function aggiornaBlobs() {
   
    if (!window.pentagonChart || blobElements.length === 0) {
        console.warn("PentagonChart o blob non ancora inizializzati per aggiornaBlobs");
        return;
    }

    const values = window.pentagonChart.getValues(); 
    console.log("DEBUG: DENTRO aggiornaBlobs - Valori ottenuti da PentagonChart:"); // LOG 7.A
    values.forEach((value, index) => {
        const blob = blobElements[index];
        if (!blob) return;

        const config = BLOB_CONFIG[index];
        const normalizedValue = value / 5; 

     
      
        blob.style.opacity = (normalizedValue * 0.7).toFixed(2);

       
        const currentSize = normalizedValue * parseFloat(config.maxSize); // Calcola la dimensione numerica
        blob.style.width = `${currentSize}${config.maxSize.replace(/[0-9.-]/g, '')}`; // Es. 80vmin
        blob.style.height = `${currentSize}${config.maxSize.replace(/[0-9.-]/g, '')}`;
        
    
    });

  console.log("DEBUG: DENTRO aggiornaBlobs - FINE"); // LOG 8
}
console.log("DEBUG: Funzioni inizializzaBlobs e aggiornaBlobs definite"); // LOG 9





class PentagonChart {
    constructor() {
        console.log("DEBUG: DENTRO PentagonChart constructor - INIZIO"); // LOG 10
        this.center = { x: 200, y: 200 };
        this.radius = 120;
        this.labels = ['Lunghezza', 'Lessico', 'Colori', 'Creatività', 'Schematico'];
        this.values = [2.5, 2.5, 2.5, 2.5, 2.5]; // Inizia da metà
        this.isDragging = false;
        this.dragIndex = -1;

        this.init();
        console.log("DEBUG: DENTRO PentagonChart constructor - FINE"); // LOG 11
    }

    init() {
        console.log("DEBUG: DENTRO PentagonChart init - INIZIO"); // LOG 12
        this.createGrid();
        this.createAxes();
        this.createControlPoints();
        this.createLabels();
        this.updateDataPolygon();
        this.bindEvents();
        if (blobElements.length === 0) { // Evita inizializzazioni multiple
             inizializzaBlobs();
        }
        console.log("DEBUG: DENTRO PentagonChart init - FINE"); // LOG 13
        
        
    }


    

    // Calcola la posizione di un vertice del pentagono
    getVertexPosition(index, radius = this.radius) {
        const angle = (index * 2 * Math.PI / 5) - (Math.PI / 2);
        return {
            x: this.center.x + Math.cos(angle) * radius,
            y: this.center.y + Math.sin(angle) * radius
        };
    }

    createGrid() {
        const grid = document.querySelector('.grid');

        // Crea 5 livelli di griglia concentrica
        for (let level = 1; level <= 5; level++) {
            const radius = (this.radius / 5) * level;
            const points = [];

            for (let i = 0; i < 5; i++) {
                const pos = this.getVertexPosition(i, radius);
                points.push(`${pos.x},${pos.y}`);
            }

            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', points.join(' '));
            polygon.setAttribute('class', 'pentagon-outline');
            polygon.style.strokeOpacity = level === 5 ? '0.8' : '0.3';
            grid.appendChild(polygon);
        }
    }

    createAxes() {
        const axes = document.querySelector('.axes');

        for (let i = 0; i < 5; i++) {
            const pos = this.getVertexPosition(i);
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', this.center.x);
            line.setAttribute('y1', this.center.y);
            line.setAttribute('x2', pos.x);
            line.setAttribute('y2', pos.y);
            line.setAttribute('class', 'axis-line');
            axes.appendChild(line);
        }
    }

    createControlPoints() {
        const pointsGroup = document.querySelector('.control-points');

        for (let i = 0; i < 5; i++) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('r', '5');
            circle.setAttribute('class', 'control-point');
            circle.setAttribute('data-index', i);
            pointsGroup.appendChild(circle);

            // Posiziona alla metà iniziale
            this.updateControlPoint(i);
        }
    }

    createLabels() {
        const labelsGroup = document.querySelector('.labels');

        for (let i = 0; i < 5; i++) {
            const pos = this.getVertexPosition(i, this.radius + 30);
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', pos.x);
            text.setAttribute('y', pos.y);
            text.setAttribute('class', 'label');
            text.textContent = this.labels[i];
            text.id= `label-${i}`; // Aggiungi un ID unico per ogni label
            labelsGroup.appendChild(text);
        }
    }

    updateControlPoint(index) {
        const value = this.values[index];
        const radius = (value / 5) * this.radius;
        const pos = this.getVertexPosition(index, radius);
        const point = document.querySelector(`[data-index="${index}"]`);
        point.setAttribute('cx', pos.x);
        point.setAttribute('cy', pos.y);
    }

    updateDataPolygon() {
        console.log("DEBUG: DENTRO PentagonChart updateDataPolygon - INIZIO"); // LOG 12.A
        const points = [];
        for (let i = 0; i < 5; i++) {
            const radius = (this.values[i] / 5) * this.radius;
            const pos = this.getVertexPosition(i, radius);
            points.push(`${pos.x},${pos.y}`);
            console.log(pos);
        }

        const polygon = document.querySelector('.data-polygon');
        polygon.setAttribute('points', points.join(' '));


    }





    getMousePosition(e, svg) {
        const rect = svg.getBoundingClientRect();
        return {
            x: ((e.clientX - rect.left) / rect.width) * 400,
            y: ((e.clientY - rect.top) / rect.height) * 400
        };
    }

    getTouchPosition(e, svg) {
        const rect = svg.getBoundingClientRect();
        const touch = e.touches[0];
        return {
            x: ((touch.clientX - rect.left) / rect.width) * 400,
            y: ((touch.clientY - rect.top) / rect.height) * 400
        };
    }

    handleDrag(mousePos) {
        console.log("DEBUG: DENTRO PentagonChart handleDrag"); // LOG 13.A
        if (!this.isDragging || this.dragIndex === -1) return;

        // Calcola la distanza dal centro lungo l'asse corrente
        const angle = (this.dragIndex * 2 * Math.PI / 5) - (Math.PI / 2);
        const axisX = Math.cos(angle);
        const axisY = Math.sin(angle);

        const deltaX = mousePos.x - this.center.x;
        const deltaY = mousePos.y - this.center.y;

        // Proiezione del mouse sull'asse
        const projection = (deltaX * axisX + deltaY * axisY);
        const distance = Math.max(0, Math.min(this.radius, projection));

        this.values[this.dragIndex] = (distance / this.radius) * 5;
        this.updateControlPoint(this.dragIndex);
        this.updateDataPolygon();
        aggiornaBlobs();
        

    }

    bindEvents() {
        const svg = document.querySelector('.pentagon-svg');
        const points = document.querySelectorAll('.control-point');

        // Mouse events
        points.forEach((point, index) => {
            point.addEventListener('mousedown', (e) => {
                this.isDragging = true;
                this.dragIndex = index;
                point.classList.add('dragging');
                e.preventDefault();
                e.stopPropagation();
            });
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const mousePos = this.getMousePosition(e, svg);
            this.handleDrag(mousePos);
            e.preventDefault();
        });

        document.addEventListener('mouseup', (e) => {
            if (this.isDragging) {
                const draggingPoint = document.querySelector('.control-point.dragging');
                if (draggingPoint) {
                    draggingPoint.classList.remove('dragging');
                }
                this.isDragging = false;
                this.dragIndex = -1;
            }
        });

        // Touch events
        points.forEach((point, index) => {
            point.addEventListener('touchstart', (e) => {
                this.isDragging = true;
                this.dragIndex = index;
                point.classList.add('dragging');
                e.preventDefault();
                e.stopPropagation();
            });
        });

        document.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            const touchPos = this.getTouchPosition(e, svg);
            this.handleDrag(touchPos);
            e.preventDefault();
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            
            if (this.isDragging) {
                const draggingPoint = document.querySelector('.control-point.dragging');
                if (draggingPoint) {
                    draggingPoint.classList.remove('dragging');
                }
                this.isDragging = false;
                this.dragIndex = -1;
            }
            
        });

        // Previeni il drag del browser
        svg.addEventListener('dragstart', e => e.preventDefault());
    }

    // Metodo pubblico per ottenere i valori
    getValues() {
        return this.values.slice();
    }

    // Metodo pubblico per impostare i valori
    setValues(newValues) {
        console.log("DEBUG: DENTRO PentagonChart setValues"); // LOG 13.B
        if (newValues.length === 5) {
            this.values = newValues.map(v => Math.max(0, Math.min(5, v)));
            for (let i = 0; i < 5; i++) {
                this.updateControlPoint(i);
            }
            this.updateDataPolygon();
            
            aggiornaBlobs();
        }
    }
}
console.log("DEBUG: Classe PentagonChart definita"); // LOG 14
// Inizializza il grafico
const chart = new PentagonChart();
console.log("DEBUG: Istanza 'chart' di PentagonChart creata"); // LOG 15
// Rendi accessibile globalmente per eventuali integrazioni
window.pentagonChart = chart;
console.log("DEBUG: window.pentagonChart assegnato"); // LOG 16
if (blobElements.length > 0) { // Assicurati che i blob siano stati creati da init
    console.log("DEBUG: Chiamata iniziale a aggiornaBlobs post-init, blobElements.length:", blobElements.length); // LOG 17
    aggiornaBlobs();
    startBlobAnimations(); // Avvia le animazioni dei blob
}else {console.error("DEBUG: ERRORE POST-INIT: blobElements è vuoto! Non chiamo aggiornaBlobs."); // LOG 18
}

console.log("DEBUG: FINE DELLO SCRIPT nuovo.js"); // LOG 19







function getPreferenze(){

}




function analisiProgramma(){
if(fileOtesto) {

}else{

}
}






