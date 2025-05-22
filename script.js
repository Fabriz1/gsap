let control=false;
gsap.registerPlugin(Observer)
const pageLoadTime = Date.now();
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
    duration: 1,
    opacity: 1,
    y: "-20%",
}).to(".freccia", {
    duration: 1,
    y: "-30%",
    yoyo: true,
    repeat: -1
});

document.querySelector(".freccia").addEventListener("click", function () {
    let click = gsap.timeline();
    click.to(".titolo", {
        duration: 1.3,
        scale: 0.2,
        x: "-88%",
        y: "-170%",
    }).to(".desc", {
        duration: 0.5,
        y: "-500%",
    }).to(".freccia", {
        y: "+500%",
        duration: 0.5,
        yoyo: false,
        opacity: 0,
    }, "<");
});

// Crea l'Observer dopo 3 secondi
setTimeout(() => {
    Observer.create({
        target: window, // può essere qualsiasi elemento
        type: "wheel,touch", // tipi di eventi da ascoltare
        onDown: () => next(),
    });
    console.log("Observer creato dopo 3 secondi.");
}, 3000);

function next() {
    if (!control) {
        
    
    let click = gsap.timeline();
    click.to(".titolo", {
        duration: 1.3,
        scale: 0.2,
        x: "-88%",
        y: "-170%",
    }).to(".desc", {
        duration: 0.5,
        y: "-500%",
    }).to(".freccia", {
        y: "+500%",
        duration: 0.5,
        yoyo: false,
        opacity: 0,
    }, "<").to(".freccia, .desc", {
        display: "none",
    }
    )
    control = true;
    }
}








