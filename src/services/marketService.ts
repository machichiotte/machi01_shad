// src/services/marketService.ts
import { getData } from '@utils/dataUtil';
import { createPlatformInstance } from '@utils/platformUtil';
import { LastUpdateService } from './lastUpdateService';
import { deleteAndSaveData } from './mongodbService';
import { mapMarkets } from './mapping';
import { DatabaseService } from './databaseService';
import { MappedMarket } from 'src/models/dbTypes';
import { handleServiceError } from '@utils/errorUtil';

const COLLECTION_NAME = process.env.MONGODB_COLLECTION_LOAD_MARKETS as string
const COLLECTION_TYPE = process.env.TYPE_LOAD_MARKETS as string

export class MarketService {
  /**
   * Fetches the current markets from the specified platform.
   */
  static async fetchCurrentMarkets(platform: string): Promise<MappedMarket[]> {
    const platformInstance = createPlatformInstance(platform);
    const data = await platformInstance.fetchMarkets();
    return mapMarkets(platform, data);
  }

  /**
   * Updates the markets for a specified platform.
   */
  static async updateMarketsForPlatform(platform: string): Promise<void> {
    try {
      const currentMarkets = await this.fetchCurrentMarkets(platform)
      await deleteAndSaveData(COLLECTION_NAME, currentMarkets, platform);
      await LastUpdateService.saveLastUpdateToDatabase(COLLECTION_TYPE || '', platform);
      console.log(`Market data for ${platform} updated in the database. Total records: ${currentMarkets.length}.`);
    } catch (error) {
      handleServiceError(error, 'updateMarketsForPlatform', `Erreur lors de la mise à jour des marchés pour ${platform}`)
    }
  }

  /**
   * Saves the provided market data to the database.
   */
  static async saveMarketsInDatabase(mappedData: MappedMarket[], platform: string): Promise<void> {
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
    return await getData(COLLECTION_NAME) as MappedMarket[];
  }

}