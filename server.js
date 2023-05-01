const dotenv = require('dotenv');
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const ccxt = require('ccxt');
const { connectMDB, saveDataMDB, deleteAllDataMDB } = require('./mongodb.js');

dotenv.config();
const app = express();

const { getBalance, getActiveOrders } = require('./utils/calculs');

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
    console.log("cmc :: " + JSON.stringify(data));
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

  const collection = `collection_${exchangeId.toLowerCase()}_balance`;

  try {
    const exchangeParams = {
      apiKey,
      secret,
      ...(passphrase && { password: passphrase }) // add passphrase to params if it exists
    };

    const exchange = new ccxt[exchangeId](exchangeParams);
    const balances = await exchange.fetchBalance();
    const balance = getBalance(exchangeId, balances);

    //TODO check if balance size > 0 ?
    await deleteAllDataMDB(collection);
    await saveDataMDB(balance, collection);

    res.json(balance);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.get('/activeOrders/:exchangeId', async (req, res) => {
  const { exchangeId } = req.params;
  const apiKey = process.env[`${exchangeId.toUpperCase()}_API_KEY`];
  const secret = process.env[`${exchangeId.toUpperCase()}_SECRET_KEY`];
  const passphrase = process.env[`${exchangeId.toUpperCase()}_PASSPHRASE`] || '';

  const collection = `collection_${exchangeId.toLowerCase()}_activeorders`;

  try {
    const exchangeParams = {
      apiKey,
      secret,
      ...(passphrase && { password: passphrase }) // add passphrase to params if it exists
    };

    const exchange = new ccxt[exchangeId](exchangeParams);
    if (exchangeId === 'binance') {
      exchange.options["warnOnFetchOpenOrdersWithoutSymbol"] = false;
    }
    const orders = await exchange.fetchOpenOrders();
    const order = getActiveOrders(exchangeId, orders);

    //TODO check if order size > 0 ?
    await deleteAllDataMDB(collection);
    await saveDataMDB(order, collection);

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
