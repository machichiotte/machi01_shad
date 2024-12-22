// src/services/serverConfigService.ts
import { ServerConfigRepository } from '@src/repositories/serverConfigRepository';

export class ServerConfigService {
  private static cachedConfig: any = null;

  static async getServerConfig(): Promise<any> {
    const dbLastModified = await ServerConfigRepository.fetchLastModified();

    const currentTime = Date.now();
    const cacheTTL = 10 * 60 * 1000; // 10 minutes en millisecondes

    if (
      !this.cachedConfig ||
      (dbLastModified && dbLastModified !== this.cachedConfig.lastModified) ||
      (this.cachedConfig.cacheTimestamp && currentTime - this.cachedConfig.cacheTimestamp > cacheTTL)
    ) {
      console.log('Reloading server config from database...');
      this.cachedConfig = {
        ...(await ServerConfigRepository.fetchServerConfig()),
        cacheTimestamp: Date.now()
      };
    }

    return this.cachedConfig;
  }

  /**
   * Met à jour la configuration server et met à jour le cache.
   */
  static async updateServerConfig(updatedConfig: Record<string, unknown>): Promise<void> {
    await ServerConfigRepository.updateServerConfig(updatedConfig);
    this.cachedConfig = { ...updatedConfig, lastModified: new Date().toISOString() };
  }
}
