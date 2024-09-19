// src/services/marketsService.ts
import { getData } from '@utils/dataUtil';
import { createPlatformInstance } from '@utils/platformUtil';
import { loadErrorPolicies, shouldRetry, ErrorPolicies } from '@utils/errorUtil';
import { LastUpdateService } from './lastUpdateService';
import { deleteAndSaveData } from './mongodbService';
import { mapMarkets } from './mapping';
import { DatabaseService } from './databaseService';
import { MappedMarket } from 'src/models/dbTypes';

const COLLECTION_NAME = process.env.MONGODB_COLLECTION_LOAD_MARKETS as string
const COLLECTION_TYPE = process.env.TYPE_LOAD_MARKETS as string

export class MarketsService {
  /**
   * Fetches the current markets from the specified platform.
   */
  static async fetchCurrentMarkets(
    platform: string,
    retries: number = 3
  ): Promise<MappedMarket[]> {
    const errorPolicies = await loadErrorPolicies();

    return this.retryFetch(platform, retries, errorPolicies);
  }

  /**
   * Handles retry logic for fetching markets
   */
  static async retryFetch(platform: string, retries: number, errorPolicies: ErrorPolicies): Promise<MappedMarket[]> {
    try {
      const platformInstance = createPlatformInstance(platform);
      const data = await platformInstance.fetchMarkets();
      return mapMarkets(platform, data);
    } catch (error) {
      if (retries > 0 && shouldRetry(platform, error as Error, errorPolicies)) {
        const delay = Math.pow(2, 3 - retries) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retryFetch(platform, retries - 1, errorPolicies);
      }

      console.error('Failed to fetch current markets from platform', {
        platform,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Saves the provided market data to the database.
   */
  static async saveDatabaseMarkets(mappedData: MappedMarket[], platform: string): Promise<void> {
    if (COLLECTION_NAME && COLLECTION_TYPE) {
      await DatabaseService.saveDataToDatabase(mappedData, COLLECTION_NAME, platform, COLLECTION_TYPE);
    } else {
      throw new Error('Missing environment variables for collection or update type');
    }
  }

  /**
   * Retrieves the latest market data from the database.
   */
  static async getSavedMarkets(): Promise<MappedMarket[]> {
    try {
      const data = await getData(COLLECTION_NAME) as MappedMarket[];
      console.log('Fetched saved market data from the database.', {
        collectionName: COLLECTION_NAME,
        count: data.length,
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch saved market data.', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Updates the market data in the database for a specific platform.
   */
  static async updateMarketDataInDatabase(
    platform: string,
    mappedData: MappedMarket[]
  ): Promise<MappedMarket[]> {
    await deleteAndSaveData(COLLECTION_NAME, mappedData, platform);
    await LastUpdateService.saveLastUpdateToDatabase(COLLECTION_TYPE || '', platform);
    console.log(`Updated market data in database for ${platform}.`, {
      count: mappedData.length,
    });
    return mappedData;
  }
}