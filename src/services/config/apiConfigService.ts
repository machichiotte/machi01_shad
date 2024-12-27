// src/services/apiConfigService.ts
import { ApiConfigRepository } from '@repositories/config/apiConfigRepository';
import { ApiConfig } from '@config/types';

export class ApiConfigService {

  static async getApiConfig(): Promise<ApiConfig> {
    const result = await ApiConfigRepository.fetchApiConfig();
    return result;
  }

  /**
   * Met à jour la configuration server et met à jour le cache.
   */
  static async updateApiConfig(updatedConfig: ApiConfig): Promise<void> {
    await ApiConfigRepository.updateApiConfig(updatedConfig);
  }
}
