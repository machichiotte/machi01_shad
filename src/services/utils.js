// src/services/utils.js
const ccxt = require('ccxt');
const fs = require('fs').promises; // Ajout de l'import pour fs.promises
const {
  saveArrayDataMDB,
  deleteMultipleDataMDB,
  getAllDataMDB,
  updateDataMDB,
} = require('./mongodb.js');
const { mapLoadMarkets } = require('./mapping.js');

// Fonction utilitaire pour créer une instance d'échange
function createExchangeInstance(exchangeId) {
  const apiKey = process.env[`${exchangeId.toUpperCase()}_API_KEY`];
  const secret = process.env[`${exchangeId.toUpperCase()}_SECRET_KEY`];
  const passphrase = process.env[`${exchangeId.toUpperCase()}_PASSPHRASE`] || '';

  const exchangeParams = {
    apiKey,
    secret,
    ...(passphrase && { password: passphrase }) // Ajout de passphrase aux paramètres s'il existe
  };

  const exchange = new ccxt[exchangeId](exchangeParams);
  return exchange;
}

// Fonction utilitaire pour créer une instance d'échange avec la demande
function createExchangeInstanceWithReq(exchangeId, req) {
  const apiKey = process.env[`${exchangeId.toUpperCase()}_API_KEY`];
  const secret = process.env[`${exchangeId.toUpperCase()}_SECRET_KEY`];
  const passphrase = process.env[`${exchangeId.toUpperCase()}_PASSPHRASE`] || '';
  let symbol;

  const exchangeParams = {
    apiKey,
    secret,
    ...(passphrase && { password: passphrase }) // Ajout de passphrase aux paramètres s'il existe
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

// Fonction utilitaire pour mettre à jour le timestamp dans MongoDB
async function updateTimestampInMongoDB(collectionName, filter, update) {
  try {
    await updateDataMDB(collectionName, filter, update);
  } catch (err) {
    console.error(err);
  }
}

// Fonction utilitaire pour sauvegarder la dernière mise à jour dans MongoDB
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

// Fonction utilitaire pour obtenir des données
async function getData(req, res, collection, mockDataFile) {
  try {
    let data;

    if (process.env.OFFLINE_MODE === 'true') {
      const mockDataPath = `./mockData/mongodb/${mockDataFile}`;
      const jsonData = await fs.readFile(mockDataPath, 'utf8'); // Utilisation de fs.promises.readFile
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

// Fonction utilitaire pour supprimer et sauvegarder des données
async function deleteAndSaveData(mapData, collection, exchangeId) {
  if (mapData.length > 0) {
    const deleteParam = { platform: exchangeId };
    await deleteMultipleDataMDB(collection, deleteParam);
    await saveArrayDataMDB(mapData, collection);
  }
}

// Fonction utilitaire pour la tâche cron de mise à jour des marchés
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

module.exports = {
  createExchangeInstance,
  createExchangeInstanceWithReq,
  updateTimestampInMongoDB,
  saveLastUpdateToMongoDB,
  getData,
  deleteAndSaveData,
  cronLoadMarkets
};
