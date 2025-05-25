gsap.registerPlugin(DrawSVGPlugin, SplitText)
let fileOtesto;
let tl = gsap.timeline();
let split = SplitText.create(".testo1", { type: "chars" });
let split2 = SplitText.create(".testo2", { type: "chars" });
gsap.set(split.chars,{
    opacity:0
})
gsap.set(split2.chars,{
    opacity:0
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
        },"<+0.5").to(split.chars, {
            duration: 1,
            y: -40,         // animate from 100px below
            opacity:1,   // fade in from opacity: 0 and visibility: hidden
            stagger: {
                each:0.01,  // 0.05 seconds between each
                from:"random"
            }

        },"<").to(split2.chars, {
            duration: 1,
            y: -40,         // animate from 100px below
            opacity:1,   // fade in from opacity: 0 and visibility: hidden
            stagger: {
                each:0.01,  // 0.05 seconds between each
                from:"random"
            }

        },"<").to(".incolla",{
            opacity:1

        },"<").to(".inc",{
            scale:1.1
        },"<+0.2").to(".inc",{
            ease:"power2.in",
            duration:0.5,
            scale:0.4
        },"<+0.5").to(".inc",{
            x:165,
            y:-55,
            duration:1.5,
            ease:"power1.out"
        },"<+0.5")
        
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
    .to(".o", {
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


       document.querySelector(".incolla").addEventListener("click", function() {
        console.log("incolla")
    // Quando clicchi su .incolla, vuoi sempre che l'animazione parta dall'inizio in avanti.
    // .restart() è il metodo perfetto per questo, perché resetta la timeline al progress 0 e la riproduce.
    incollaTimeline.restart();
});

// Event listener per .back (che dovrebbe far invertire l'animazione)
document.querySelector(".back").addEventListener("click", function(event) {
    event.stopPropagation()
    // Se la timeline non è già invertita (cioè sta andando avanti o è alla fine), invertila.
    // Questo previene chiamate multiple a reverse() quando è già al suo punto di inizio.
    if (!incollaTimeline.reversed()) {
        incollaTimeline.reverse();
    }
});

    let fakeFile=document.querySelector(".file")
document.querySelector(".carica-file").addEventListener("click",function(){
    fakeFile.click()
})

let testoIncollato;
let areatesto=document.getElementById('text-input-area');
document.querySelector(".conf").addEventListener("click", function(event){
    event.stopPropagation()
    // Se la timeline non è già invertita (cioè sta andando avanti o è alla fine), invertila.
    // Questo previene chiamate multiple a reverse() quando è già al suo punto di inizio.
    if (!incollaTimeline.reversed()) {
        incollaTimeline.reverse();
    }
    testoIncollato=areatesto.value;
    console.log(testoIncollato)
})


    