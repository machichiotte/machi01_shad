// src/services/apiConfigService.ts
import { RepoConfigApi } from '@src/repo/config/repoConfigApi';
import { Api } from '@config/types';

export class ApiConfigService {

  static async getApiConfig(): Promise<Api> {
    const result = await RepoConfigApi.fetchApiConfig();
    return result;
  }

  static async getDecryptedApiConfig(): Promise<Api> {
    const result = await RepoConfigApi.fetchDecryptedApiConfig();
    return result;
  }

  /**
   * Met à jour la configuration server et met à jour le cache.
   */
  static async updateApiConfig(updatedConfig: Api): Promise<void> {
    await RepoConfigApi.updateConfigApi(updatedConfig);
  }
}
