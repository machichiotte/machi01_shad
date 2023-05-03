//server.js
const dotenv = require('dotenv');
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const ccxt = require('ccxt');
const { connectMDB, saveDataMDB, deleteMultipleDataMDB, getAllDataMDB } = require('./mongodb.js');

dotenv.config();
const app = express();

const { mapBalance, mapActiveOrders, mapLoadMarkets } = require('./utils/mapping');

// Connexion à la base de données MongoDB
connectMDB();

app.use(cors());

app.post('/orders/:exchangeId', async (req, res) => {
  // TODO: Add code to place order
  try {
    const data = //ajotuer mon appel;
      res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.post('/bunch-orders/:exchangeId', async (req, res) => {
  // TODO: Add code to place bunch order
  try {
    const data = //ajotuer mon appel;
      res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.get('/deleteOrder', async (req, res) => {

  const { exchangeId, oId, symbol } = req.query;
  const apiKey = process.env[`${exchangeId.toUpperCase()}_API_KEY`];
  const secret = process.env[`${exchangeId.toUpperCase()}_SECRET_KEY`];
  const passphrase = process.env[`${exchangeId.toUpperCase()}_PASSPHRASE`] || '';

  try {
    const exchangeParams = {
      apiKey,
      secret,
      ...(passphrase && { password: passphrase }), // add passphrase to params if it exists

    };

  const exchange = new ccxt[exchangeId](exchangeParams);
  const data = await exchange.cancelOrder(oId, symbol.replace("/",""));

  console.log(data);
  res.json(data);
  //mise a jour activeOrder si envie ?
} catch (err) {
  console.error(err);
  res.status(500).send({ error: 'Internal server error' });
}
});

app.get('/get/cmcData', async (req, res) => {
  const collection = process.env.MONGODB_COLLECTION_CMC;
  try {
    const data = await getAllDataMDB(collection);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.get('/get/activeOrders', async (req, res) => {
  const collection = `collection_active_orders`;
  try {
    const data = await getAllDataMDB(collection);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.get('/update/cmcData', async (req, res) => {
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

app.get('/update/balance/:exchangeId', async (req, res) => {
  const { exchangeId } = req.params;
  const apiKey = process.env[`${exchangeId.toUpperCase()}_API_KEY`];
  const secret = process.env[`${exchangeId.toUpperCase()}_SECRET_KEY`];
  const passphrase = process.env[`${exchangeId.toUpperCase()}_PASSPHRASE`] || '';

  const collection = `collection_balance`;

  try {
    const exchangeParams = {
      apiKey,
      secret,
      ...(passphrase && { password: passphrase }) // add passphrase to params if it exists
    };

    const exchange = new ccxt[exchangeId](exchangeParams);
    const data = await exchange.fetchBalance();
    const mapData = mapBalance(exchangeId, data);

    if (mapData.length > 0) {
      const deleteParam = { platform: exchangeId };
      await deleteMultipleDataMDB(collection, deleteParam);
      await saveDataMDB(mapData, collection);
    }

    res.json(mapData);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.get('/update/activeOrders/:exchangeId', async (req, res) => {
  const { exchangeId } = req.params;
  const apiKey = process.env[`${exchangeId.toUpperCase()}_API_KEY`];
  const secret = process.env[`${exchangeId.toUpperCase()}_SECRET_KEY`];
  const passphrase = process.env[`${exchangeId.toUpperCase()}_PASSPHRASE`] || '';

  const collection = `collection_active_orders`;

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
    const data = await exchange.fetchOpenOrders();
    console.log("data:: " + data);
    console.log("JSON.stringify(data):: " + JSON.stringify(data));
    const mapData = mapActiveOrders(exchangeId, data);

    //TODO check if order size > 0 ?
    if (mapData.length > 0) {
      const deleteParam = { platform: exchangeId };
      await deleteMultipleDataMDB(collection, deleteParam);
      await saveDataMDB(mapData, collection);
    }

    res.json(mapData);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.get('/update/loadMarkets/:exchangeId', async (req, res) => {

  const { exchangeId } = req.params;
  const apiKey = process.env[`${exchangeId.toUpperCase()}_API_KEY`];
  const secret = process.env[`${exchangeId.toUpperCase()}_SECRET_KEY`];
  const passphrase = process.env[`${exchangeId.toUpperCase()}_PASSPHRASE`] || '';

  const collection = `collection_load_market`;

  try {
    const exchangeParams = {
      apiKey,
      secret,
      ...(passphrase && { password: passphrase }) // add passphrase to params if it exists
    };

    const exchange = new ccxt[exchangeId](exchangeParams);
    const data = await exchange.loadMarkets();
    const mapData = mapLoadMarkets(exchangeId, data);

    if (mapData.length > 0) {
      const deleteParam = { platform: exchangeId };
      await deleteMultipleDataMDB(collection, deleteParam);
      await saveDataMDB(mapData, collection);
    }

    res.json(mapData);
  } catch (err) {
    console.error(err);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
