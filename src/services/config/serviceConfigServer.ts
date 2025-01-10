// src/services/serviceConfigServer.ts
import { RepoConfigServer } from '@repo/config/repoConfigServer';
import { Server } from '@config/types';

export class ServiceConfigServer {

  static async getConfig(): Promise<Server> {
    const result = await RepoConfigServer.fetchServerConfig();
    return result;
  }

  /**
   * Met à jour la configuration server et met à jour le cache.
   */
  static async updateConfig(updatedConfig: Server): Promise<void> {
    await RepoConfigServer.updateServerConfig(updatedConfig);
  }
}
