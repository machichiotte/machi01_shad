// src/controllers/tradesController.js
const {
  saveData,
  getAllDataMDB,
} = require("../services/mongodb.js");
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

async function fetchTradesInDatabase() {
  const collection = process.env.MONGODB_COLLECTION_TRADES;
  const data = await getAllDataMDB(collection);
  return data;
}

async function addTradesManually(req, res) {
  const collection = process.env.MONGODB_COLLECTION_TRADES;
  const tradesData = req.body.trades_data;
  try {
    const savedTrade = await saveData(tradesData, collection);

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
  try {
    const collection = process.env.MONGODB_COLLECTION_TRADES;

    // Récupérer les trades déjà présents en base de données
    //const existingTrades = await collection.find({}).toArray();

    const existingTrades = await fetchTradesInDatabase();

    // Filtrer les nouveaux trades pour éviter les duplications
    const filteredTrades = newTrades.filter((newTrade) => {
      return !existingTrades.some(
        (existingTrade) => existingTrade.timestamp === newTrade.timestamp
      );
    });

    console.log("filteredTrades", filteredTrades);

    // Convertir chaque trade en objet s'il ne l'est pas déjà
    const tradesToInsert = filteredTrades.map((trade) => {
      return typeof trade === "object" ? trade : { trade }; // Assurez-vous que chaque trade est un objet
    });

    console.log("tradesToInsert", tradesToInsert);

    // Ajouter les nouveaux trades à la base de données
    if (tradesToInsert.length > 0) {
      const result = await saveData(tradesToInsert, collection);
      console.log(
        `${result.insertedCount} new trades inserted into the database.`
      );
    } else {
      console.log("No new trades to insert.");
    }
  } catch (error) {
    console.error("Error saving trades to database:", error);
  } finally {
    //await client.close();
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

async function fetchLastTrades(exchangeId, symbol) {
  const exchange = createExchangeInstance(exchangeId);
  return exchange.fetchMyTrades(symbol);
}

module.exports = {
  getTrades,
  addTradesManually,
  updateTrades,
  fetchLastTrades,
  fetchTradesInDatabase,
  saveTradesToDatabase,
};
