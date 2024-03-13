// src/controllers/tradesController.js
const { saveObjectDataMDB } = require("../services/mongodb.js");
const {
  createExchangeInstance,
  getData,
  deleteAndSaveData,
  saveLastUpdateToMongoDB,
} = require("../services/utils.js");
const { mapTrades } = require("../services/mapping.js");

async function getTrades(req, res) {
  const collection = process.env.MONGODB_COLLECTION_TRADES;
  await getData(req, res, collection, "db_machi_shad.collection_trades.json");
}
async function addTradesManually(req, res) {
  const collection = process.env.MONGODB_COLLECTION_TRADES;
  const tradesData = req.body.trades_data;
  try {
    const savedTrade = await saveObjectDataMDB(tradesData, collection);

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

async function updateTrades(req, res) {
  const { exchangeId } = req.params;
  const collection = process.env.MONGODB_COLLECTION_TRADES;
  const exchange = createExchangeInstance(exchangeId);

  try {
    const mappedData = [];
    switch (exchangeId) {
      case "kucoin":
        const weeksBack = 4 * 52;
        for (let i = weeksBack; i > 1; i--) {
          try {
            const trades = await exchange.fetchMyTrades(
              undefined,
              Date.now() - i * 7 * 86400 * 1000,
              500
            );

            if (trades.length > 0) {
              mappedData.push(...mapTrades(exchangeId, trades));
            }
          } catch (err) {
            console.log("Erreur lors de la récupération des trades:", err);
            res.status(500).json({ error: err.name + ": " + err.message });
          }
        }
        break;
      case "htx":
        console.log("inside htx");

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
            "start-time": startTime,
            "end-time": endTime,
          };

          try {
            const trades = await exchange.fetchMyTrades(
              undefined,
              undefined,
              1000,
              param
            );
            if (trades.length > 0) {
              mappedData.push(...mapTrades(exchangeId, trades));
            }
          } catch (err) {
            console.log("Erreur lors de la récupération des commandes:", err);
            res.status(500).json({ error: err.name + ": " + err.message });
          }
        }
        break;
    }

    try {
      await deleteAndSaveData(mappedData, collection, exchangeId);
    } catch (err) {
      console.log("Error suppression sauvegarde:", err);
      res.status(500).json({ error: err.name + ": " + err.message });
    }
    if (tradesData.length > 0) {
      res.status(200).json(tradesData);
    } else {
      res.status(201).json({ empty: "empty" });
    }
    saveLastUpdateToMongoDB(process.env.TYPE_TRADES, exchangeId);
  } catch (err) {
    res.status(500).json({ error: err.name + ": " + err.message });
  }
}

module.exports = { getTrades, addTradesManually, updateTrades };
