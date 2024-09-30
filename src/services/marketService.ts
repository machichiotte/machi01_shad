// src/services/marketService.ts
import { PlatformService } from '@services/platformService';
import { MappingService } from '@services/mappingService';
import { MarketRepository } from '@repositories/marketRepository';
import { MappedMarket } from '@typ/market';
import { handleServiceError } from '@utils/errorUtil';
import { PLATFORM } from '@src/types/platform';
import { executeForPlatforms } from '@src/utils/cronUtil';

export class MarketService {
  /**
   * Fetches the current markets from the specified platform.
   */
  static async fetchCurrentMarkets(platform: PLATFORM): Promise<Omit<MappedMarket, '_id'>[]> {
    try {
      const data = await PlatformService.fetchRawMarket(platform);
      return MappingService.mapMarkets(platform, data);
    } catch (error) {
      handleServiceError(error, 'fetchCurrentMarkets', `Erreur lors de la récupération des marchés actuels pour ${platform}`);
      throw error;
    }
  }

  /**
   * Updates the markets for a specified platform.
   */
  static async updateMarketsForPlatform(platform: PLATFORM): Promise<void> {
    try {
      const currentMarkets = await this.fetchCurrentMarkets(platform);
      await MarketRepository.saveMarkets(currentMarkets, platform);
      console.log(`Données de marché pour ${platform} mises à jour dans la base de données. Total des enregistrements : ${currentMarkets.length}.`);
    } catch (error) {
      handleServiceError(error, 'updateMarketsForPlatform', `Erreur lors de la mise à jour des marchés pour ${platform}`);
    }
  }

  /**
   * Retrieves the latest market data from the database.
   */
  static async getSavedMarkets(): Promise<MappedMarket[]> {
    return await MarketRepository.getMarkets();
  }

  static async cronMarket(): Promise<void> {
    await executeForPlatforms('updateMarkets', MarketService.updateMarketsForPlatform);
  }
}