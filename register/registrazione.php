<?php
session_start();

$location="localhost";
$utente_db="utente"; 
$password_db="Ludovica09"; 
$nome_db="maturita_facile";
$conn=new mysqli($location, $utente_db, $password_db, $nome_db);


if ($conn->connect_error) {
    
    error_log("Errore di connessione al DB: " . $conn->connect_error);
    die("Errore di connessione al database. Riprova più tardi.");
}

// Verifica se i dati sono stati inviati tramite POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $nome_utente_form = isset($_POST['utente_univoco']) ? trim($_POST['utente_univoco']) : '';
    $email_form = isset($_POST['email']) ? trim($_POST['email']) : '';
    $password_utente_form = isset($_POST['password']) ? $_POST['password'] : ''; 
    $nome_form = isset($_POST['nome']) ? trim($_POST['nome']) : '';
    $cognome_form = isset($_POST['cognome']) ? trim($_POST['cognome']) : '';


   

    $stmt_check_user = $conn->prepare("SELECT id_utente FROM utente WHERE id_utente = ?");
    if (!$stmt_check_user) {
        error_log("Errore prepare check utente: " . $conn->error);
        die("Errore del sistema durante la verifica del nome utente. Riprova.");
    }
    $stmt_check_user->bind_param("s", $nome_utente_form);
    $stmt_check_user->execute();
    $stmt_check_user->store_result();

    if ($stmt_check_user->num_rows > 0) {
        $stmt_check_user->close();
        $conn->close();
        die("Il nome utente '". htmlspecialchars($nome_utente_form) ."' esiste già. Scegline un altro.");
    }
    $stmt_check_user->close();


  
    $stmt_check_email = $conn->prepare("SELECT email FROM utente WHERE email = ?");
    if (!$stmt_check_email) {
        error_log("Errore prepare check email: " . $conn->error);
        die("Errore del sistema durante la verifica dell'email. Riprova.");
    }
    $stmt_check_email->bind_param("s", $email_form);
    $stmt_check_email->execute();
    $stmt_check_email->store_result();

    if ($stmt_check_email->num_rows > 0) {
        $stmt_check_email->close();
        $conn->close();
        die("L'email '". htmlspecialchars($email_form) ."' è già registrata. Utilizzane un'altra.");
    }
    $stmt_check_email->close();


    
    $stmt_insert = $conn->prepare("INSERT INTO utente (id_utente, email, password_hash, nome, cognome) VALUES (?, ?, ?, ?, ?)");

    if (!$stmt_insert) {
   
        error_log("Errore prepare INSERT: " . $conn->error);
        die("Errore durante la preparazione della registrazione. Riprova più tardi.");
    }

    
    $stmt_insert->bind_param("sssss", $nome_utente_form, $email_form, $password_utente_form, $nome_form, $cognome_form);

    if ($stmt_insert->execute()) {
        $_SESSION['utente']=$nome_utente_form;
        header("Location: ../continua/continua.html");
        
    } else {
       
        error_log("Errore execute INSERT: " . $stmt_insert->error);
       
        echo "Si è verificato un errore durante la registrazione: " . htmlspecialchars($stmt_insert->error) . ". Riprova.";
    }
    $stmt_insert->close();

} else {
    
    echo "Per favore, compila il form di registrazione.";
}



?>