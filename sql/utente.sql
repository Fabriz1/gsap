-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Giu 02, 2025 alle 23:05
-- Versione del server: 10.4.32-MariaDB
-- Versione PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `maturita_facile`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `utente`
--

-- Elimina l'utente se esiste già (opzionale, per evitare errori)
DROP USER IF EXISTS 'utente'@'localhost';

-- Crea l'utente con la password desiderata
CREATE USER 'utente'@'localhost' IDENTIFIED BY 'Ludovica09';

-- Concedi solo i privilegi di base sul tuo database
GRANT SELECT, INSERT, UPDATE, DELETE ON maturita_facile.* TO 'utente'@'localhost';

-- Applica le modifiche ai privilegi
FLUSH PRIVILEGES;


CREATE TABLE `utente` (
  `id_utente` varchar(20) NOT NULL,
  `nome` varchar(40) NOT NULL,
  `cognome` varchar(40) NOT NULL,
  `password_hash` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `utente`
--

INSERT INTO `utente` (`id_utente`, `nome`, `cognome`, `password_hash`, `email`) VALUES
('Fabri1', 'Fabrizio', 'Gesualdo', 'Ludovica09', 'gesualdo.f@galilux.edu.it'),
('fabrizio', 'Fabrizio', 'Gesualdo', 'password', 'fabriziogesualdo26@gmail.com'),
('fabrizio2', 'Fabrizio', 'Gesualdo', 'password', 'fabriziogesualdo2006@gmail.com'),
('fabrizio3', 'Fabrizio', 'Gesualdo', 'password', 'fabriziogesualdo11@gmail.com');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `utente`
--
ALTER TABLE `utente`
  ADD PRIMARY KEY (`id_utente`),
  ADD UNIQUE KEY `email` (`email`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
