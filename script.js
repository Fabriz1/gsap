gsap.registerPlugin(ScrollTrigger);

gsap.fromTo(".titolo", {
  
  x: "-40%",
 ease: "power2.out",
  opacity: 0,
  scale: 1.5,

},
{
  duration: 1,  
x:"10%",
opacity: 1,
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

