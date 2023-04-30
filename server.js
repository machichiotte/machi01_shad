const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const mongo = require('./mongodb');

// Connexion à la base de données MongoDB
mongo.connectToMongo();

require('dotenv').config();

app.use(cors());

app.get('/cmc-data', async (req, res) => {
  const API_KEY = process.env.CMC_APIKEY;
  const URL = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=5000&convert=USD`;

  try {
    const response = await fetch(URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CMC_PRO_API_KEY': API_KEY
      }
    });
    const data = await response.json();

    // Enregistrement des données dans MongoDB
    await mongo.saveDataToMongoDB(data.data);
    
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});