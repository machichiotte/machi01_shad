// src/services/marketsService.ts
import { getData } from "../utils/dataUtil";
import { createPlatformInstance } from "../utils/platformUtil";
import { loadErrorPolicies, shouldRetry } from "../utils/errorUtil";
import { saveLastUpdateToDatabase } from "./lastUpdateService";
import { deleteAndSaveData } from "./mongodbService";
import { mapMarkets } from "./mapping";
import { saveDataToDatabase } from "./databaseService";

interface MarketData {
  [key: string]: any;
}

/**
 * Fetches the current markets from the specified platform.
 * @param {string} platform - Identifier for the platform.
 * @param {number} [retries=3] - Number of retry attempts.
 * @returns {Promise<MarketData[]>} - The fetched market data.
 */
async function fetchCurrentMarkets(platform: string, retries: number = 3): Promise<MarketData[]> {
  const errorPolicies = await loadErrorPolicies(); // Load error policies

  try {
    const platformInstance = createPlatformInstance(platform);
    const data = await platformInstance.fetchMarkets();
    const mappedData = mapMarkets(data, platform);
    return mappedData;
  } catch (error) {
    console.log(
      `🚀 ~ file: marketController.ts:58 ~ fetchCurrentMarkets ~ error:`,
      error
    );

    // Check if the error justifies a retry
    if (retries > 0 && shouldRetry(platform, error, errorPolicies)) {
      const delay = Math.pow(2, 3 - retries) * 1000; // Exponential delay
      console.log(`Retrying fetchCurrentMarkets... (${3 - retries + 1}/3)`, {
        delay,
      });
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchCurrentMarkets(platform, retries - 1);
    }

    // Log non-recoverable errors
    console.error("Failed to fetch current markets from platform", {
      platform,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Saves the provided market data to the database.
 * @param {MarketData[]} mappedData - The market data to be saved.
 * @param {string} platform - Identifier of the platform.
 */
async function saveDatabaseMarkets(mappedData: MarketData[], platform: string): Promise<void> {
  const collection = process.env.MONGODB_COLLECTION_LOAD_MARKETS;
  const updateType = process.env.TYPE_LOAD_MARKETS;

  if (collection && updateType) {
    await saveDataToDatabase(mappedData, collection, platform, updateType);
  } else {
    throw new Error("Missing environment variables for collection or update type");
  }
}

/**
 * Retrieves the latest market data from the database.
 * @returns {Promise<MarketData[]>} - The last recorded markets.
 */
async function getSavedMarkets(): Promise<MarketData[]> {
  const collectionName = process.env.MONGODB_COLLECTION_LOAD_MARKETS;
  if (!collectionName) {
    throw new Error("Missing environment variable for collection name");
  }
  try {
    const data = await getData(collectionName);
    console.log("Fetched saved market data from the database.", {
      collectionName,
      count: data.length,
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch saved market data.", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Fetches the latest market data from a platform.
 * @param {string} platform - Identifier of the platform.
 * @returns {Promise<MarketData>} - The fetched market data.
 */
async function fetchMarketData(platform: string): Promise<MarketData> {
  try {
    const platformInstance = createPlatformInstance(platform);
    const data = await platformInstance.loadMarkets();
    console.log(`Fetched market data from ${platform}.`, {
      count: Object.keys(data).length,
    });
    return data;
  } catch (error) {
    console.error(`Failed to fetch market data from ${platform}.`, {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Updates the market data in the database for a specific platform.
 * @param {MarketData} data - The market data to be updated.
 * @param {string} platform - Identifier of the platform.
 * @returns {Promise<MarketData[]>} - The mapped and updated market data.
 */
async function updateMarketDataInDatabase(data: MarketData, platform: string): Promise<MarketData[]> {
  const collection = process.env.MONGODB_COLLECTION_LOAD_MARKETS;
  if (!collection) {
    throw new Error("Missing environment variable for collection");
  }
  const mappedData = mapMarkets(platform, data);
  await deleteAndSaveData(mappedData, collection, platform);
  await saveLastUpdateToDatabase(
    process.env.TYPE_LOAD_MARKETS || "",
    platform
  );
  console.log(`Updated market data in database for ${platform}.`, {
    count: mappedData.length,
  });
  return mappedData;
}

export {
  fetchCurrentMarkets,
  saveDatabaseMarkets,
  getSavedMarkets,
  fetchMarketData,
  updateMarketDataInDatabase,
};
