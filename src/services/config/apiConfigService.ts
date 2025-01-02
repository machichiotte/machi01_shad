// src/services/apiConfigService.ts
import { ApiConfigRepository } from '@repo/config/apiConfigRepository';
import { Api } from '@config/types';

export class ApiConfigService {

  static async getApiConfig(): Promise<Api> {
    const result = await ApiConfigRepository.fetchApiConfig();
    return result;
  }

  static async getDecryptedApiConfig(): Promise<Api> {
    const result = await ApiConfigRepository.fetchDecryptedApiConfig();
    return result;
  }

  /**
   * Met à jour la configuration server et met à jour le cache.
   */
  static async updateApiConfig(updatedConfig: Api): Promise<void> {
    await ApiConfigRepository.updateConfigApi(updatedConfig);
  }
}
