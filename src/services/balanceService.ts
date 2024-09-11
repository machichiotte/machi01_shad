// src/services/balanceService.ts
import { getData } from '@utils/dataUtil'
import { createPlatformInstance } from '@utils/platformUtil'
import { loadErrorPolicies, shouldRetry } from '@utils/errorUtil'
import { validateEnvVariables } from '@utils/controllerUtil'
import { saveDataToDatabase } from './databaseService'
import { mapBalance, MappedBalance } from './mapping'

validateEnvVariables(['MONGODB_COLLECTION_BALANCE', 'TYPE_BALANCE'])

/**
 * Fetches all balance data from the database.
 * @returns {Promise<MappedBalance[]>} A promise that resolves to an array of balance data.
 */
async function fetchDatabaseBalances(): Promise<MappedBalance[]> {
  const collectionName = process.env.MONGODB_COLLECTION_BALANCE as string
  return await getData(collectionName) as MappedBalance[]
}

/**
 * Fetches balance data from the database for a specific platform.
 * @param {string} platform - The platform identifier.
 * @param {number} [retries=3] - The number of retry attempts.
 * @returns {Promise<MappedBalance[]>} A promise that resolves to an array of balance data for the specified platform.
 * @throws {Error} If fetching fails after all retry attempts.
 */
async function fetchDatabaseBalancesByPlatform(
  platform: string,
  retries: number = 3
): Promise<MappedBalance[]> {
  try {
    const data = await fetchDatabaseBalances()
    return data.filter((item: MappedBalance) => item.platform === platform)
  } catch (error: any) {
    if (
      retries > 0 &&
      shouldRetry(platform, error, await loadErrorPolicies())
    ) {
      const delay = Math.pow(2, 3 - retries) * 1000
      await new Promise((resolve) => setTimeout(resolve, delay))
      return fetchDatabaseBalancesByPlatform(platform, retries - 1)
    }
    console.error('Failed to fetch current balance from platform', {
      platform,
      error: (error as Error).message
    })
    throw error
  }
}

/**
 * Fetches current balance data from a specific platform.
 * @param {string} platform - The platform identifier.
 * @param {number} [retries=3] - The number of retry attempts.
 * @returns {Promise<BalanceData[]>} A promise that resolves to an array of current balance data for the specified platform.
 * @throws {Error} If fetching fails after all retry attempts.
 */
async function fetchCurrentBalancesByPlatform(
  platform: string,
  retries: number = 3
): Promise<MappedBalance[]> {
  const errorPolicies = await loadErrorPolicies()
  try {
    const platformInstance = createPlatformInstance(platform)
    const data = await platformInstance.fetchBalance()
    return mapBalance(platform, data)
  } catch (error: any) {
    if (retries > 0 && shouldRetry(platform, error, errorPolicies)) {
      const delay = Math.pow(2, 3 - retries) * 1000
      await new Promise((resolve) => setTimeout(resolve, delay))
      return fetchCurrentBalancesByPlatform(platform, retries - 1)
    }
    console.error('Failed to fetch current balance from platform', {
      platform,
      error: (error as Error).message
    })
    throw error
  }
}

/**
 * Saves the provided balance data to the database.
 * @param {BalanceData[]} mappedData - The balance data to save.
 * @param {string} platform - The platform identifier.
 * @returns {Promise<void>}
 */
async function saveDatabaseBalance(
  mappedData: MappedBalance[],
  platform: string
): Promise<void> {
  const collection = process.env.MONGODB_COLLECTION_BALANCE
  const updateType = process.env.TYPE_BALANCE

  if (collection && updateType) {
    await saveDataToDatabase(mappedData, collection, platform, updateType)
  } else {
    throw new Error('Required environment variables are not set')
  }
}

/**
 * Updates the balance for a specific platform by fetching current data and saving it to the database.
 * @param {string} platform - The platform identifier.
 * @returns {Promise<BalanceData[]>} A promise that resolves to the updated balance data.
 */
async function updateBalanceForPlatform(
  platform: string
): Promise<MappedBalance[]> {
  const data = await fetchCurrentBalancesByPlatform(platform)
  await saveDatabaseBalance(data, platform)
  return data
}

export {
  fetchDatabaseBalances,
  fetchDatabaseBalancesByPlatform,
  fetchCurrentBalancesByPlatform,
  saveDatabaseBalance,
  updateBalanceForPlatform
}
