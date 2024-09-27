// src/services/marketService.ts
import { PlatformService } from '@services/platformService';
import { TimestampService } from '@services/timestampService';
import { MongodbService } from '@services/mongodbService';
import { MappingService } from '@services/mappingService';
import { MappedMarket } from '@typ/market';
import { handleServiceError } from '@utils/errorUtil';
import { config } from '@config/index';
import { PLATFORM } from '@src/types/platform';
import { executeForPlatforms } from '@utils/taskExecutor';

const COLLECTION_NAME = config.collection.market
const COLLECTION_TYPE = config.collectionType.market

export class MarketService {
  /**
   * Fetches the current markets from the specified platform.
   */
  static async fetchCurrentMarkets(platform: PLATFORM): Promise<Omit<MappedMarket, '_id'>[]> {
    try {
      const data = await PlatformService.fetchRawMarket(platform);
      return MappingService.mapMarkets(platform, data);
    } catch (error) {
      handleServiceError(error, 'fetchCurrentBalancesByPlatform', `Erreur lors de la récupération des balances actuelles pour ${platform}`);
      throw error;
    }
  }

  /**
   * Updates the markets for a specified platform.
   */
  static async updateMarketsForPlatform(platform: PLATFORM): Promise<void> {
    try {
      const currentMarkets = await this.fetchCurrentMarkets(platform)
      await MongodbService.deleteAndProcessData(COLLECTION_NAME, currentMarkets, platform);
      await TimestampService.saveTimestampToDatabase(COLLECTION_TYPE || '', platform);
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

  static async cronMarket(): Promise<void> {
    await executeForPlatforms('updateMarkets', MarketService.updateMarketsForPlatform)
  }
}