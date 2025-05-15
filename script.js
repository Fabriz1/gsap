
gsap.registerPlugin(MorphSVGPlugin, MotionPathPlugin, ScrollTrigger, ScrollSmoother);
gsap.fromTo(".titolo", {

  x: "-40%",
  y: "20vh",
  opacity: 0,
  scale: 1.5,

},
  {
    duration: 1,
    ease: "power2.out",
    x: "30%",
    y: "23vh",
    opacity: 1,
  },
)

gsap.fromTo(".icona", {

  scale: 1.5,
  y: "30%",
  x: "0%",
},
  {

    duration: 4,
    rotation: 360,
    ease: "elastic.out(1, 0.5)",
    y: "30%",
    x: "40%",

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
      end: "+=800", // L'animazione dura per 1000px di scroll
      scrub: 1, // Sincronizza l'animazione con lo scroll

    },
  });

ScrollTrigger.create({
  trigger: ".titoloeicona", // CAMBIATO: usa il contenitore come trigger
  pin: true,               // CAMBIATO: questo pinnerà .titoloeicona
  scrub: 2,
  start: "top top",        // Assicurati che il punto di start sia corretto per .titoloeicona
  end: "+=2200",
  pinSpacing: true,
  //markers: true,
});

ScrollTrigger.create({
  trigger: ".opzioni", // CAMBIATO: usa il contenitore come trigger
  pin: true,               // CAMBIATO: questo pinnerà .titoloeicona
  scrub: 2,
  start: "top 45%",        // Assicurati che il punto di start sia corretto per .titoloeicona
  end: "+=500",
  pinSpacing: true,
  //markers: true,
});

gsap.fromTo(".nuovo",
  { scale: 0.5 },
  {
    opacity: 1,
    scale: 1,
    scrollTrigger: {
      trigger: ".attivatore1",
      start: "top 20%",
      end: "+=0", // L'animazione dura per 1000px di scroll
      scrub: 2, // Sincronizza l'animazione con lo scroll
      //markers: true,
    }
  }
)
gsap.fromTo(".continua",
  { scale: 0.5 },
  {
    opacity: 1,
    scale: 1,
    scrollTrigger: {
      trigger: ".attivatore1",
      start: "top 20%",
      end: "+=0", // L'animazione dura per 1000px di scroll
      scrub: 2, // Sincronizza l'animazione con lo scroll
      //markers: true,
    }
  }
)

ScrollTrigger.create({
  start: "2000px",
  animation: gsap.to(".info", {
    duration: 0.5,
    opacity: 1,
    scale: 2,
  }),
})



gsap.to(".icona", {

  opacity: 0,
  scrollTrigger: {
    trigger: ".attivatore1",
    start: "top 20%",
    end: "+=0px", // L'animazione dura per 1000px di scroll
    //markers: true, // Lascia i marcatori per il debug
    scrub: 1, // Sincronizza l'animazione con lo scroll
  },

})

gsap.fromTo(".titolo",
  { opacity: 1 },
  {
    scale: 0.8,
    opacity: 1,
    y: "5vh", // <<< VALORE MOLTO PICCOLO PER VEDERE SE SI MUOVE POCO
    x: "22%",
    scrollTrigger: {
      trigger: ".attivatore1",
      start: "top 20%", // O "top center"
      scrub: 3, // Sincronizza l'animazione con lo scroll
      end: "+=0px", // L'animazione dura per 1000px di scroll
      //markers: true,
    },
  }
);



document.querySelector('.nuovo').onclick = function (){
window.location.href = "nuovo/nuovo.html";
}

document.querySelector('.continua').onclick = function (){
window.location.href = "continua/continua.html";
}