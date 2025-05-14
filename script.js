
gsap.registerPlugin(MorphSVGPlugin, MotionPathPlugin, ScrollTrigger);
gsap.fromTo(".titolo", {

  x: "-40%",
  y: "10vh",
  opacity: 0,
  scale: 1.5,

},
  {
    duration: 1,
    ease: "power2.out",
    x: "5%",
    y: "10vh",
    opacity: 1,
  },
)

gsap.fromTo(".icona", {
  
  scale: 1.5,

},
  {
    
    duration: 4,
    rotation: 360,
    ease: "elastic.out(1, 0.5)",
    
    

  },
)

gsap.to("#path-libro",
  {
    duration: 1,
    morphSVG: "#path-cervello",
    ease: "power2.out",
    scrub: 1,
    scrollTrigger: {
      trigger: "#path-libro",
      start: "bottom",
      end: "+=2000", // L'animazione dura per 1000px di scroll
      scrub: 1, // Sincronizza l'animazione con lo scroll

    },
  });

gsap.to(".blob-container",
  {
    duration: 1,
    ease: "power2.out",
    opacity: 1,
    scrollTrigger: {
      trigger: ".icona",
      start: "bottom",
      end: "+=2000", // L'animazione dura per 1000px di scroll
      scrub: 1, // Sincronizza l'animazione con lo scroll

    },
  });

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
  trigger: "#freccia",
  scrub: 2,
  start: "top 120px",
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
  markers: true,      // Lascia i marcatori per il debug
});

ScrollTrigger.create({
  start: "2000px",
  animation: gsap.to(".info", {
    duration: 0.5,
    opacity: 1,
    scale: 2,
  }),
})






