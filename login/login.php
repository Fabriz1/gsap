<?php
session_start();
$dove = "localhost";
$chi = "utente";
$autenticati = "Ludovica09";
$achi = "maturita_facile";
$si = false;
$conn = new mysqli($dove, $chi, $autenticati, $achi);
$nome_utente = $_POST['utente_univoco'];
$mail = $_POST['email'];
$password = $_POST['password'];

if ($nome_utente != "") {
    $stmt = $conn->prepare("SELECT nome from utente where id_utente=? and password_hash=?");
    $stmt->bind_param("ss", $nome_utente, $password);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $_SESSION['utente'] = $nome_utente;
        $stmt->bind_result($nome);
        $stmt->fetch();
        $si = true;
    }

} else {
    if ($mail != "") {
        $stmt = $conn->prepare("SELECT nome from utente where email=? and password_hash=?");
        $stmt->bind_param("ss", $mail, $password);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
        $_SESSION['email'] = $mail;
        
        $stmt->bind_result($nome);
        $stmt->fetch();
        $stmt->close();
        $stmt=$conn->prepare("SELECT id_utente WHERE email=?");
        $stmt->bind_param("s",$mail);
        $stmt->execute();
        $id_mail=$stmt->get_result();
        $_SESSION['utente']=$id_mail;
        $si = true;
        }
    } else {
        echo "devi inserire almeno password o email";

    }
}

if($si){
    header("Location: ../index.html");
}else{
    echo "Paswword o Email sbaliate, riprova";
    header("Location: login.html");
}






?>