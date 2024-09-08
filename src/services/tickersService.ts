// src/services/tickersService.ts
import { getData } from "../utils/dataUtil";
import {
  createPlatformInstance,
  getPlatforms,
} from "../utils/platformUtil";
import { loadErrorPolicies, shouldRetry } from "../utils/errorUtil";
import { mapTickers, Ticker } from "./mapping";
import { saveLastUpdateToDatabase } from "./lastUpdateService";
import { deleteAndSaveObject } from "./mongodbService";
import { saveDataToDatabase } from "./databaseService";

interface Ticker {
  _id: {
    $oid: string;
  };
  symbol: string;
  timestamp: number;
  last: number;
  platform: string;
}

interface TickerData {
  [platform: string]: Ticker[];
}

/**
 * Fetches tickers data from the database.
 * @returns {Promise<TickerData>} The tickers data.
 */
async function fetchDatabaseTickers(): Promise<TickerData> {
  const collectionName = process.env.MONGODB_COLLECTION_TICKERS;
  if (!collectionName) throw new Error("MONGODB_COLLECTION_TICKERS non défini");
  const data = await getData(collectionName);
  return data as TickerData;
}

/**
 * Obtient tous les tickers pour une plateforme spécifique.
 * @param {string} platform - The platform to get tickers for.
 * @returns {Promise<any[]>} An array of tickers for the platform.
 * @throws {Error} If the platform is not found.
 */
async function getAllTickersByPlatform(platform: string): Promise<any[]> {
  const data = await fetchDatabaseTickers();
  if (data && data[platform]) {
    return data[platform];
  } else {
    throw new Error("Platform not found");
  }
}

/**
 * Gets all tickers for a specific symbol from a platform.
 * @param {string} platform - The platform to get tickers from.
 * @param {string} symbol - The symbol to get tickers for.
 * @returns {Promise<any[]>} An array of tickers for the symbol and platform.
 * @throws {Error} If the platform or symbol is not found.
 */
async function getAllTickersBySymbolFromPlatform(platform: string, symbol: string): Promise<any[]> {
  const data = await fetchDatabaseTickers();
  if (data && data[platform]) {
    const platformTickersData = data[platform];
    const filteredTickersData = platformTickersData.filter(
      (ticker: any) => ticker.symbol === symbol
    );
    if (filteredTickersData.length > 0) {
      return filteredTickersData;
    } else {
      throw new Error("Symbol not found for the given platform");
    }
  } else {
    throw new Error("Platform not found");
  }
}

/**
 * Updates all tickers for all platforms.
 * @returns {Promise<TickerData>} The updated tickers data.
 */
async function updateAllTickers(): Promise<TickerData> {
  const collectionName = process.env.MONGODB_COLLECTION_TICKERS;
  const tickersData: TickerData = {};
  const platforms = getPlatforms();
  for (const platform of platforms) {
    const platformInstance = createPlatformInstance(platform);
    const data = await platformInstance.fetchTickers();
    const mappedTickersData = mapTickers(data);
    tickersData[platform] = mappedTickersData;
  }

  await deleteAndSaveObject(tickersData, collectionName);
  await saveLastUpdateToDatabase(
    process.env.TYPE_TICKERS,
    "combined"
  );
  return tickersData;
}

/**
 * Fetches current tickers for a specific platform.
 * @param {string} platform - The platform to fetch tickers for.
 * @param {number} [retries=3] - The number of retry attempts.
 * @returns {Promise<any[]>} The mapped tickers data.
 * @throws {Error} If fetching fails after all retries.
 */
async function fetchCurrentTickers(platform: string, retries: number = 3): Promise<any[]> {
  const errorPolicies = await loadErrorPolicies();

  try {
    const platformInstance = createPlatformInstance(platform);
    const data = await platformInstance.fetchTickers();
    return mapTickers(data, platform);
  } catch (error) {
    console.log(
      `Error while fetching tickers for ${platform}:`,
      error
    );

    if (retries > 0 && shouldRetry(platform, error, errorPolicies)) {
      const delay = Math.pow(2, 3 - retries) * 1000;
      console.log(
        `Retrying fetchCurrentTickers... (${3 - retries + 1}/3)`,
        { delay }
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchCurrentTickers(platform, retries - 1);
    }

    throw error;
  }
}

/**
 * Saves the provided tickers data to the database.
 * @param {any[]} mappedData - The tickers data to be saved.
 * @param {string} platform - Identifier of the platform.
 */
async function saveDatabaseTickers(mappedData: any[], platform: string): Promise<void> {
  const collection = process.env.MONGODB_COLLECTION_TICKERS;
  const updateType = process.env.TYPE_TICKERS;

  await saveDataToDatabase(
    mappedData,
    collection,
    platform,
    updateType
  );
}

export {
  fetchDatabaseTickers,
  getAllTickersByPlatform,
  getAllTickersBySymbolFromPlatform,
  updateAllTickers,
  fetchCurrentTickers,
  saveDatabaseTickers,
};
