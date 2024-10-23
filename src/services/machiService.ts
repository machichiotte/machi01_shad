// src/services/machiService.ts
import { MachiRepository } from '@repositories/machiRepository';
import { HighestPrices } from '@typ/database';
import { PLATFORM } from '@src/types/platform';
import { HighestPriceRepository } from '@src/repositories/highPriceRepository';
import { Asset } from '@src/types/metrics';

export class MachiService {
  /**
   * Fetches the most recent SHAD data from the database.
   */
  static async fetchMachiInDatabase(): Promise<Asset[]> {
    return await MachiRepository.fetchAll();
  }

  /**
   * Fetches the highest prices from the database.
   */
  static async getHighestPrices(): Promise<HighestPrices[]> {
    return await HighestPriceRepository.fetchHighestPrices();
  }

  /**
   * Updates the highest price for a specific platform and base.
   */
  static async updateHighestPrice(platform: PLATFORM, base: string, price: number): Promise<void> {
    await HighestPriceRepository.updateHighestPrice(platform, base, price);
  }
}