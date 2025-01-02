// src/services/machiService.ts
import { MachiRepository } from '@repo/machiRepository';
import { HighestPriceRepository } from '@repo/highPriceRepository';
import { HighestPrices } from '@typ/database';
import { PLATFORM } from '@typ/platform';
import { Asset } from '@typ/metrics';

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