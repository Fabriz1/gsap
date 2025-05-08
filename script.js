gsap.registerPlugin(ScrollTrigger);

gsap.fromTo(".titolo", {

  x: "-40%",
  
  opacity: 0,
  scale: 1.5,

},
  {
    duration: 1,
    ease: "power2.out",
    x: "10%",
    
    opacity: 1,
  },
)

gsap.fromTo(".icona", {

  y: "-40%",
  
  scale: 1.5,

},
  {
    duration: 4,
    rotation: 360,
    ease: "elastic.out(1, 0.5)",
    y: "80%",
    
    
  },
)

ScrollTrigger.create({
  trigger: ".titolo",
  scrub: 2,
  start: "top ",
  end: "+=2000",      // L'animazione e il pinning durano per 1000px di scroll
  pin: true,
  pinSpacing: true, // Mantiene lo spazio del pinning
  //markers: true,      // Lascia i marcatori per il debug



});

ScrollTrigger.create({
  trigger: ".icona",
  scrub: 2,
  start: "top ",
  end: "+=2000",      // L'animazione e il pinning durano per 1000px di scroll
  pin: true,
  pinSpacing: true, // Mantiene lo spazio del pinning
  //markers: true,      // Lascia i marcatori per il debug
  


});
// Assicurati di aver incluso GSAP e ScrollTrigger nel tuo progetto




for (let i = 1; i <= 20; i++) {
  let materia = `#materia` + i;
  scrollTrigger.create({
    trigger: materia,
    scrub: 2,
    start: "top ",
    end: "+=2000",      // L'animazione e il pinning durano per 1000px di scroll
    pin: true,
    pinSpacing: true, // Mantiene lo spazio del pinning
    //markers: true,      // Lascia i marcatori per il debug
  });
}
