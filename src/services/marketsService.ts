// src/services/marketsService.ts
import { getData } from '@utils/dataUtil'
import { createPlatformInstance } from '@utils/platformUtil'
import { loadErrorPolicies, shouldRetry } from '@utils/errorUtil'
import { saveLastUpdateToDatabase } from './lastUpdateService'
import { deleteAndSaveData } from './mongodbService'
import { mapMarkets, MappedMarket } from './mapping'
import { saveDataToDatabase } from './databaseService'

/**
 * Fetches the current markets from the specified platform.
 * @param {string} platform - Identifier for the platform.
 * @param {number} [retries=3] - Number of retry attempts.
 * @returns {Promise<MarketData[]>} - The fetched market data.
 */
async function fetchCurrentMarkets(
  platform: string,
  retries: number = 3
): Promise<MappedMarket[]> {
  const errorPolicies = await loadErrorPolicies() // Load error policies

  try {
    const platformInstance = createPlatformInstance(platform)
    const data = await platformInstance.fetchMarkets()
    const mappedData = mapMarkets(platform, data)
    return mappedData
  } catch (error: any) {
    console.log(
      `🚀 ~ file: marketController.ts:58 ~ fetchCurrentMarkets ~ error:`,
      error
    )

    // Check if the error justifies a retry
    if (retries > 0 && shouldRetry(platform, error, errorPolicies)) {
      const delay = Math.pow(2, 3 - retries) * 1000 // Exponential delay
      console.log(`Retrying fetchCurrentMarkets... (${3 - retries + 1}/3)`, {
        delay
      })
      await new Promise((resolve) => setTimeout(resolve, delay))
      return fetchCurrentMarkets(platform, retries - 1)
    }

    // Log non-recoverable errors
    console.error('Failed to fetch current markets from platform', {
      platform,
      error: error instanceof Error ? error.message : String(error)
    })
    throw error
  }
}

/**
 * Saves the provided market data to the database.
 * @param {MarketData[]} mappedData - The market data to be saved.
 * @param {string} platform - Identifier of the platform.
 */
async function saveDatabaseMarkets(
  mappedData: MappedMarket[],
  platform: string
): Promise<void> {
  const collection = process.env.MONGODB_COLLECTION_LOAD_MARKETS
  const updateType = process.env.TYPE_LOAD_MARKETS

  if (collection && updateType) {
    await saveDataToDatabase(mappedData, collection, platform, updateType)
  } else {
    throw new Error(
      'Missing environment variables for collection or update type'
    )
  }
}

/**
 * Retrieves the latest market data from the database.
 * @returns {Promise<MarketData[]>} - The last recorded markets.
 */
async function getSavedMarkets(): Promise<MappedMarket[]> {
  const collectionName = process.env.MONGODB_COLLECTION_LOAD_MARKETS
  if (!collectionName) {
    throw new Error('Missing environment variable for collection name')
  }
  try {
    const data = await getData(collectionName)
    console.log('Fetched saved market data from the database.', {
      collectionName,
      count: data.length
    })
    return data
  } catch (error) {
    console.error('Failed to fetch saved market data.', {
      error: error instanceof Error ? error.message : String(error)
    })
    throw error
  }
}

/**
 * Updates the market data in the database for a specific platform.
 * @param {MarketData} data - The market data to be updated.
 * @param {string} platform - Identifier of the platform.
 * @returns {Promise<MarketData[]>} - The mapped and updated market data.
 */
async function updateMarketDataInDatabase(
  platform: string,
  data: MappedMarket[]
): Promise<MappedMarket[]> {
  const collection = process.env.MONGODB_COLLECTION_LOAD_MARKETS
  if (!collection) {
    throw new Error('Missing environment variable for collection')
  }
  await deleteAndSaveData(data, collection, platform)
  await saveLastUpdateToDatabase(process.env.TYPE_LOAD_MARKETS || '', platform)
  console.log(`Updated market data in database for ${platform}.`, {
    count: data.length
  })
  return data
}

export {
  fetchCurrentMarkets,
  saveDatabaseMarkets,
  getSavedMarkets,
  updateMarketDataInDatabase
}
