// src/services/serverConfigService.ts
import { ServerConfig } from '@config/types';
import { ServerConfigRepository } from '@src/repositories/serverConfigRepository';

export class ServerConfigService {

  static async getServerConfig(): Promise<ServerConfig> {
    const result = await ServerConfigRepository.fetchServerConfig();
    return result;
  }

  /**
   * Met à jour la configuration server et met à jour le cache.
   */
  static async updateServerConfig(updatedConfig: ServerConfig): Promise<void> {
    await ServerConfigRepository.updateServerConfig(updatedConfig);
  }
}
