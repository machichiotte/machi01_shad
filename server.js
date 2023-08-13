//server.js
const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cors = require('cors');
const ccxt = require('ccxt');
const fs = require('fs');

const { connectMDB, saveArrayDataMDB, saveObjectDataMDB, deleteMultipleDataMDB, getAllDataMDB, deleteAllDataMDB, updateDataMDB } = require('./mongodb.js');

dotenv.config();
const app = express();
// Specify the folder containing your static files (including JavaScript files)
app.use(express.static('dist'));

const isOfflineMode = process.env.OFFLINE_MODE === 'true';
app.offlineMode = isOfflineMode;

// Use body-parser as a global middleware for all requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const { mapBalance, mapActiveOrders, mapLoadMarkets, mapTrades, mapTradesAddedManually } = require('./utils/mapping.js');

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
app.get('/get/lastUpdate', getLastUpdate);

app.get('/get/history/price/btc', getPriceBtc);
app.get('/get/history/price/eth', getPriceEth);

app.get('/update/cmcData', updateCmcData);
app.get('/update/balance/:exchangeId', updateBalance);
app.get('/update/activeOrders/:exchangeId', updateActiveOrders);
app.post('/update/strat', updateStrat);
app.get('/update/trades/:exchangeId', updateTrades);
app.get('/update/loadMarkets/:exchangeId', updateLoadMarkets);

// POST
app.post('/cancel/order', deleteOrder);
app.post('/cancel/all-orders', cancelAllOrders);
app.post('/bunch-orders', createBunchOrders);

app.post('/add/trades', addTradesManually);





async function addTradesManually(req, res) {
console.log("qddtramanu");  

    const collection = process.env.MONGODB_COLLECTION_TRADES_2; 

console.log("coll:: "+collection);

    const tradesData = req.body.trades_data;  

console.log("tradedataaa::: " + tradesData);

    try {  
      const savedTrade = await saveArrayDataMDB(JSON.stringify(tradesData), collection);  
console.log("savearr");
      if (savedTrade != "" && savedTrade != [])  
      res.status(200).json({ message: savedTrade, status: 200 });  
      else   
        res.status(300).json({message: "que dalle", status:300});  
    } catch (err) {  
          res.status(500).json({ error: err.name + ': ' + err.message });  
    } 
  }



//get
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

async function getLastUpdate(req, res) {
  const collection = 'last_update';
  await getData(req, res, collection, 'db_machi_shad.last_update.json');
}

async function getPriceBtc(req, res) {
  const collection = 'price_btc';
  await getData(req, res, collection, 'db_machi_shad.price_btc.json');
}

async function getPriceEth(req, res) {
  const collection = 'price_eth';
  await getData(req, res, collection, 'db_machi_shad.price_eth.json');
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

    res.status(200).json({
      data: allData,
      deleteResult: deleteResult,
      saveResult: saveResult,
      totalCount: allData.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.name + ': ' + err.message });
  }
}

async function updateStrat(req, res) {
  const collection = process.env.MONGODB_COLLECTION_STRAT;
  const strat = req.body.strat;

  try {
    const del = await deleteAllDataMDB(collection);
    const data = await saveObjectDataMDB(strat, collection);

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.name + ': ' + err.message });
  }
}

async function updateLoadMarkets(req, res) {
  const { exchangeId, updateId } = req.params;

  const collection = process.env.MONGODB_COLLECTION_LOAD_MARKETS;
  const exchange = createExchangeInstance(exchangeId);

  try {
    const data = await exchange.loadMarkets();
    const mappedData = mapLoadMarkets(exchangeId, data);
    await deleteAndSaveData(mappedData, collection, exchangeId);

    updateLastUpdate(exchangeId, 'loadMarket');

    res.status(200).json(mappedData);
  } catch (err) {
    res.status(500).json({ error: err.name + ': ' + err.message });
  }
}

async function updateLastUpdate(exchangeId, param) {
  const collection = 'last_update';
  const filter = {
    platform: exchangeId
  }

  const update = { $set: { [`timestamp.${param}`]: Date.now() } };
  await updateDataMDB(collection, filter, update);
}

async function updateBalance(req, res) {
  const { exchangeId } = req.params;
  const collection = process.env.MONGODB_COLLECTION_BALANCE;
  const exchange = createExchangeInstance(exchangeId);

  try {
    const data = await exchange.fetchBalance();
    const mappedData = mapBalance(exchangeId, data);
    await deleteAndSaveData(mappedData, collection, exchangeId);
    res.status(200).json(mappedData);

    updateLastUpdate(exchangeId, 'balance');

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
            console.log('st :: ' + startTime);
            const trades = await exchange.fetchMyTrades(undefined, undefined, 1000, param);
            console.log('tr :: ' + JSON.stringify(trades));
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

    updateLastUpdate(exchangeId, 'trades');


  } catch (err) {
    res.status(500).json({ error: err.name + ': ' + err.message });
  }
}

async function updateActiveOrders(req, res) {
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

    const mappedData = mapActiveOrders(exchangeId, data);
    await deleteAndSaveData(mappedData, collection, exchangeId);
    res.status(200).json(mappedData);

    updateLastUpdate(exchangeId, 'activeOrders');

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.name + ': ' + err.message });
  }
}

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
    console.log('errorrr : ' + err);
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
    console.log('error cre :: ' + err);
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
    console.log('del err :: ' + err)
    //console.error(err);
    res.status(500).json({ error: 'Internal server error', status: 500 });
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

const PORT = process.env.PORT || 10000; //3000 before

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
