// src/controllers/strategyController.js
const { getData } = require("../utils/dataUtil.js");
const { deleteAllDataMDB, updateDataMDB, saveData } = require("../services/mongodbService.js");

const { handleErrorResponse } = require("../utils/errorUtil.js");

const lastUpdateService = require("../services/lastUpdateService.js");

/**
 * Met à jour une stratégie dans la collection 'collection_strategy' en utilisant l'ID de la stratégie.
 * @param {string} strategyId - L'ID de la stratégie à mettre à jour.
 * @param {object} updatedStrategy - Les nouvelles données à mettre à jour.
 * @returns {Promise} - Une promesse qui résout le résultat de l'opération de mise à jour.
 */
async function updateStrategyById(strategyId, updatedStrategy) {
  try {
    return await updateDataMDB("collection_strategy", { _id: strategyId }, { $set: updatedStrategy });
  } catch (error) {
    console.error(`Error updating strategy with ID ${strategyId}:`, error);
    throw error;
  }
}

async function getStrat(req, res) {
  const collectionName = process.env.MONGODB_COLLECTION_STRAT;
  try {
    const data = await getData(collectionName);
    console.log(
      `🚀 ~ file: strategyController.js:17 ~ getStrat ~ data:`,
      {
        collectionName,
        count: data.length,
      }
    );
    res.json(data);
  } catch (error) {
    console.log(
      `🚀 ~ file: strategyController.js:23 ~ getStrat ~ error:`,
      error
    );
    //console.error("Failed to get strats", { error: error.message });
    handleErrorResponse(res, error, "getStrat");
  }
}

async function fetchDatabaseStrategies() {
  const collectionName = process.env.MONGODB_COLLECTION_STRAT;
  const data = await getData(collectionName);
  console.log(
    `🚀 ~ file: strategyController.js:37 ~ fetchDatabaseStrategies :`,
    { collectionName, count: data.length }
  );  return data;
}

async function updateStrat(req, res) {
  const collection = process.env.MONGODB_COLLECTION_STRAT;
  const strat = req.body;
  console.log("🚀 ~ updateStrat ~ strat:", strat);

  try {
    await deleteAllDataMDB(collection);
    const data = await saveData(strat, collection);
    console.log("🚀 ~ updateStrat ~ data:", data);
    await lastUpdateService.saveLastUpdateToDatabase(process.env.TYPE_STRATEGY, "");

    res.json(data);
  } catch (err) {
    console.log("🚀 ~ updateStrat ~ err:", err);
    res.status(500).send({ error: err.name + ": " + err.message });
  }
}

module.exports = { getStrat, fetchDatabaseStrategies, updateStrat, updateStrategyById };
