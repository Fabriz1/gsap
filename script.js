gsap.registerPlugin(Observer, MorphSVGPlugin, Physics2DPlugin);
let control = false;

let intro = gsap.timeline({
    onComplete: () => {
        console.log("Timeline intro terminata.");
    }
});

intro.to('.titolo', {
    duration: 1.5,
    opacity: 1,
    scale: 1.4,
    ease: "power2.out"
}).to(".titolo", {
    duration: 1,
    scale: 0.8,
    y: "-130%",
    ease: "power1.out",
}, "1.5").to(".desc", {
    opacity: 1,
    duration: 2,
    y: "-70%",
}, "<").to(".freccia", {
    duration: 3,
    opacity: 1,
    y: "-60%",
}, "<").to(".freccia", {
    duration: 1.5,
    y: "-20%",
    yoyo: true,
    repeat: -1
});

setTimeout(() => {
    Observer.create({
        target: window,
        type: "wheel,touch",
        onDown: () => next(),
    });
    console.log("Observer creato dopo 3 secondi.");
}, 3000);

/**
 * Crea e anima particelle da un punto di origine.
 * @param {HTMLElement} originElement L'elemento da cui le particelle dovrebbero originare.
 */
function createAndExplodeParticles(originElement) { // originElement non è usato dato che usi posizioni fisse
    console.log("%cCreazione Particelle Esplosive (Velocità Ridotta)", "color: orange; font-weight: bold;");

    // Punto di origine fisso (come da tua soluzione)
    const explosionOriginX = "26%"; // Percentuale left
    const explosionOriginY = "68%"; // Percentuale top

    const particleCount = 60; // Puoi mantenere 50 o ridurlo leggermente se preferisci

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle-simple');
        document.body.appendChild(particle);

        // Dimensioni casuali per le particelle
        const randomSize = Math.random() * 10 + 5; // Dimensione tra 5px e 15px (leggermente aggiustato)

        gsap.set(particle, {
            left: explosionOriginX,
            top: explosionOriginY,
            width: randomSize,
            height: randomSize,
            xPercent: -50, // Per centrare la particella sull'origine
            yPercent: -50,
            backgroundColor: `hsl(${Math.random() * 360}, 100%, 70%)`,
            borderRadius: '50%',
            position: 'absolute',
            opacity: 1
        });

        // Animazione di esplosione con velocità ridotta
        gsap.to(particle, {
            duration: 1.2 + Math.random() * 1.5, // Durata leggermente più lunga (1.2s - 2.7s)
            physics2D: {
                velocity: Math.random() * 200 + 100, // Velocità ridotta e casuale (100-300)
                angle: Math.random() * 360,
                gravity: 250,                        // Gravità leggermente ridotta se vuoi un effetto meno "pesante"
                friction: 0.05                       // Attrito ridotto
            },
            opacity: 0,
            scale: 0,
            ease: "power1.out",
            onComplete: function () {
                this.targets()[0].remove();
            }
        });
    }
    console.log(particleCount + " particelle esplosive (velocità ridotta) create e animate.");
}


