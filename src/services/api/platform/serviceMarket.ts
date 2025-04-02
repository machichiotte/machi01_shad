// src/services/api/platform/serviceMarket.ts
import { ServiceCcxt } from '@services/api/platform/serviceCcxt';
import { MappingPlatform } from '@services/api/platform/mappingPlatform';
import { RepoMarket } from '@repo/repoMarket';
import { MappedMarket } from '@typ/market';
import { PLATFORM } from '@typ/platform';
import { handleServiceError } from '@utils/errorUtil';
import { executeCronTask } from '@utils/cronUtil';

export class ServiceMarket {
  /**
   * Fetches the current markets from the specified platform.
   */
  static async fetchCurrentMarkets(platform: PLATFORM): Promise<Omit<MappedMarket, '_id'>[]> {
    try {
      const data = await ServiceCcxt.fetchRawMarket(platform);
      return MappingPlatform.mapMarkets(platform, data);
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
      const currentMarkets = await ServiceMarket.fetchCurrentMarkets(platform);
      await RepoMarket.save(currentMarkets, platform);
      console.info(`Données de marché pour ${platform} mises à jour dans la base de données. Total des enregistrements : ${currentMarkets.length}.`);
    } catch (error) {
      handleServiceError(error, 'updateMarketsForPlatform', `Erreur lors de la mise à jour des marchés pour ${platform}`);
    }
  }

  /**
   * Retrieves the latest market data from the database.
   */
  static async getSavedMarkets(): Promise<MappedMarket[]> {
    return await RepoMarket.fetchAll();
  }

  static async cronMarket(platform: PLATFORM): Promise<void> {
    await executeCronTask(() => ServiceMarket.updateMarketsForPlatform(platform), true)

  }
}