// src/services/api/platform/serviceDashboard.ts
import { RepoDashboard } from '@src/repo/repoDashboard';
import { RepoHighPrice } from '@repo/repoHighPrice';
import { HighestPrices } from '@typ/database';
import { PLATFORM } from '@typ/platform';
import { Asset } from '@typ/cryptoAnalytics';

export class ServiceDashboard {
  /**
   * Fetches the most recent Dashboard data from the database.
   */
  static async fetchDashboardInDatabase(): Promise<Asset[]> {
    return await RepoDashboard.fetchAll();
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