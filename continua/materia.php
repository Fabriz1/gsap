<?php
session_start();
$dove="localhost";
$chi="utente";
$autorizzazione="Ludovica09";
$quale="maturita_facile";
$conn=new mysqli($dove,$chi,$autorizzazione,$quale);
if($_SESSION["utente"]==null){
    header("Location: ../login/login.html");
}
$stmt->prepare("SELECT materia, contenuto, id_riassunto from riassunto where id_utente=?");
$stmt->bind_param("s", $_SESSION["utente"]);
$stmt->execute();
$stmt->store_result();

?>