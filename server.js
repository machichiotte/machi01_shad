//server.js
const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cors = require('cors');
const ccxt = require('ccxt');
const fs = require('fs');

const { connectMDB, saveArrayDataMDB, saveObjectDataMDB, deleteMultipleDataMDB, getAllDataMDB, deleteAllDataMDB } = require('./mongodb.js');

dotenv.config();
const app = express();
// Specify the folder containing your static files (including JavaScript files)
app.use(express.static('dist'));

const isOfflineMode = process.env.OFFLINE_MODE === 'true';
app.offlineMode = isOfflineMode;

// Use body-parser as a global middleware for all requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const { mapBalance, mapActiveOrders, mapLoadMarkets, mapTrades } = require('./utils/mapping');

// Connect to the MongoDB database
connectMDB();

app.use(cors());

// GET
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
    const data = await exchange.cancelOrder(oId, symbol.replace("/", ""));
    res.json(data);
    //mise a jour activeOrder si envie ?
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.get('/get/balance', async (req, res) => {
  const collection = process.env.MONGODB_COLLECTION_BALANCE;

  try {
    let data;

    if (app.offlineMode) {
      const mockDataPath = './mockData/balance.json';
      const jsonData = fs.readFileSync(mockDataPath, 'utf8');
      data = JSON.parse(jsonData);
    } else {
      data = await getAllDataMDB(collection);
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.get('/get/cmcData', async (req, res) => {
  const collection = process.env.MONGODB_COLLECTION_CMC;

  try {
    let data;

    if (app.offlineMode) {
      const mockDataPath = './mockData/cmcData.json';
      const jsonData = fs.readFileSync(mockDataPath, 'utf8');
      data = JSON.parse(jsonData);
    } else {
      data = await getAllDataMDB(collection);
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.get('/get/activeOrders', async (req, res) => {
  const collection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;

  try {
    let data;

    if (app.offlineMode) {
      const mockDataPath = './mockData/activeOrders.json';
      const jsonData = fs.readFileSync(mockDataPath, 'utf8');
      data = JSON.parse(jsonData);
    } else {
      data = await getAllDataMDB(collection);
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.get('/get/strat', async (req, res) => {
  const collection = process.env.MONGODB_COLLECTION_STRAT;

  try {
    let data;

    if (app.offlineMode) {
      console.log('offline');
      const mockDataPath = './mockData/strat.json';
      const jsonData = fs.readFileSync(mockDataPath, 'utf8');
      data = JSON.parse(jsonData);
    } else {
      console.log('online');
      data = await getAllDataMDB(collection);
    }
    console.log('data :: ' + data);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.get('/get/trades', async (req, res) => {
  const collection = process.env.MONGODB_COLLECTION_TRADES;

  try {
    let data;
    console.log('trade')

    if (app.offlineMode) {
      const mockDataPath = './mockData/trades.json';
      const jsonData = fs.readFileSync(mockDataPath, 'utf8');
      data = JSON.parse(jsonData);
    } else {
      data = await getAllDataMDB(collection);
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// POST
function createExchangeInstance(exchangeId, req) {
  let symbol, param;

  switch (exchangeId) {
    case 'kucoin':
      symbol = req.body.asset + '-USDT';
      param = {
        apiKey: process.env.KUCOIN_API_KEY,
        secret: process.env.KUCOIN_SECRET_KEY,
        password: process.env.KUCOIN_PASSPHRASE
      };
      break;
    case 'binance':
      symbol = req.body.asset + 'USDT';
      param = {
        apiKey: process.env.BINANCE_API_KEY,
        secret: process.env.BINANCE_SECRET_KEY
      };
      break;
    case 'huobi':
      symbol = req.body.asset.toLowerCase() + 'usdt';
      param = {
        apiKey: process.env.HUOBI_API_KEY,
        secret: process.env.HUOBI_SECRET_KEY
      };
      break;
    case 'gateio':
      symbol = req.body.asset.toUpperCase() + '_USDT';
      param = {
        apiKey: process.env.GATEIO_API_KEY,
        secret: process.env.GATEIO_SECRET_KEY
      };
      break;
    case 'okex':
      symbol = req.body.asset + '-USDT';
      param = {
        apiKey: process.env.OKEX_API_KEY,
        secret: process.env.OKEX_SECRET_KEY,
        password: process.env.OKEX_PASSPHRASE
      };
      break;
    default:
      throw new Error(`Unsupported exchange: ${exchangeId}`);
  }

  return {
    symbol,
    param
  };
}

app.post('/cancel/all-orders', async (req, res) => {
  const exchangeId = req.body.exchangeId;

  try {
    const { symbol, param } = createExchangeInstance(exchangeId, req);

    const exchange = new ccxt[exchangeId](param);
    const result = await exchange.cancelAllOrders(symbol);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.post('/bunch-orders', async (req, res) => {
  const exchangeId = req.body.exchangeId;
  const price = req.body.price;
  const amount = req.body.amount;

  try {
    const { symbol, param } = createExchangeInstance(exchangeId, req);

    const exchange = new ccxt[exchangeId](param);
    const result = await exchange.createLimitSellOrder(symbol, amount, price);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// UPDATE
app.post('/update/strat', async (req, res) => {
  const collection = process.env.MONGODB_COLLECTION_STRAT;

  const strat = req.body.strat;
  try {
    await deleteAllDataMDB(collection);
    const data = await saveObjectDataMDB(strat, collection);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});



app.get('/update/cmcData', async (req, res) => {
  const collection = process.env.MONGODB_COLLECTION_CMC;
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
    await deleteAllDataMDB(collection);
    await saveArrayDataMDB(data.data, collection);

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

  const collection = process.env.MONGODB_COLLECTION_BALANCE;

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
      await saveArrayDataMDB(mapData, collection);
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

  const collection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;

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
    const mapData = mapActiveOrders(exchangeId, data);

    if (mapData.length > 0) {
      const deleteParam = { platform: exchangeId };
      await deleteMultipleDataMDB(collection, deleteParam);
      await saveArrayDataMDB(mapData, collection);
    }

    res.json(mapData);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.get('/update/trades/:exchangeId/:symbol', async (req, res) => {
  const { exchangeId, symbol } = req.params;
  const apiKey = process.env[`${exchangeId.toUpperCase()}_API_KEY`];
  const secret = process.env[`${exchangeId.toUpperCase()}_SECRET_KEY`];
  const passphrase = process.env[`${exchangeId.toUpperCase()}_PASSPHRASE`] || '';

  const collection = process.env.MONGODB_COLLECTION_TRADES;

  try {
    const exchangeParams = {
      apiKey,
      secret,
      ...(passphrase && { password: passphrase }) // add passphrase to params if it exists
    };

    const exchange = new ccxt[exchangeId](exchangeParams);

    console.log(exchangeId + " : " + symbol);



    const data = await exchange.fetchMyTrades(symbol);
    //const data = await exchange.fetchMyTrades();

    res.json(data);

    /*
        const mapData = mapTrades(exchangeId, data);
    
        if (mapData.length > 0) {
          const deleteParam = { platform: exchangeId };
          await deleteMultipleDataMDB(collection, deleteParam);
          await saveArrayDataMDB(mapData, collection);
        }
    
        res.json(mapData);*/
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

  const collection = process.env.MONGODB_COLLECTION_LOAD_MARKETS;

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
      await saveArrayDataMDB(mapData, collection);
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