//server.js
const dotenv = require('dotenv');
const cron = require('node-cron');
const express = require('express');
const bodyParser = require('body-parser');
//const fetch = require('node-fetch');
const cors = require('cors');
const ccxt = require('ccxt');
const fs = require('fs');

const { connectMDB, saveArrayDataMDB, saveObjectDataMDB, deleteMultipleDataMDB, getAllDataMDB, deleteAllDataMDB, updateDataMDB } = require('./mongodb.js');

dotenv.config();

// Tableau d'échanges à mettre à jour
const exchangesToUpdate = ['binance', 'kucoin', 'huobi', 'okex', 'gateio'];
const CRON_LOAD_MARKETS = '40 10 * * *';

// Ajoutez la tâche cron dans votre fichier server.js
cron.schedule(CRON_LOAD_MARKETS, async () => {
  console.log('Running the cron job for updateLoadMarkets...');

  // Boucle sur chaque échange et appelle updateLoadMarkets
  for (const exchangeId of exchangesToUpdate) {
    try {
      await cronLoadMarkets(exchangeId);
      console.log(`updateLoadMarkets completed for ${exchangeId}`);
    } catch (error) {
      console.error(`Error updating markets for ${exchangeId}:`, error);
    }
  }
});

async function cronLoadMarkets(exchangeId) {
  const collection = process.env.MONGODB_COLLECTION_LOAD_MARKETS;
  const exchange = createExchangeInstance(exchangeId);

  try {
    const data = await exchange.loadMarkets();
    const mappedData = mapLoadMarkets(exchangeId, data);
    await deleteAndSaveData(mappedData, collection, exchangeId);
    saveLastUpdateToMongoDB(process.env.TYPE_LOAD_MARKETS, exchangeId);
  } catch (err) {
    console.log('Error updateLoadMarkets:', err);
  }
}

const app = express();
// Specify the folder containing your static files (including JavaScript files)
app.use(express.static('dist'));

const isOfflineMode = process.env.OFFLINE_MODE === 'true';
app.offlineMode = isOfflineMode;

// Use body-parser as a global middleware for all requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const { mapBalance, mapOrders, mapLoadMarkets, mapTrades, mapTradesAddedManually } = require('./utils/mapping.js');

// Connect to the MongoDB database
connectMDB();

app.use(cors());

//balance
app.get('/get/balance', getBalance);
app.get('/update/balance/:exchangeId', updateBalance);

async function getBalance(req, res) {
  const collection = process.env.MONGODB_COLLECTION_BALANCE;
  await getData(req, res, collection, 'db_machi_shad.collection_balance.json');
}
async function updateBalance(req, res) {
  const { exchangeId } = req.params;
  const collection = process.env.MONGODB_COLLECTION_BALANCE;
  const exchange = createExchangeInstance(exchangeId);

  try {
    const data = await exchange.fetchBalance();
    console.log('data update balance ', data);
    const mappedData = mapBalance(exchangeId, data);
    console.log('mappedData ', mappedData);

    await deleteAndSaveData(mappedData, collection, exchangeId);
    res.status(200).json(mappedData);
    saveLastUpdateToMongoDB(process.env.TYPE_BALANCE, exchangeId);
  } catch (err) {
    console.log('Erreur lors de updateBalance:', err);
    res.status(500).json({ error: err.name + ': ' + err.message });
  }
}

//cmc
app.get('/get/cmcData', getCmcData);
app.get('/update/cmcData', updateCmcData);

