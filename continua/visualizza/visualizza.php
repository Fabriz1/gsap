<?php
session_start();
$dove = "localhost";
$chi = "utente";
$puo = "Ludovica09";
$nome_db = "maturita_facile";
$id = $_GET["id"];



$conn = new mysqli($dove, $chi, $puo, $nome_db);
$stmt = $conn->prepare("SELECT contenuto from riassunto where id_riassunto=?");
$stmt->bind_param("i",$id);
$stmt->execute();
$testo=$stmt->get_result();
$json=$testo->fetch_assoc();
header("Content-Type: application/json");
echo json_encode($json);

    ?>