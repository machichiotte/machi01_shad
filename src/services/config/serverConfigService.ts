// src/services/serverConfigService.ts
import { ServerConfigRepository } from '@src/repositories/config/serverConfigRepository';
import { Server } from '@config/types';

export class ServerConfigService {

  static async getServerConfig(): Promise<Server> {
    const result = await ServerConfigRepository.fetchServerConfig();
    return result;
  }

  /**
   * Met à jour la configuration server et met à jour le cache.
   */
  static async updateServerConfig(updatedConfig: Server): Promise<void> {
    await ServerConfigRepository.updateServerConfig(updatedConfig);
  }
}
