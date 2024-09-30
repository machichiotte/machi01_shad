// src/services/shadService.ts
import { ShadRepository } from '@repositories/shadRepository';
import { ShadData, HighestPrices } from '@typ/database';
import { PLATFORM } from '@src/types/platform';

export class ShadService {
  /**
   * Fetches the most recent SHAD data from the database.
   */
  static async fetchShadInDatabase(): Promise<ShadData[]> {
    return await ShadRepository.fetchShadData();
  }

  /**
   * Fetches the highest prices from the database.
   */
  static async getHighestPrices(): Promise<HighestPrices[]> {
    return await ShadRepository.fetchHighestPrices();
  }

  /**
   * Updates the highest price for a specific platform and base.
   */
  static async updateHighestPrice(platform: PLATFORM, base: string, price: number): Promise<void> {
    await ShadRepository.updateHighestPrice(platform, base, price);
  }
}
