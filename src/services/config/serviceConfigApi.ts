// src/services/serviceConfigApi.ts
import { RepoConfigApi } from '@repo/config/repoConfigApi';
import { Api } from '@config/types';

export class ServiceConfigApi {

  static async getConfig(): Promise<Api> {
    const result = await RepoConfigApi.fetchConfig();
    return result;
  }

  static async getDecryptedConfig(): Promise<Api> {
    const result = await RepoConfigApi.fetchDecryptedConfig();
    return result;
  }

  /**
   * Met à jour la configuration server et met à jour le cache.
   */
  static async updateConfig(updatedConfig: Api): Promise<void> {
    await RepoConfigApi.updateConfigApi(updatedConfig);
  }
}
