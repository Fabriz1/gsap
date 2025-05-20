
let tl = gsap.timeline()
tl.from(".carica", {
    duration: 2,
    opacity: 0,
    x: "-100%",
    ease: "power2.out",
    scale: 0.5,


})
    .to(".descrizione-carica", {
        opacity: 1,
        scale: 1,
    })
    .to(".carica-file", {
        opacity: 1,
        scale: 1,

    })
    .to(".icona-clicca", {
        y: 10,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
    }
    ).to(".icona-clicca", {
        rotation: 360,
        duration: 1,
        repeat: -1,
        repeatDelay: Math.floor(Math.random() * 5) + 1,
        ease: "power2.inOut",


    }
    )



//ora inizia la logica per prendere il pdf inserito
// 1. Riferimento al div
const caricaFileDiv = document.getElementById('carica-file');

// 2. Creazione dell'input file (nascosto)
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'application/pdf';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);


// 3. Variabile in cui salveremo l’URL del PDF
let pdf = null;

// 4. Apri il file picker al click sul div
caricaFileDiv.addEventListener('click', () => {
    fileInput.click();
});

// 5. Al cambio di selezione, salva l’URL nella variabile `pdf`
fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;              // nessuna selezione
    // genera un blob URL e salvalo in `pdf`
    pdf = URL.createObjectURL(file);
    let tl2 = gsap.timeline()
    tl2.to(".carica", {
        duration: 1.5,
        opacity: 0,
        scale: 0.7,
        x: "100%",
        ease: "power2.out",
    })
    .to(".opzioni", {
        duration: 2,
        opacity: 1,
        x: "0%",
        ease: "power2.out",
        scale: 1,
    }).to(".descrizione-opzioni", {
        opacity: 1,
        scale: 1,
    }).to(".def-opzioni",{
        opacity: 1,
        scale: 1,
    })

})
