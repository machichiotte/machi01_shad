// src/services/strategyService.js
const { getData } = require("../utils/dataUtil");
const lastUpdateService = require("./lastUpdateService");
const mongodbService = require("./mongodbService");

/**
 * Fetches strategies from the database.
 * @returns {Promise<Array>} A promise that resolves to an array of strategies.
 */
async function fetchDatabaseStrategies() {
  const collectionName = process.env.MONGODB_COLLECTION_STRAT;
  return await getData(collectionName);
}

/**
 * Updates a strategy by its ID.
 * @param {string} strategyId - The ID of the strategy to update.
 * @param {Object} updatedStrategy - The updated strategy data.
 * @returns {Promise<Object>} A promise that resolves to the update result.
 * @throws {Error} If the update fails.
 */
async function updateStrategyById(strategyId, updatedStrategy) {
  try {
    return await mongodbService.updateDataMDB("collection_strategy", { _id: strategyId }, { $set: updatedStrategy });
  } catch (error) {
    console.error(`Error updating strategy with ID ${strategyId}:`, error);
    throw error;
  }
}

/**
 * Updates all strategies in the database.
 * @param {Array} strategies - The array of strategies to update.
 * @returns {Promise<Object>} A promise that resolves to the save result.
 */
async function updateStrategies(strategies) {
  const collection = process.env.MONGODB_COLLECTION_STRAT;
  await mongodbService.deleteAllDataMDB(collection);
  const data = await mongodbService.saveData(strategies, collection);
  await lastUpdateService.saveLastUpdateToDatabase(process.env.TYPE_STRATEGY, "");
  return data;
}

module.exports = { fetchDatabaseStrategies, updateStrategyById, updateStrategies };