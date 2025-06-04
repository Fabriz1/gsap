<?php
session_start();
header('Content-Type: application/json'); // Buona pratica: indica che la risposta è JSON

if (!isset($_SESSION["utente"])) {
    http_response_code(401); // Unauthorized
    echo json_encode(["success" => false, "error" => "Utente non autenticato"]);
    exit;
}

$conn = new mysqli("localhost", "utente", "Ludovica09", "maturita_facile");
if ($conn->connect_error) {
    http_response_code(500);
    // Includi l'errore di connessione per debug, ma fai attenzione in produzione
    echo json_encode(["success" => false, "error" => "Connessione al database fallita: " . $conn->connect_error]);
    exit;
}

// Ottieni l'ID utente dalla sessione
$id_utente = $_SESSION["utente"];

// 1. Leggi il contenuto RAW della richiesta POST (il JSON)
$json_data = file_get_contents('php://input');

// 2. Decodifica la stringa JSON in un array associativo
$messaggio_decodificato = json_decode($json_data, true);

// 3. Controlla se la decodifica JSON è fallita
if ($messaggio_decodificato === null && json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'error' => 'Errore nella decodifica JSON: ' . json_last_error_msg()]);
    $conn->close(); // Chiudi la connessione prima di uscire
    exit();
}

// 4. Assegna le variabili dai dati decodificati
// Usa l'operatore null coalescing (??) per gestire chiavi mancanti senza warning
$riassunto_html = $messaggio_decodificato['contenuto'] ?? '';
$materia_salvataggio = $messaggio_decodificato['materia'] ?? '';

// 5. Controlla se i dati essenziali (riassunto e materia) sono mancanti o vuoti *DOPO* l'assegnazione
if (empty($riassunto_html) || empty($materia_salvataggio)) {
    http_response_code(400); // Bad Request
    echo json_encode(["success" => false, "error" => "Dati 'contenuto' o 'materia' mancanti o vuoti."]);
    $conn->close(); // Chiudi la connessione prima di uscire
    exit;
}

// 6. Prepara la query SQL
// Attenzione: nel tuo codice originale la tabella era "riassunto" (singolare),
// ma nel prepare stavi usando "riassunto" di nuovo. Assicurati che il nome della tabella sia corretto.
$stmt = $conn->prepare("INSERT INTO riassunto (materia, contenuto, id_utente) values (?, ?, ?)");

// 7. Controlla se la preparazione della query è fallita
if ($stmt === false) {
    http_response_code(500); // Internal Server Error
    echo json_encode(["success" => false, "error" => "Errore nella preparazione della query: " . $conn->error]);
    $conn->close(); // Chiudi la connessione
    exit();
}

// 8. Lega i parametri (assicurati che i tipi 'sss' siano corretti)
$stmt->bind_param("sss", $materia_salvataggio, $riassunto_html, $id_utente);

// 9. Esegui la query
$execute_success = $stmt->execute();

// 10. Determina il risultato e invia *UNA SOLA* risposta JSON
if ($execute_success) {
    // Query eseguita con successo. Controlla quante righe sono state inserite.
    if ($stmt->affected_rows > 0) {
        http_response_code(200); // OK
        echo json_encode(["success" => true, "message" => "Riassunto salvato con successo!"]);
    } else {
        // Query eseguita, ma nessuna riga inserita. Potrebbe indicare un problema logico
        // (es. id_utente non valido se c'è un vincolo FOREIGN KEY, anche se l'execute è "true").
        // Dipende dalla logica del tuo DB. Assumiamo sia un successo con avviso, o un fallimento logico.
        // Consideriamo questo come un successo tecnico, ma magari con un messaggio diverso
         http_response_code(200); // OK, ma con un messaggio di avviso
         echo json_encode(["success" => true, "message" => "Salvataggio completato, ma nessuna riga inserita (potrebbe essere già presente o problema con ID utente?)."]);
         // Alternativa: considerarlo un errore
         // http_response_code(500);
         // echo json_encode(["success" => false, "error" => "Salvataggio riuscito, ma nessuna riga inserita."]);
    }
} else {
    // Errore nell'esecuzione della query
    http_response_code(500); // Internal Server Error
    echo json_encode(["success" => false, "error" => "Errore di esecuzione query: " . $stmt->error]);
}

// 11. Chiudi statement e connessione
$stmt->close();
$conn->close();

// IMPORTANTISSIMO: Nessun altro codice o echo dopo la risposta finale
?>