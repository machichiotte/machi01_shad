// src/services/api/platform/serviceMachi.ts
import { RepoMachi } from '@repo/repoMachi';
import { RepoHighPrice } from '@repo/repoHighPrice';
import { HighestPrices } from '@typ/database';
import { PLATFORM } from '@typ/platform';
import { Asset } from '@typ/cryptoAnalytics';

export class ServiceMachi {
  /**
   * Fetches the most recent SHAD data from the database.
   */
  static async fetchMachiInDatabase(): Promise<Asset[]> {
    return await RepoMachi.fetchAll();
  }

  /**
   * Fetches the highest prices from the database.
   */
  static async getHighestPrices(): Promise<HighestPrices[]> {
    return await RepoHighPrice.fetchHighestPrices();
  }

  /**
   * Updates the highest price for a specific platform and base.
   */
  static async updateHighestPrice(platform: PLATFORM, base: string, price: number): Promise<void> {
    await RepoHighPrice.updateHighestPrice(platform, base, price);
  }
}