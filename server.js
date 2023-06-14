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
app.get('/get/balance', getBalance);
app.get('/get/cmcData', getCmcData);
app.get('/get/activeOrders', getActiveOrders);
app.get('/get/strat', getStrat);
app.get('/get/trades', getTrades);
app.get('/get/loadMarkets', getLoadMarkets);

app.get('/update/cmcData', updateCmcData);
app.get('/update/balance/:exchangeId', updateBalance);
app.get('/update/activeOrders/:exchangeId', updateActiveOrders);
app.post('/update/strat', updateStrat);
app.get('/update/trades/:exchangeId/:symbol', updateTrades);
app.get('/update/loadMarkets/:exchangeId', updateLoadMarkets);

// POST
app.post('/cancel/order', deleteOrder);
app.post('/cancel/all-orders', cancelAllOrders);
app.post('/bunch-orders', createBunchOrders);

//get
async function getData(req, res, collection, mockDataFile) {
  try {
    let data;

    if (app.offlineMode) {
      const mockDataPath = `./mockData/${mockDataFile}`;
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
}

async function getBalance(req, res) {
  const collection = process.env.MONGODB_COLLECTION_BALANCE;
  await getData(req, res, collection, 'db_machi_shad.collection_balance.json');
}

async function getCmcData(req, res) {
  const collection = process.env.MONGODB_COLLECTION_CMC;
  await getData(req, res, collection, 'db_machi_shad.collection_cmc.json');
}

async function getActiveOrders(req, res) {
  const collection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;
  await getData(req, res, collection, 'db_machi_shad.collection_active_orders.json');
}

async function getStrat(req, res) {
  const collection = process.env.MONGODB_COLLECTION_STRAT;
  await getData(req, res, collection, 'db_machi_shad.collection_strategy.json');
}

async function getTrades(req, res) {
  const collection = process.env.MONGODB_COLLECTION_TRADES;
  await getData(req, res, collection, 'db_machi_shad.collection_trades.json');
}

async function getLoadMarkets(req, res) {
  const collection = process.env.MONGODB_COLLECTION_LOAD_MARKETS;
  await getData(req, res, collection, 'db_machi_shad.collection_load_markets.json');
}


//update
async function updateCmcData(req, res) {
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
}

async function updateStrat(req, res) {
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
}

const updateData = async (req, res, exchangeId, dataFetcher, mapDataFn, collection) => {
  const exchange = createExchangeInstance(exchangeId);

  try {
    const data = await dataFetcher(exchange);
    const mappedData = mapDataFn(exchangeId, data);

    await deleteAndSaveData(mappedData, collection, exchangeId);
    res.json(mappedData);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
};

async function updateLoadMarkets(req, res) {
  const { exchangeId } = req.params;
  const collection = process.env.MONGODB_COLLECTION_LOAD_MARKETS;

  await updateData(
    req,
    res,
    exchangeId,
    exchange => exchange.loadMarkets(),
    mapLoadMarkets,
    collection
  );
};

async function updateTrades(req, res) {
  const { exchangeId, symbol } = req.params;
  const collection = process.env.MONGODB_COLLECTION_TRADES;

  await updateData(
    req,
    res,
    exchangeId,
    exchange => exchange.fetchMyTrades(symbol),
    mapTrades,
    collection
  );
};

async function updateBalance(req, res) {
  const { exchangeId } = req.params;
  const collection = process.env.MONGODB_COLLECTION_BALANCE;

  await updateData(
    req,
    res,
    exchangeId,
    exchange => exchange.fetchBalance(),
    mapBalance,
    collection
  );
};

async function updateActiveOrders(req, res) {
  const { exchangeId } = req.params;
  const collection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;

  await updateData(
    req,
    res,
    exchangeId,
    async exchange => {
      if (exchangeId === 'binance') {
        exchange.options.warnOnFetchOpenOrdersWithoutSymbol = false;
      }
      return exchange.fetchOpenOrders();
    },
    mapActiveOrders,
    collection
  );
};

async function deleteAndSaveData(mapData, collection, exchangeId) {
  if (mapData.length > 0) {
    const deleteParam = { platform: exchangeId };
    await deleteMultipleDataMDB(collection, deleteParam);
    await saveArrayDataMDB(mapData, collection);
  }
}

//orders
async function deleteOrder(req, res) {
  const { exchangeId, oId, symbol } = req.body;

  try {
    const exchange = createExchangeInstance(exchangeId);
    const data = await exchange.cancelOrder(oId, symbol.replace("/", ""));
    res.json(data);
    //mise a jour activeOrder si envie ?
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
}

async function createBunchOrders(req, res) {
  const exchangeId = req.body.exchangeId;
  const price = req.body.price;
  const amount = req.body.amount;

  try {
    const { symbol, param } = createExchangeInstanceWithReq(exchangeId, req);

    const exchange = new ccxt[exchangeId](param);
    const result = await exchange.createLimitSellOrder(symbol, amount, price);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
}

async function cancelAllOrders(req, res) {
  const exchangeId = req.body.exchangeId;

  try {
    const exchange = createExchangeInstance(exchangeId);

    const symbol = req.body.asset;
    const result = await exchange.cancelAllOrders(symbol);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
}

// create Instances
function createExchangeInstance(exchangeId) {
  const apiKey = process.env[`${exchangeId.toUpperCase()}_API_KEY`];
  const secret = process.env[`${exchangeId.toUpperCase()}_SECRET_KEY`];
  const passphrase = process.env[`${exchangeId.toUpperCase()}_PASSPHRASE`] || '';

  const exchangeParams = {
    apiKey: apiKey,
    secret: secret,
    enableRateLimit: true,
    ...(passphrase && { password: passphrase }) // add passphrase to params if it exists
  };

  const exchange = new ccxt[exchangeId](exchangeParams);
  return exchange;
}

function createExchangeInstanceWithReq(exchangeId, req) {
  const apiKey = process.env[`${exchangeId.toUpperCase()}_API_KEY`];
  const secret = process.env[`${exchangeId.toUpperCase()}_SECRET_KEY`];
  const passphrase = process.env[`${exchangeId.toUpperCase()}_PASSPHRASE`] || '';
  let symbol;

  const exchangeParams = {
    apiKey,
    secret,
    enableRateLimit: true,
    ...(passphrase && { password: passphrase }) // add passphrase to params if it exists
  };

  switch (exchangeId) {
    case 'kucoin':
      symbol = req.body.asset + '-USDT';
      break;
    case 'binance':
      symbol = req.body.asset + 'USDT';
      break;
    case 'huobi':
      symbol = req.body.asset.toLowerCase() + 'usdt';
      break;
    case 'gateio':
      symbol = req.body.asset.toUpperCase() + '_USDT';
      break;
    case 'okex':
      symbol = req.body.asset + '-USDT';
      break;
    default:
      throw new Error(`Unsupported exchange: ${exchangeId}`);
  }

  return {
    symbol,
    exchangeParams
  };
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});