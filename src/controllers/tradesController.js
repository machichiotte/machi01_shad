// src/controllers/tradesController.js
const { saveData } = require("../services/mongodbService.js");
const {
  deleteAndSaveData,
  saveLastUpdateToMongoDB,
} = require("../utils/mongodbUtil.js");
const { createPlatformInstance } = require("../utils/platformUtil.js");
const { getData } = require("../utils/dataUtil.js");

const { mapTrades } = require("../services/mapping.js");
const { handleErrorResponse } = require("../utils/errorUtil.js");
const { errorLogger } = require("../utils/loggerUtil.js");

async function getTrades(req, res) {
  const collectionName = process.env.MONGODB_COLLECTION_TRADES;
  try {
    const lastTrades = await getData(collectionName);
    console.log("Retrieved last Trades", {
      collectionName,
      count: lastTrades.length,
    });
    res.json(lastTrades);
  } catch (error) {
    errorLogger.error("Failed to get trades", { error: error.message });
    handleErrorResponse(res, error, "getTrades");
  }
}

/**
 * Retrieves the last recorded trades from the database.
 * @returns {Object} - The last recorded trades.
 */
async function fetchTradesInDatabase() {
  const collectionName = process.env.MONGODB_COLLECTION_TRADES;
  const data = await getData(collectionName);
  console.log(
    `🚀 ~ file: tradesController.js:34 ~ fetchTradesInDatabase ~ data:`,
    data.length
  );
  return data;
}

async function addTradesManually(req, res) {
  const collectionName = process.env.MONGODB_COLLECTION_TRADES;
  const tradesData = req.body.trades_data;
  try {
    const savedTrade = await saveData(tradesData, collectionName);

    if (savedTrade.acknowledged) {
      res
        .status(200)
        .json({ message: savedTrade, data: savedTrade, status: 200 });
    } else {
      res
        .status(400)
        .json({ message: savedTrade, data: savedTrade, status: 400 });
    }
  } catch (err) {
    res.status(500).json({ error: err.name + ": " + err.message });
  }
}

async function saveTradesToDatabase(newTrades) {
  const collectionName = process.env.MONGODB_COLLECTION_TRADES;
  saveTrades(newTrades, collectionName, true);
}

async function saveAllTradesToDatabase(newTrades) {
  const collectionName = process.env.MONGODB_COLLECTION_TRADES2;
  saveTrades(newTrades, collectionName, false);
}

async function saveTrades(newTrades, collection, isFiltered) {
  try {
    let filteredTrades = newTrades;
    if (isFiltered) {
      // Récupérer les trades déjà présents en base de données
      const existingTrades = await fetchTradesInDatabase();

      // Filtrer les nouveaux trades pour éviter les duplications
      filteredTrades = newTrades.filter((newTrade) => {
        return !existingTrades.some(
          (existingTrade) => existingTrade.timestamp === newTrade.timestamp
        );
      });
    }

    console.log("🚀 ~ saveTrades ~ filteredTrades:", filteredTrades);

    // Convertir chaque trade en objet s'il ne l'est pas déjà
    const tradesToInsert = filteredTrades.map((trade) => {
      return typeof trade === "object" ? trade : { trade }; // Assurez-vous que chaque trade est un objet
    });
    console.log("🚀 ~ tradesToInsert ~ tradesToInsert:", tradesToInsert.length);

    // Ajouter les nouveaux trades à la base de données
    if (tradesToInsert.length > 0) {
      const result = await saveData(tradesToInsert, collection);

      console.log(
        "🚀 ~ saveTrades ~ result.insertedCount:",
        result.insertedCount
      );
    }
  } catch (error) {
    console.log("🚀 ~ saveTrades ~ error:", error);
  } finally {
    //await client.close();
  }
}

async function updateTrades(req, res) {
  const { platform } = req.params;
  console.log("🚀 ~ updateTrades ~ platform:", platform);
  const collectionName = process.env.MONGODB_COLLECTION_TRADES;
  const platformInstance = createPlatformInstance(platform);

  try {
    const mappedData = [];
    switch (platform) {
      case "kucoin":
        const weeksBack = 4 * 52;
        for (let i = weeksBack; i > 1; i--) {
          try {
            const trades = await platformInstance.fetchMyTrades(
              undefined,
              Date.now() - i * 7 * 86400 * 1000,
              500
            );

            if (trades.length > 0) {
              mappedData.push(...mapTrades(platform, trades));
            }
          } catch (err) {
            console.log("🚀 ~ updateTrades ~ err:", err);
            res.status(500).json({ error: err.name + ": " + err.message });
          }
        }
        break;
      case "htx":
        //const types = 'buy-market,sell-market,buy-limit,sell-limit'; // Les types d'ordre à inclure dans la recherche, séparés par des virgules
        const currentTime = Date.now();
        const windowSize = 48 * 60 * 60 * 1000; // Taille de la fenêtre de recherche (48 heures)
        const totalDuration = 1 * 365 * 24 * 60 * 60 * 1000; // Durée totale de recherche (4 ans)
        const iterations = Math.ceil(totalDuration / windowSize);

        for (let i = 0; i < iterations; i++) {
          const startTime = currentTime - (i + 1) * windowSize;
          const endTime = currentTime - i * windowSize;

          param = {
            "start-time": startTime,
            "end-time": endTime,
          };

          try {
            const trades = await platformInstance.fetchMyTrades(
              undefined,
              undefined,
              1000,
              param
            );
            if (trades.length > 0) {
              mappedData.push(...mapTrades(platform, trades));
            }
          } catch (err) {
            console.log("🚀 ~ updateTrades ~ err:", err);
            res.status(500).json({ error: err.name + ": " + err.message });
          }
        }
        break;
    }

    try {
      await deleteAndSaveData(mappedData, collectionName, platform);
    } catch (err) {
      console.log("🚀 ~ updateTrades ~ err:", err);
      res.status(500).json({ error: err.name + ": " + err.message });
    }
    if (tradesData.length > 0) {
      res.status(200).json(tradesData);
    } else {
      res.status(201).json({ empty: "empty" });
    }
    saveLastUpdateToMongoDB(process.env.TYPE_TRADES, platform);
  } catch (err) {
    res.status(500).json({ error: err.name + ": " + err.message });
  }
}

async function fetchLastTrades(platform, symbol) {
  const platformInstance = createPlatformInstance(platform);
  return platformInstance.fetchMyTrades(symbol);
}

module.exports = {
  getTrades,
  fetchTradesInDatabase,
  addTradesManually,
  updateTrades,
  fetchLastTrades,
  saveTradesToDatabase,
  saveAllTradesToDatabase,
};
