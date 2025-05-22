let tl=gsap.timeline();

tl.to(".titolo-carica",{
    duration: 1,
    opacity: 1,
    scale: 1.2,
}).to(".titolo-carica",{
    duration: 0.8,
    y:-200,
}).to(".descrizione-carica",{
})

