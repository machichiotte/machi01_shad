// src/utils/cronUtil.js
const {
  deleteAndSaveData,
  saveLastUpdateToMongoDB,
} = require("./mongodbUtil.js");
const { createExchangeInstance } = require("./exchangeUtil.js");

const { mapMarkets, mapTickers } = require("../services/mapping.js");

// Fonction utilitaire pour la tâche cron de mise à jour des marchés
async function cronUtilsMarkets(exchangeId) {
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

async function cronUtilsTickers(exchangeId) {
  const collection = process.env.MONGODB_COLLECTION_TICKERS;
  const exchange = createExchangeInstance(exchangeId);

  try {
    const data = await exchange.fetchTickers();
    // console.log("cronTickers exchangeId", exchangeId);
    // console.log("cronTickers data", data);
    const mappedData = mapTickers(data, exchangeId);
    //console.log('cronTickers mappedData', mappedData)
    await deleteAndSaveData(mappedData, collection, exchangeId);
    saveLastUpdateToMongoDB(process.env.TYPE_TICKERS, exchangeId);
  } catch (err) {
    console.log("Error updateTickers:", err);
  }
}

module.exports = {
  cronUtilsMarkets,
  cronUtilsTickers,
};
