// src/services/utils.js
const ccxt = require("ccxt");
const { AuthenticationError } = require("ccxt");
const path = require("path");
const fs = require("fs").promises; // Ajout de l'import pour fs.promises
const {
  saveData,
  deleteMultipleDataMDB,
  getAllDataMDB,
  updateDataMDB,
  deleteAllDataMDB,
} = require("./mongodb.js");
const { mapMarkets } = require("./mapping.js");

// Fonction utilitaire pour créer une instance d'échange
function createExchangeInstance(exchangeId) {
  const apiKey = process.env[`${exchangeId.toUpperCase()}_API_KEY`];
  const secret = process.env[`${exchangeId.toUpperCase()}_SECRET_KEY`];
  const passphrase =
    process.env[`${exchangeId.toUpperCase()}_PASSPHRASE`] || "";

  if (!apiKey) {
    throw new Error(`API key missing for exchange: ${exchangeId}`);
  }

  if (!secret) {
    throw new Error(`API secret missing for exchange: ${exchangeId}`);
  }

  // Ajoutez ceci pour vérifier si l'échange est pris en charge
  if (!["binance", "kucoin", "htx", "okx", "gateio"].includes(exchangeId)) {
    throw new Error(`Unsupported exchange: ${exchangeId}`);
  }

  try {
    // Vérifier si la classe CCXT existe
    if (!(exchangeId in ccxt)) {
      throw new Error(`Unsupported exchange: ${exchangeId}`);
    }

    const exchangeParams = {
      apiKey,
      secret,
      ...(passphrase && { password: passphrase }), // Ajout de passphrase aux paramètres s'il existe
    };

    const exchange = new ccxt[exchangeId](exchangeParams);

    return exchange;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      // Gérer spécifiquement les erreurs d'authentification
      throw new AuthenticationError(
        `Authentication error for ${exchangeId}: ${error.message}`
      );
    } else {
      // Gérer les autres erreurs
      throw new Error(
        `Error creating exchange instance for ${exchangeId}: ${error.message}`
      );
    }
  }
}

function getSymbolForExchange(exchangeId, asset) {
  let symbol;

  switch (exchangeId) {
    case "kucoin":
      symbol = `${asset}-USDT`;
      break;
    case "binance":
      symbol = `${asset}USDT`;
      break;
    case "htx":
      symbol = `${asset.toLowerCase()}usdt`;
      break;
    case "gateio":
      symbol = `${asset.toUpperCase()}_USDT`;
      break;
    case "okx":
      symbol = `${asset}-USDT`;
      break;
    default:
      throw new Error(`Unsupported exchange: ${exchangeId}`);
  }

  return symbol;
}

// Fonction utilitaire pour créer une instance d'échange avec la demande
function createExchangeInstanceWithReq(exchangeId, req) {
  const apiKey = process.env[`${exchangeId.toUpperCase()}_API_KEY`];
  const secret = process.env[`${exchangeId.toUpperCase()}_SECRET_KEY`];
  const passphrase =
    process.env[`${exchangeId.toUpperCase()}_PASSPHRASE`] || "";
  const asset = req.body.asset;
  const symbol = getSymbolForExchange(exchangeId, asset);

  const exchangeParams = {
    apiKey,
    secret,
    ...(passphrase && { password: passphrase }), // Ajout de passphrase aux paramètres s'il existe
  };

  return {
    symbol,
    exchangeParams,
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

// Fonction utilitaire pour obtenir le chemin du fichier mock en fonction de la collection
function getMockDataPath(collection) {
  // Ajoutez la logique pour retourner le nom spécifique du mock en fonction de la collection
  const collectionMockName = `${collection}.json`;
  return path.join(__dirname, "mockData", "mongodb", collectionMockName);
}

async function getData(req, res, collection) {
  //console.log('getData req', req)
  try {
    const data = await getDataFromCollection(collection);

    if (res) res.json(data);
    else return data;
  } catch (err) {
    console.error("getData", err);
    if (res) res.status(500).send({ error: "Internal server error" });
  }
}

// Fonction utilitaire pour obtenir des données depuis une collection
async function getDataFromCollection(collection) {
  try {
    if (process.env.OFFLINE_MODE === "true") {
      // Récupérer le chemin du fichier mock en fonction de la collection
      const mockDataPath = getMockDataPath(collection);
      
      // Lire les données depuis le fichier mock
      const jsonData = await fs.readFile(mockDataPath, "utf8");
      return JSON.parse(jsonData);
    } else {
      // Récupérer les données depuis la base de données MongoDB
      return await getAllDataMDB(collection);
    }
  } catch (err) {
    console.error("getDataFromCollection", err);
    throw err;
  }
}

// Fonction utilitaire pour supprimer et sauvegarder des données
async function deleteAndSaveData(mapData, collection, exchangeId) {
  if (mapData && mapData.length > 0) {
    const deleteParam = { platform: exchangeId };
    await deleteMultipleDataMDB(collection, deleteParam);
    await saveData(mapData, collection);
  }
}

async function deleteAndSaveObject(mapData, collection) {
  if (mapData && Object.keys(mapData).length > 0) {
    await deleteAllDataMDB(collection);
    await saveData(mapData, collection);
  }
}

// Fonction utilitaire pour la tâche cron de mise à jour des marchés
async function cronMarkets(exchangeId) {
  const collection = process.env.MONGODB_COLLECTION_LOAD_MARKETS;
  const exchange = createExchangeInstance(exchangeId);

  try {
    const data = await exchange.loadMarkets();
    const mappedData = mapMarkets(exchangeId, data);
    await deleteAndSaveData(mappedData, collection, exchangeId);
    saveLastUpdateToMongoDB(process.env.TYPE_LOAD_MARKETS, exchangeId);
  } catch (err) {
    console.log("Error updateMarkets:", err);
  }
}

function handleErrorResponse(res, error, functionName) {
  if (error instanceof AuthenticationError) {
    console.error(`Authentication error in ${functionName}:`, error.message);
    res.status(401).json({
      success: false,
      error: `Authentication error in ${functionName}`,
      message: error.message,
    });
  } else {
    console.error(`Error in ${functionName}:`, error);
    res.status(500).json({ success: false, error });
  }
}

module.exports = {
  createExchangeInstance,
  createExchangeInstanceWithReq,
  updateTimestampInMongoDB,
  saveLastUpdateToMongoDB,
  getData,
  getDataFromCollection,
  deleteAndSaveData,
  deleteAndSaveObject,
  cronMarkets,
  handleErrorResponse,
  getSymbolForExchange
};
