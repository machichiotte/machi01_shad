// src/repo/repoConfigServer.ts
import { config } from '@config/index'
import { Server } from '@config/types'
import { ServiceDatabase } from '@services/api/database/serviceDatabase'
import { MappedData } from '@typ/database'
import { DEFAULT_SERVER_CONFIG } from '@config/default'

const COLLECTION_NAME = config.databaseConfig.collection.serverConfig

export class RepoConfigServer {
  /**
   * Récupère la configuration server depuis la base de données.
   * Si aucune configuration n'existe, crée une configuration par défaut.
   */
  static async fetchServerConfig(): Promise<Server> {
    const data = await ServiceDatabase.getCollectionDocuments(COLLECTION_NAME) as Server[]
    if (!data || data.length === 0) {
      // Create default server config if none exists
      await ServiceDatabase.insertDocuments(COLLECTION_NAME, DEFAULT_SERVER_CONFIG)
      return DEFAULT_SERVER_CONFIG
    }
    return data[0] as Server
  }

  /**
   * Met à jour la configuration server dans la base de données.
   */
  static async updateServerConfig(updatedConfig: Server): Promise<void> {
    await ServiceDatabase.replaceDocuments(COLLECTION_NAME, [
      updatedConfig
    ] as MappedData[])
  }
}
