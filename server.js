const dotenv = require('dotenv');
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const ccxt = require('ccxt');
const { connectMDB, saveDataMDB } = require('./mongodb.js');

dotenv.config();
const app = express();

const { getBalance } = require('./utils/calculs');

// Connexion à la base de données MongoDB
connectMDB();

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
    await saveDataMDB(data.data, process.env.MONGODB_COLLECTION_CMC);

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.get('/balance/:exchangeId', async (req, res) => {
  const { exchangeId } = req.params;
  const apiKey = process.env[`${exchangeId.toUpperCase()}_API_KEY`];
  const secret = process.env[`${exchangeId.toUpperCase()}_SECRET_KEY`];
  const passphrase = process.env[`${exchangeId.toUpperCase()}_PASSPHRASE`] || '';

  try {
    const exchangeParams = {
      apiKey,
      secret,
      ...(passphrase && { password: passphrase }) // add passphrase to params if it exists
    };

    const exchange = new ccxt[exchangeId](exchangeParams);
    const balances = await exchange.fetchBalance();
    console.log(`${exchangeId.toUpperCase()}`);

    const balance = getBalance(exchangeId, balances);

    await saveDataMDB(balance, `collection_${exchangeId.toLowerCase()}_balance`);

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
