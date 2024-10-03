// src/services/shadService.ts
import { ShadRepository } from '@repositories/shadRepository';
import { ShadData, HighestPrices } from '@typ/database';
import { PLATFORM } from '@src/types/platform';
import { HighestPriceRepository } from '@src/repositories/highPriceRepository';

export class ShadService {
  /**
   * Fetches the most recent SHAD data from the database.
   */
  static async fetchShadInDatabase(): Promise<ShadData[]> {
    return await ShadRepository.fetchAll();
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