async function getCmcData(req, res) {
  const collection = process.env.MONGODB_COLLECTION_CMC;
  await getData(req, res, collection, 'db_machi_shad.collection_cmc.json');
}
async function updateCmcData(req, res) {
  const collection = process.env.MONGODB_COLLECTION_CMC;
  const API_KEY = process.env.CMC_APIKEY;
  const limit = 5000;
  const baseStart = 1;
  const convert = 'USD';

  try {
    let start = baseStart;
    const allData = [];

    while (true) {
      const URL = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=${start}&limit=${limit}&convert=${convert}`;

      const response = await fetch(URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CMC_PRO_API_KEY': API_KEY
        }
      });

      const data = await response.json();

      if (data.data.length === 0) {
        break; // Pas de données supplémentaires, arrêter la boucle
      }

      allData.push(...data.data);
      start += limit;
    }

    // Enregistrement des données dans MongoDB
    const deleteResult = await deleteAllDataMDB(collection);
    const saveResult = await saveArrayDataMDB(allData, collection);
    saveLastUpdateToMongoDB(process.env.TYPE_CMC, "");

    res.status(200).json({
      data: allData,
      deleteResult: deleteResult,
      saveResult: saveResult,
      totalCount: allData.length
    });
  } catch (err) {
    console.error(err);
    console.log('Error updateCmcData:', err);
    res.status(500).json({ error: err.name + ': ' + err.message });
  }
}

//strat
app.get('/get/strategy', getStrat);
app.post('/update/strategy', updateStrat);

async function getStrat(req, res) {
  const collection = process.env.MONGODB_COLLECTION_STRAT;
  await getData(req, res, collection, 'db_machi_shad.collection_strategy.json');
}
async function updateStrat(req, res) {
  const collection = process.env.MONGODB_COLLECTION_STRAT;
  const strat = req.body;

  try {
    await deleteAllDataMDB(collection);
    const data = await saveArrayDataMDB(strat, collection);
    saveLastUpdateToMongoDB(process.env.TYPE_STRATEGY, "");

    res.json(data);
  } catch (err) {
    console.error(err);
    console.log('Error updateStrat:', err);
    res.status(500).send({ error: err.name + ': ' + err.message });
  }
}

//orders
app.get('/get/orders', getOrders);
app.get('/update/orders/:exchangeId', updateOrders);

async function getOrders(req, res) {
  const collection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;
  await getData(req, res, collection, 'db_machi_shad.collection_active_orders.json');
}
async function updateOrders(req, res) {
  const { exchangeId } = req.params;

  const collection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;
  let data;
  try {
    const exchange = createExchangeInstance(exchangeId);

    if (exchangeId === 'binance') {
      exchange.options.warnOnFetchOpenOrdersWithoutSymbol = false;
    }

    if (exchangeId === 'kucoin') {
      const pageSize = 50;
      let currentPage = 1;
      data = [];

      while (true) {
        const limit = 50
        const params = {
          'currentPage': currentPage,
        }
        const orders = await exchange.fetchOpenOrders(undefined, undefined, limit, { 'currentPage': currentPage });
        data = data.concat(orders);
        if (orders.length < pageSize) {
          break;
        }
        currentPage++;
      }
    } else {
      data = await exchange.fetchOpenOrders();
    }

    const mappedData = mapOrders(exchangeId, data);
    await deleteAndSaveData(mappedData, collection, exchangeId);
    res.status(200).json(mappedData);

    saveLastUpdateToMongoDB(process.env.TYPE_ACTIVE_ORDERS, exchangeId);

  } catch (err) {
    console.error(err);
    console.log('Error updateOrders : ' + err);

    res.status(500).json({ error: err.name + ': ' + err.message });
  }
}

//load markets
app.get('/get/loadMarkets', getLoadMarkets);
app.get('/update/loadMarkets/:exchangeId', updateLoadMarkets);

async function getLoadMarkets(req, res) {
  const collection = process.env.MONGODB_COLLECTION_LOAD_MARKETS;
  await getData(req, res, collection, 'db_machi_shad.collection_load_markets.json');
}
async function updateLoadMarkets(req, res) {
  const { exchangeId } = req.params;

  const collection = process.env.MONGODB_COLLECTION_LOAD_MARKETS;
  const exchange = createExchangeInstance(exchangeId);

  try {
    const data = await exchange.loadMarkets();
    const mappedData = mapLoadMarkets(exchangeId, data);
    await deleteAndSaveData(mappedData, collection, exchangeId);
    saveLastUpdateToMongoDB(process.env.TYPE_LOAD_MARKETS, exchangeId);
    res.status(200).json(mappedData);
  } catch (err) {
    console.log('Error updateLoadMarkets:', err);
    res.status(500).json({ error: err.name + ': ' + err.message });
  }
}

//orders
app.post('/cancel/order', deleteOrder);
app.post('/bunch-orders', createBunchOrders);
app.post('/cancel/all-orders', cancelAllOrders);

async function deleteOrder(req, res) {
  const { exchangeId, oId, symbol } = req.body;

  try {
    const exchange = createExchangeInstance(exchangeId);
    const data = await exchange.cancelOrder(oId, symbol.replace("/", ""));
    res.json(data);
    //mise a jour order si envie ?
  } catch (err) {
    console.log('Error deleteOrder : ' + err);
    //console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
}
async function createBunchOrders(req, res) {
  const exchangeId = req.body.exchangeId;
  const price = req.body.price;
  const amount = req.body.amount;

  try {
    const { symbol, exchangeParams } = createExchangeInstanceWithReq(exchangeId, req);

    const exchange = new ccxt[exchangeId](exchangeParams);
    const result = await exchange.createLimitSellOrder(symbol, amount, price);

    res.status(200).json({ message: result, status: 200 })

  } catch (err) {
    //console.error(err);
    console.log('Error createBunchOrders :: ' + err);
    res.status(500).json({ error: 'Internal server error', status: 500 });
  }
}
async function cancelAllOrders(req, res) {
  const exchangeId = req.body.exchangeId;
  let symbol, result;
  try {
    const exchange = createExchangeInstance(exchangeId);

    switch (exchangeId) {
      case 'kucoin':
        symbol = req.body.asset + '-USDT';
        result = await exchange.cancelAllOrders(symbol)
        break;
      case 'binance':
        symbol = req.body.asset + 'USDT';
        result = await exchange.cancelAllOrders(symbol)
        break;
      case 'huobi':
        symbol = req.body.asset.toLowerCase() + 'usdt';
        result = await exchange.cancelAllOrders(symbol)
        break;
      case 'gateio':
        symbol = req.body.asset.toUpperCase() + '_USDT';
        result = await exchange.cancelAllOrders(symbol)
        break;
      case 'okex':
        symbol = req.body.asset + '-USDT';

        // Obtenir les ordres ouverts pour l'actif spécifié
        const orders = await exchange.fetchOpenOrders(symbol);

        // Obtenir les IDs des ordres
        const orderIds = orders.map(order => order.id);

        if (orderIds.length === 0) {
          result = { message: 'Aucun ordre ouvert pour cet actif' };
        } else {
          // Appeler la méthode cancelOrders() de CCXT pour OKEx avec les IDs des ordres à annuler
          result = await exchange.cancelOrders(orderIds, symbol);
        }
        break;
      default:
        throw new Error(`Unsupported exchange: ${exchangeId}`);
    }

    res.status(200).json({ message: result, status: 200 })
  } catch (err) {
    console.log('Error cancelAllOrders :: ' + err)
    //console.error(err);
    res.status(500).json({ error: 'Internal server error', status: 500 });
  }
}

//prices
app.get('/get/history/price/btc', getPriceBtc);
app.get('/get/history/price/eth', getPriceEth);

async function getPriceBtc(req, res) {
  const collection = process.env.MONGODB_COLLECTION_PRICE_BTC;
  await getData(req, res, collection, 'db_machi_shad.price_btc.json');
}
async function getPriceEth(req, res) {
  const collection = process.env.MONGODB_COLLECTION_PRICE_ETH;
  await getData(req, res, collection, 'db_machi_shad.price_eth.json');
}

//trades
app.get('/get/trades', getTrades);
app.post('/add/trades', addTradesManually);
app.get('/update/trades/:exchangeId', updateTrades);

async function getTrades(req, res) {
  const collection = process.env.MONGODB_COLLECTION_TRADES;
  await getData(req, res, collection, 'db_machi_shad.collection_trades.json');
}
async function addTradesManually(req, res) {
  const collection = process.env.MONGODB_COLLECTION_TEST;
  //TODO modifier nom bdd
  const tradesData = req.body.trades_data;

  try {
    const savedTrade = await saveArrayDataMDB(tradesData, collection);
    const result = await savedTrades.json();
    res.status(200).json({ message: result, data: savedTrade, status: 200 });
  } catch (err) {
    res.status(500).json({ error: err.name + ': ' + err.message });
  }
}
async function updateTrades(req, res) {
  const { exchangeId } = req.params;
  const collection = process.env.MONGODB_COLLECTION_TRADES;
  const exchange = createExchangeInstance(exchangeId);

  try {
    const mappedData = [];

    switch (exchangeId) {
      case 'kucoin':
        const weeksBack = 4 * 52;
        for (let i = weeksBack; i > 1; i--) {
          try {
            const trades = await exchange.fetchMyTrades(undefined, Date.now() - i * 7 * 86400 * 1000, 500);

            if (trades.length > 0) {
              mappedData.push(...mapTrades(exchangeId, trades));
            }
          } catch (err) {
            console.log('Erreur lors de la récupération des trades:', err);
            res.status(500).json({ error: err.name + ': ' + err.message });
          }
        }
        break;
      case 'huobi':
        console.log('inside huobi');

        //const types = 'buy-market,sell-market,buy-limit,sell-limit'; // Les types d'ordre à inclure dans la recherche, séparés par des virgules
        const currentTime = Date.now();
        const windowSize = 48 * 60 * 60 * 1000; // Taille de la fenêtre de recherche (48 heures)
        const totalDuration = 1 * 365 * 24 * 60 * 60 * 1000; // Durée totale de recherche (4 ans)
        const iterations = Math.ceil(totalDuration / windowSize);

        for (let i = 0; i < iterations; i++) {
          console.log(i);
          const startTime = currentTime - (i + 1) * windowSize;
          const endTime = currentTime - i * windowSize;

          param = {
            'start-time': startTime,
            'end-time': endTime,
          }

          try {
            const trades = await exchange.fetchMyTrades(undefined, undefined, 1000, param);
            if (trades.length > 0) {
              mappedData.push(...mapTrades(exchangeId, trades));
            }

          } catch (err) {
            console.log('Erreur lors de la récupération des commandes:', err);
            res.status(500).json({ error: err.name + ': ' + err.message });
          }
        }
        break;
    }

    try {
      await deleteAndSaveData(mappedData, collection, exchangeId);
    } catch (err) {
      console.log('Error suppression sauvegarde:', err);
      res.status(500).json({ error: err.name + ': ' + err.message });
    }
    if (tradesData.length > 0) {
      res.status(200).json(tradesData);
    } else {
      res.status(201).json({ empty: 'empty' });
    }
    saveLastUpdateToMongoDB(process.env.TYPE_TRADES, exchangeId);
  } catch (err) {
    res.status(500).json({ error: err.name + ': ' + err.message });
  }
}

//last update
app.get('/get/lastUpdate', getLastUpdate);
app.get('/get/lastUpdate/:type/:exchangeId', getUniqueLastUpdate);

async function getUniqueLastUpdate(req, res) {
  try {
    const { exchangeId, type } = req.params;
    const collectionName = process.env.MONGODB_COLLECTION_LAST_UPDATE;

    // Assurez-vous que le type est un type valide que vous gérez (par exemple, "loadMarkets" ou "balance")
    // Ajoutez d'autres types au besoin

    const filter = { exchangeId, type };
    const lastUpdateData = await getDataMDB(collectionName, filter);

    if (lastUpdateData.length > 0) {
      res.json(lastUpdateData[0]); // Prenez le premier document trouvé (il ne devrait y en avoir qu'un)
    } else {
      res.json({ exchangeId, type, timestamp: null });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
}
async function getLastUpdate(req, res) {
  const collection = process.env.MONGODB_COLLECTION_LAST_UPDATE;
  await getData(req, res, collection, 'db_machi_shad.last_update.json');
}

async function updateTimestampInMongoDB(collectionName, filter, update) {
  try {
    await updateDataMDB(collectionName, filter, update);
  } catch (err) {
    console.error(err);
  }
}
async function saveLastUpdateToMongoDB(type, exchangeId) {
  const collectionName = process.env.MONGODB_COLLECTION_LAST_UPDATE;

  // Récupérer les données actuelles dans la collection
  const existingData = (await getAllDataMDB(collectionName))[0] || {};

  // Mettre à jour les données avec le nouveau timestamp
  if (!exchangeId) {
    existingData[type] = Date.now();
  } else {
    if (!existingData[type]) {
      existingData[type] = {};
    }

    existingData[type][exchangeId] = Date.now();
  }

  // Enregistrer les données mises à jour dans MongoDB
  const filter = {};
  const update = { $set: existingData };

  await updateTimestampInMongoDB(collectionName, filter, update);
}

//global stuff
async function getData(req, res, collection, mockDataFile) {
  try {
    let data;

    if (app.offlineMode) {
      const mockDataPath = `./mockData/${mockDataFile}`;
      const jsonData = fs.readFileSync(mockDataPath, 'utf8');
      data = JSON.parse(jsonData);
    } else {
      console.log(collection);
      data = await getAllDataMDB(collection);
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
}

async function deleteAndSaveData(mapData, collection, exchangeId) {
  if (mapData.length > 0) {
    const deleteParam = { platform: exchangeId };
    await deleteMultipleDataMDB(collection, deleteParam);
    await saveArrayDataMDB(mapData, collection);
  }
}

// create Instances
function createExchangeInstance(exchangeId) {
  const apiKey = process.env[`${exchangeId.toUpperCase()}_API_KEY`];
  const secret = process.env[`${exchangeId.toUpperCase()}_SECRET_KEY`];
  const passphrase = process.env[`${exchangeId.toUpperCase()}_PASSPHRASE`] || '';

  const exchangeParams = {
    apiKey,
    secret,
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

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
