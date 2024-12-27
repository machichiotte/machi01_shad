// src/repositories/serverConfigRepository.ts
import { config } from '@config/index'
import { ServerConfig } from '@config/types'
import { DatabaseService } from '@src/services/api/database/databaseService'
import { MappedData } from '@typ/database'
import { DEFAULT_SERVER_CONFIG } from '@config/default'

const COLLECTION_NAME = config.databaseConfig.collection.serverConfig

export class ServerConfigRepository {
  /**
   * Récupère la configuration server depuis la base de données.
   * Si aucune configuration n'existe, crée une configuration par défaut.
   */
  static async fetchServerConfig(): Promise<ServerConfig> {
    const data = await DatabaseService.getData(COLLECTION_NAME)
    if (!data || data.length === 0) {
      // Create default server config if none exists
      await DatabaseService.insertData(COLLECTION_NAME, DEFAULT_SERVER_CONFIG)
      return DEFAULT_SERVER_CONFIG
    }
    return data[0] as ServerConfig
  }

  /**
   * Met à jour la configuration server dans la base de données.
   */
  static async updateServerConfig(updatedConfig: ServerConfig): Promise<void> {
    await DatabaseService.deleteAndInsertData(COLLECTION_NAME, [
      updatedConfig
    ] as MappedData[])
  }
}
