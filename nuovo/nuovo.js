gsap.registerPlugin(DrawSVGPlugin, SplitText)

let tl = gsap.timeline();
let split = SplitText.create(".testo1", { type: "chars" });
gsap.set(split.chars,{
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
        }).to(split.chars, {
            duration: 1,
            y: -40,         // animate from 100px below
            opacity:1,   // fade in from opacity: 0 and visibility: hidden
            stagger: {
                each:0.01,  // 0.05 seconds between each
                from:"random"
            }

        },"<").to(".clicca", {
            y: 20,

            yoyo: true,
            ease: "power2.out",
            repeat: -1
        })