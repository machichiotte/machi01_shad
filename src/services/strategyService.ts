// src/services/strategyService.ts
import { getData } from "../utils/dataUtil";
import { saveLastUpdateToDatabase } from "./lastUpdateService";
import { updateDataMDB, deleteAllDataMDB, saveData } from "./mongodbService";

interface Strategy {
  _id: string;
  [key: string]: any;
}

/**
 * Fetches strategies from the database.
 * @returns {Promise<Strategy[]>} A promise that resolves to an array of strategies.
 */
async function fetchDatabaseStrategies(): Promise<Strategy[]> {
  const collectionName = process.env.MONGODB_COLLECTION_STRAT;
  return await getData(collectionName as string);
}

/**
 * Updates a strategy by its ID.
 * @param {string} strategyId - The ID of the strategy to update.
 * @param {Partial<Strategy>} updatedStrategy - The updated strategy data.
 * @returns {Promise<any>} A promise that resolves to the update result.
 * @throws {Error} If the update fails.
 */
async function updateStrategyById(strategyId: string, updatedStrategy: Partial<Strategy>): Promise<any> {
  try {
    return await updateDataMDB("collection_strategy", { _id: strategyId }, { $set: updatedStrategy });
  } catch (error) {
    console.error(`Error updating strategy with ID ${strategyId}:`, error);
    throw error;
  }
}

/**
 * Updates all strategies in the database.
 * @param {Strategy[]} strategies - The array of strategies to update.
 * @returns {Promise<any>} A promise that resolves to the save result.
 */
async function updateStrategies(strategies: Strategy[]): Promise<any> {
  const collection = process.env.MONGODB_COLLECTION_STRAT;
  await deleteAllDataMDB(collection as string);
  const data = await saveData(strategies, collection as string);
  await saveLastUpdateToDatabase(process.env.TYPE_STRATEGY as string, "");
  return data;
}

export { fetchDatabaseStrategies, updateStrategyById, updateStrategies };