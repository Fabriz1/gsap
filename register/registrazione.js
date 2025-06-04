





document.querySelector(".logo").addEventListener("mouseenter", function(){

        gsap.to(".log",{
        rotation:360,
        ease:"elastic.out",
        duration:2,
    })
    }
)
document.querySelector(".accedi").addEventListener("click", function(){
    window.location.href("../login/login.html")
})