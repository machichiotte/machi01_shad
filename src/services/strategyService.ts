// src/services/strategyService.ts
import { getData } from '@utils/dataUtil'
import { saveLastUpdateToDatabase } from './lastUpdateService'
import { updateDataMDB, deleteAllDataMDB, saveData } from './mongodbService'
import { MappedStrategy } from './mapping'
import { UpdateDataMDBParams } from './mongodbService'
/**
 * Fetches strategies from the database.
 * @returns {Promise<Strategy[]>} A promise that resolves to an array of strategies.
 */
async function fetchDatabaseStrategies(): Promise<MappedStrategy[]> {
  const collectionName = process.env.MONGODB_COLLECTION_STRAT as string
  return await getData(collectionName) as MappedStrategy[]
}

/**
 * Updates a strategy by its ID.
 * @param {string} strategyId - The ID of the strategy to update.
 * @param {Partial<Strategy>} updatedStrategy - The updated strategy data.
 * @returns {Promise<any>} A promise that resolves to the update result.
 * @throws {Error} If the update fails.
 */
async function updateStrategyById(
  strategyId: string | undefined,
  updatedStrategy: Partial<MappedStrategy>
): Promise<UpdateDataMDBParams> {
  if (!strategyId) {
    throw new Error('Strategy ID is required')
  }
  try {
    return await updateDataMDB(
      'collection_strategy',
      { _id: strategyId },
      { $set: updatedStrategy }
    )
  } catch (error) {
    console.error(`Error updating strategy with ID ${strategyId}:`, error)
    throw error
  }
}

/**
 * Updates all strategies in the database.
 * @param {Strategy[]} strategies - The array of strategies to update.
 * @returns {Promise<any>} A promise that resolves to the save result.
 */
async function updateStrategies(strategies: MappedStrategy[]): Promise<any> {
  const collectionName = process.env.MONGODB_COLLECTION_STRAT as string
  const collectionType = process.env.TYPE_STRATEGY as string
  await deleteAllDataMDB(collectionName as string)
  const data = await saveData(collectionName, strategies)
  await saveLastUpdateToDatabase(collectionType, '')
  return data
}

export { fetchDatabaseStrategies, updateStrategyById, updateStrategies }
