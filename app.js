const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve tutti i file statici (html, css, js, immagini, ecc.)
app.use(express.static(path.join(__dirname)));

// Start del server
app.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}`);
});
