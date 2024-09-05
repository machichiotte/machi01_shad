// src/services/strategyService.js
const { getData, deleteAllDataMDB, updateDataMDB, saveData } = require("../services/mongodbService.js");
const lastUpdateService = require("./lastUpdateService.js");

async function fetchDatabaseStrategies() {
  const collectionName = process.env.MONGODB_COLLECTION_STRAT;
  return await getData(collectionName);
}

async function updateStrategyById(strategyId, updatedStrategy) {
  try {
    return await updateDataMDB("collection_strategy", { _id: strategyId }, { $set: updatedStrategy });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la stratégie avec l'ID ${strategyId}:`, error);
    throw error;
  }
}

async function updateStrategies(strategies) {
  const collection = process.env.MONGODB_COLLECTION_STRAT;
  await deleteAllDataMDB(collection);
  const data = await saveData(strategies, collection);
  await lastUpdateService.saveLastUpdateToDatabase(process.env.TYPE_STRATEGY, "");
  return data;
}

module.exports = { fetchDatabaseStrategies, updateStrategyById, updateStrategies };