function next() {
    if (!control) {
        console.log("%cFunzione next() chiamata.", "background: #222; color: #bada55");
        let click = gsap.timeline({
            onComplete: () => console.log("Timeline 'click' completata.")
        });

        click.to(".titolo", {
            duration: 1.3,
            scale: 0.2,
            x: "-88%",
            y: "-170%",
            ease: "power2.out",
        }).to(".desc", {
            duration: 1,
            scale: 0,
            y: -100,
        }, "<").to(".freccia", {
            scale: 0,
            duration: 1,
            yoyo: false,
            y: 100,
        }, "<").to(".freccia, .desc", {
            display: "none",
        }).to(".utente", {
            duration: 1,
            opacity: 1,
            scale: 1,
        }, "<-1").to(".nuovo", {
            duration: 1,
            opacity: 1,
            x: 20,
            onStart: () => console.log("Animazione .nuovo iniziata."),
            onComplete: () => console.log(".nuovo animazione completata.")
        },"<+1").to(".continua", {
            duration: 1,
            opacity: 1,
            x: -20,
        },"<").to("#cerchio", {
            duration: 2,
            rotation: -360,
            
           ease: "elastic.out(1,0.3)", // Rotazione lineare continua
            transformOrigin: "50% 50%"
        }).to(".piu", {
            scale: 0.6,
            yoyo: true,
            repeat: 1,
            duration: 0.3, // breve durata per l'effetto "click"
            onStart: () => console.log("Animazione .piu (click icona) iniziata."),
            onRepeat: () => { // Questo si attiva quando lo scale a 0.6 è completato e sta per tornare indietro
                console.log("%cAnimazione .piu onRepeat - Chiamata a createAndExplodeParticles.", "color: orange; font-weight: bold;");
                const piuIconSvg = document.querySelector(".piu svg:first-child");
                if (piuIconSvg) {
                    createAndExplodeParticles(piuIconSvg);
                }
            },

        },"<").to("#plus", {
            duration: 0.5,
            morphSVG: "#doc"
        },"<+0.5").to(".icona", {
            duration:1,
            ease: "power1.out",
            y: 10,
            yoyo: true,
            repeat: -1
        })


        control = true;
    } else {
        console.log("Control è true, next() non eseguita di nuovo.");
    }
}
const scalaIniziale = gsap.getProperty(".nuovo", "scale");

document.querySelector(".nuovo").addEventListener('mouseenter', function(){
    console.log("blabla")
    gsap.to(".nuovo", {
            scale: 1.1, // Ingrandisce del 5% rispetto alla sua scala attuale
            duration: 0.3,              // Durata dell'animazione di ingrandimento
            ease: "power1.out"          // Tipo di easing per un effetto fluido
        });
        
        document.body.style.cursor = "pointer";
})

document.querySelector(".nuovo").addEventListener('mouseleave', function(){
    gsap.to(".nuovo", {
            scale: 1, // Ingrandisce del 5% rispetto alla sua scala attuale
            duration: 0.3,              // Durata dell'animazione di ingrandimento
            ease: "power1.out"          // Tipo di easing per un effetto fluido
        });
        document.body.style.cursor = "default";
})


document.querySelector(".continua").addEventListener('mouseenter', function(){
    console.log("blabla")
    gsap.to(".continua", {
            scale: 1.1, // Ingrandisce del 5% rispetto alla sua scala attuale
            duration: 0.3,              // Durata dell'animazione di ingrandimento
            ease: "power1.out" ,         // Tipo di easing per un effetto fluido
            
        })
        gsap.to("#cerchio", {
            duration: 2,
            rotation: -360,
            
           ease: "elastic.out(1,0.3)", // Rotazione lineare continua
            transformOrigin: "50% 50%"
        })
        document.body.style.cursor = "pointer";
        
})

document.querySelector(".continua").addEventListener('mouseleave', function(){
    gsap.to(".continua", {
            scale: 1, // Ingrandisce del 5% rispetto alla sua scala attuale
            duration: 0.3,              // Durata dell'animazione di ingrandimento
            ease: "power1.out"   ,       // Tipo di easing per un effetto fluido
            
        });
        document.body.style.cursor = "default";
})


document.querySelector(".utente").addEventListener('mouseenter', function(){
    console.log("blabla")
    gsap.to(".utente", {
            scale: 1.3, // Ingrandisce del 5% rispetto alla sua scala attuale
            duration: 0.3,              // Durata dell'animazione di ingrandimento
            ease: "power1.out"          // Tipo di easing per un effetto fluido
        });
})

document.querySelector(".utente").addEventListener('mouseleave', function(){
    gsap.to(".utente", {
            scale: 1, // Ingrandisce del 5% rispetto alla sua scala attuale
            duration: 0.3,              // Durata dell'animazione di ingrandimento
            ease: "power1.out"   ,       // Tipo di easing per un effetto fluido
            
        });
})

document.querySelector(".nuovo").addEventListener('click',function(){
    window.location.href = "nuovo/nuovo.html";
} )