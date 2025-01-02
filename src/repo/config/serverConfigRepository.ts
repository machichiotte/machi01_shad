// src/repo/serverConfigRepository.ts
import { config } from '@config/index'
import { Server } from '@config/types'
import { DatabaseService } from '@services/api/database/databaseService'
import { MappedData } from '@typ/database'
import { DEFAULT_SERVER_CONFIG } from '@config/default'

const COLLECTION_NAME = config.databaseConfig.collection.serverConfig

export class ServerConfigRepository {
  /**
   * Récupère la configuration server depuis la base de données.
   * Si aucune configuration n'existe, crée une configuration par défaut.
   */
  static async fetchServerConfig(): Promise<Server> {
    const data = await DatabaseService.getData(COLLECTION_NAME) as Server[]
    if (!data || data.length === 0) {
      // Create default server config if none exists
      await DatabaseService.insertData(COLLECTION_NAME, DEFAULT_SERVER_CONFIG)
      return DEFAULT_SERVER_CONFIG
    }
    return data[0] as Server
  }

  /**
   * Met à jour la configuration server dans la base de données.
   */
  static async updateServerConfig(updatedConfig: Server): Promise<void> {
    await DatabaseService.deleteAndInsertData(COLLECTION_NAME, [
      updatedConfig
    ] as MappedData[])
  }
}
