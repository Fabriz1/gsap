fetch("materia.php")
.then(riassunti=>riassunti.json())
.then(risultato_vero=> {
    if(risultato_vero.errore){
        alert("Devi accedere per vedere la tua lista di riassunti")
        window.location.href="../login/login.html"
        return;
    }
})