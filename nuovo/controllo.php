<?php
session_start();
$dove="localhost";
$chi="utente";
$autorizzazione="Ludovica09";
$quale="maturita_facile";
$conn=new mysqli($dove,$chi,$autorizzazione,$quale);

    if (!isset($_SESSION["utente"])) {
    header('Content-Type: application/json');
    echo json_encode(["errore" => "Non autenticato"]);
    exit;

}else{
    return;
}