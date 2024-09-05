// src/services/tradeService.js
const { saveData, updateDataMDB } = require("./mongodbService.js");
const { createPlatformInstance } = require("../utils/platformUtil.js");
const { mapTrades } = require("./mapping.js");
const { getData } = require("../utils/dataUtil");
const lastUpdateService = require("./lastUpdateService.js");
const mongodbService = require("./mongodbService.js");

async function fetchDatabaseTrades() {
  const collectionName = process.env.MONGODB_COLLECTION_TRADES;
  return await getData(collectionName);
}

async function updateTradeById(tradeId, updatedTrade) {
  try {
    return await updateDataMDB(
      "collection_trades",
      { _id: tradeId },
      { $set: updatedTrade }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du trade:", error);
    throw error;
  }
}

async function addTradesManually(tradesData) {
  const collectionName = process.env.MONGODB_COLLECTION_TRADES;
  try {
    const savedTrade = await saveData(tradesData, collectionName);
    if (savedTrade.acknowledged) {
      return { message: savedTrade, data: savedTrade, status: 200 };
    } else {
      return { message: savedTrade, data: savedTrade, status: 400 };
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout manuel des trades:", error);
    throw error;
  }
}

async function updateTrades(platform) {
  const collectionName = process.env.MONGODB_COLLECTION_TRADES;
  const platformInstance = createPlatformInstance(platform);

  try {
    const mappedData = [];
    switch (platform) {
      case "kucoin":
        const weeksBack = 4 * 52;
        for (let i = weeksBack; i > 1; i--) {
          const trades = await platformInstance.fetchMyTrades(
            undefined,
            Date.now() - i * 7 * 86400 * 1000,
            500
          );
          if (trades.length > 0) {
            mappedData.push(...mapTrades(platform, trades));
          }
        }
        break;
      case "htx":
        const currentTime = Date.now();
        const windowSize = 48 * 60 * 60 * 1000;
        const totalDuration = 1 * 365 * 24 * 60 * 60 * 1000;
        const iterations = Math.ceil(totalDuration / windowSize);

        for (let i = 0; i < iterations; i++) {
          const startTime = currentTime - (i + 1) * windowSize;
          const endTime = currentTime - i * windowSize;
          const param = {
            "start-time": startTime,
            "end-time": endTime,
          };
          const trades = await platformInstance.fetchMyTrades(
            undefined,
            undefined,
            1000,
            param
          );
          if (trades.length > 0) {
            mappedData.push(...mapTrades(platform, trades));
          }
        }
        break;
    }

    await mongodbService.deleteAndSaveData(mappedData, collectionName, platform);
    await lastUpdateService.saveLastUpdateToDatabase(process.env.TYPE_TRADES, platform);

    return { status: 200, data: mappedData };
  } catch (error) {
    console.error("Erreur lors de la mise à jour des trades:", error);
    throw error;
  }
}

async function fetchLastTrades(platform, symbol) {
  try {
    const platformInstance = createPlatformInstance(platform);
    return await platformInstance.fetchMyTrades(symbol);
  } catch (error) {
    console.error("Erreur lors de la récupération des derniers trades:", error);
    throw error;
  }
}

async function saveTradesToDatabase(newTrades) {
  const collectionName = process.env.MONGODB_COLLECTION_TRADES;
  await saveTrades(newTrades, collectionName, true);
}

async function saveAllTradesToDatabase(newTrades) {
  const collectionName = process.env.MONGODB_COLLECTION_TRADES2;
  await saveTrades(newTrades, collectionName, false);
}

async function saveTrades(newTrades, collection, isFiltered) {
  try {
    let filteredTrades = newTrades;
    if (isFiltered) {
      const existingTrades = await fetchDatabaseTrades();
      filteredTrades = newTrades.filter((newTrade) => {
        return !existingTrades.some(
          (existingTrade) => existingTrade.timestamp === newTrade.timestamp
        );
      });
    }

    const tradesToInsert = filteredTrades.map((trade) => {
      return typeof trade === "object" ? trade : { trade };
    });

    if (tradesToInsert.length > 0) {
      const result = await saveData(tradesToInsert, collection);
      console.log("Trades insérés:", result.insertedCount);
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des trades:", error);
    throw error;
  }
}

module.exports = {
  updateTradeById,
  fetchDatabaseTrades,
  addTradesManually,
  updateTrades,
  fetchLastTrades,
  saveTradesToDatabase,
  saveAllTradesToDatabase,
};