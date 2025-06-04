document.addEventListener('DOMContentLoaded', () => {
    console.log("Script Mobile Caricato per animazione titolo (from) e azioni.");

    const animatedTitle = document.querySelector(".animated-title");
    const mobileHeader = document.querySelector(".mobile-header");
    const mainContent = document.querySelector(".mobile-main-content");
    const actionCards = gsap.utils.toArray(".mobile-action-card");
    const mobileDescription = document.querySelector(".mobile-description");

    if (!animatedTitle) {
        console.error("Elemento .animated-title non trovato!");
        return;
    }

    // Stato iniziale da cui animare (al centro e più grande)
    // Dobbiamo calcolare x e y per centrarlo rispetto alla viewport
    // sapendo che la sua posizione CSS finale è top: 22px, left: 20px
    // e la sua dimensione finale è clamp(1.6em, 6vw, 2.1em)
    // La dimensione iniziale sarà più grande, es. scale(2.5) rispetto alla finale.

    // Per calcolare la traslazione per centrarlo:
    // Se left: 20px, per centrarlo orizzontalmente, x dovrebbe essere circa 50vw - (larghezza_elemento / 2) - 20px
    // Se top: 22px, per centrarlo verticalmente, y dovrebbe essere circa 50vh - (altezza_elemento / 2) - 22px
    // Dato che la larghezza/altezza dell'elemento cambia con la scala, questo è più facile
    // se impostiamo xPercent/yPercent = -50 e poi x/y = 50vw/50vh
    // e poi GSAP lo animerà verso la sua posizione CSS left/top senza transform.

    const tl = gsap.timeline({
        onComplete: () => {
            console.log("Animazione iniziale mobile completata.");
            document.body.style.overflowY = "auto"; // Permetti lo scroll dopo l'animazione
        }
    });

    // 1. Titolo anima DALLA sua posizione calcolata (grande e al centro)
    //    ALLA sua posizione definita nel CSS (piccolo e in alto a sinistra).
    tl.from(animatedTitle, {
        duration: 1.5, // Durata animazione titolo
        
        // Posizione iniziale: al centro dello schermo
        x: "50vw", // Sposta l'origine a metà viewport
        y: "50vh",
        xPercent: -50, // Centra l'elemento sulla sua origine
        yPercent: -50,
        scale: 2.5, // Scala iniziale (più grande)
        textShadow: "0 0 20px rgba(200, 150, 255, 0.5)", // Ombra più pronunciata all'inizio
        ease: "power2.inOut" // Un ease fluido
    })
    // L'elemento animatedTitle è già posizionato via CSS dove deve finire.
    // GSAP.from() lo animerà da questi valori verso il suo stato CSS.
    // Durante questa animazione, mostriamo anche l'icona utente.
    .to(mobileHeader, {
        opacity: 1,
        duration: 0.6,
        ease: "power1.out"
    },"<+0.8"); // Inizia un po' prima che l'animazione del titolo finisca

    // 2. Il contenuto principale (azioni e descrizione) appare
    tl.to(mainContent, { opacity: 1, duration: 0.2 }, ">-0.4") // Rendi visibile il contenitore mainContent
      .to(actionCards, {
        opacity: 1,
        y: 0, // Da translateY(20px) definito in CSS
        stagger: 0.15, // Appaiono una dopo l'altra
        duration: 0.5,
        ease: "power1.out"
    }, ">-0.1") // Inizia quasi subito dopo che mainContent è visibile
      .to(mobileDescription, {
        opacity: 1,
        y: 0, // Da translateY(10px) definito in CSS
        duration: 0.4,
        ease: "power1.out"
    }, ">-0.2"); // Leggermente sovrapposto alla fine delle card


    // Event Listeners per i bottoni
    const nuovoBtn = document.querySelector(".nuovo-mobile-btn");
    const continuaBtn = document.querySelector(".continua-mobile-btn");
    const userIcon = document.querySelector(".mobile-user-icon");

    if (nuovoBtn) {
        nuovoBtn.addEventListener('click', () => {
            console.log("Nuovo Riassunto cliccato");
            window.location.href = "../nuovo/nuovo.html";
        });
    }

    if (continuaBtn) {
        continuaBtn.addEventListener('click', () => {
            console.log("Miei Riassunti cliccato");
            window.location.href = "../continua/continua.html";
        });
    }

    if (userIcon) {
        userIcon.addEventListener('click', () => {
            console.log("Icona Utente cliccata");
            // window.location.href = "../profilo.html";
        });
    }
});