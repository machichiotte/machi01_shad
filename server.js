const express = require('express');
const app = express();

// Votre code serveur ici

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
