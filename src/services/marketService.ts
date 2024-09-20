// src/services/marketService.ts
import { createPlatformInstance } from '@utils/platformUtil';
import { LastUpdateService } from '@services/lastUpdateService';
import { MongodbService } from '@services/mongodbService';
import { MappingService } from '@services/mapping';
import { MappedMarket } from '@models/dbTypes';
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
    return MappingService.mapMarkets(platform, data);
  }

  /**
   * Updates the markets for a specified platform.
   */
  static async updateMarketsForPlatform(platform: string): Promise<void> {
    try {
      const currentMarkets = await this.fetchCurrentMarkets(platform)
      await MongodbService.deleteAndSaveData(COLLECTION_NAME, currentMarkets, platform);
      await LastUpdateService.saveLastUpdateToDatabase(COLLECTION_TYPE || '', platform);
      console.log(`Market data for ${platform} updated in the database. Total records: ${currentMarkets.length}.`);
    } catch (error) {
      handleServiceError(error, 'updateMarketsForPlatform', `Erreur lors de la mise à jour des marchés pour ${platform}`)
    }
  }

  /**
   * Retrieves the latest market data from the database.
   */
  static async getSavedMarkets(): Promise<MappedMarket[]> {
    return await MongodbService.getData(COLLECTION_NAME) as MappedMarket[];
  }

}