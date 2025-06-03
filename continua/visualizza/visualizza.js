const url=new URLSearchParams(window.location.search);
const id= url.get("id");

fetch(`visualizza.php?id=${id}`)
.then(primo=>primo.json())
.then(risultato_vero=>{
    const contenitore=document.querySelector("#resultsContainer")
    contenitore.innerHTML+=
    `${risultato_vero.contenuto}`
    
})