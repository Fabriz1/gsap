fetch("materia.php")
    .then(riassunti => riassunti.json())
    .then(risultato_vero => {
        if (risultato_vero.errore) {
            alert("Devi accedere per vedere la tua lista di riassunti")
            window.location.href = "../login/login.html"
            return;
        }
        let contenitore = document.querySelector(".paginazione")
        let numero_quaderni = risultato_vero.conta;
        console.log(numero_quaderni)
        console.log(risultato_vero)
        for (let i = 0; i < numero_quaderni; i++) {

            const quaderno = document.createElement("div");
            quaderno.classList.add("quaderno");
            

            quaderno.innerHTML += `
            
                <div class="id" style="display:none">${risultato_vero.riassunto[i].id_riassunto}</div>
                <div class="copertina">
                    <p class="materia">${risultato_vero.riassunto[i].materia}</p>
                </div>
                <div class="spirale">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            
         `
            

            quaderno.addEventListener("click", function () {
                const id = this.querySelector(".id").textContent.trim();
                window.location.href = `visualizza/visualizza.html?id=${id}`
            })
            contenitore.appendChild(quaderno);
        }
    })







