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

$stmt=$conn->prepare("SELECT materia, contenuto, id_riassunto from riassunto where id_utente=?");
$stmt->bind_param("s", $_SESSION['utente']);
$stmt->execute();


$risultato= $stmt->get_result();
$invia=[];
while($riga=$risultato->fetch_assoc()){
    $invia[]=$riga;
}


header('Content-Type: application/json');
echo json_encode([
    "riassunto" => $invia,
    "conta"=> count($invia)
]);


}
?>