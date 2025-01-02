// src/services/serverConfigService.ts
import { RepoConfigServer } from '@src/repo/config/repoConfigServer';
import { Server } from '@config/types';

export class ServerConfigService {

  static async getServerConfig(): Promise<Server> {
    const result = await RepoConfigServer.fetchServerConfig();
    return result;
  }

  /**
   * Met à jour la configuration server et met à jour le cache.
   */
  static async updateServerConfig(updatedConfig: Server): Promise<void> {
    await RepoConfigServer.updateServerConfig(updatedConfig);
  }
}
