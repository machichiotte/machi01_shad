// src/repositories/serverConfigRepository.ts
import { config } from '@config/index';
import { DatabaseService } from '@src/services/databaseService';

const COLLECTION_NAME = config.collection.serverConfig;

export class ServerConfigRepository {
  /**
   * Récupère la configuration server depuis la base de données.
   */
  static async fetchServerConfig(): Promise<any> {
    return await DatabaseService.getData(COLLECTION_NAME);
  }

  /**
   * Met à jour la configuration server dans la base de données.
   */
  static async updateServerConfig(updatedConfig: Record<string, unknown>): Promise<void> {
    const timestamp = new Date().toISOString();
    await DatabaseService.deleteAndInsertData(COLLECTION_NAME, { ...updatedConfig, lastModified: timestamp });
  }

  /**
   * Récupère la date de dernière modification.
   */
  static async fetchLastModified(): Promise<string | null> {
    const config = await this.fetchServerConfig();
    return config?.lastModified || null;
  }
}
