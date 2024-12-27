// src/repositories/apiConfigRepository.ts
import { config } from '@config/index'
import { ApiConfig, ApiKeyConfig } from '@config/types'
import { DatabaseService } from '@src/services/api/database/databaseService'
import { MappedData } from '@typ/database'
import { PLATFORM } from '@typ/platform'

import { DEFAULT_APICONFIG } from '@config/default'
import { EncryptionService } from '@src/utils/encryption'

const COLLECTION_NAME = config.databaseConfig.collection.apiConfig

export class ApiConfigRepository {
  private static encryptApiKeyConfig(config: ApiKeyConfig): ApiKeyConfig {
    const { encryptedData: encryptedKey } = EncryptionService.encrypt(
      config.apiKey
    )
    const encryptedSecret = config.secretKey
      ? EncryptionService.encrypt(config.secretKey).encryptedData
      : undefined
    const encryptedPassphrase = config.passphrase
      ? EncryptionService.encrypt(config.passphrase).encryptedData
      : undefined

    return {
      apiKey: encryptedKey,
      secretKey: encryptedSecret,
      passphrase: encryptedPassphrase
    }
  }

  private static decryptApiKeyConfig(
    config: ApiKeyConfig & { iv: string }
  ): ApiKeyConfig {
    return {
      apiKey: EncryptionService.decrypt(config.apiKey),
      secretKey: config.secretKey
        ? EncryptionService.decrypt(config.secretKey)
        : undefined,
      passphrase: config.passphrase
        ? EncryptionService.decrypt(config.passphrase)
        : undefined
    }
  }

  static async fetchApiConfig(): Promise<ApiConfig> {
    const data = await DatabaseService.getData(COLLECTION_NAME)
    if (!data || data.length === 0) {
      await DatabaseService.insertData(COLLECTION_NAME, DEFAULT_APICONFIG)
      return DEFAULT_APICONFIG
    }

    const encryptedConfig = data[0] as ApiConfig

    // Décrypter CMC
    const decryptedCmc = {
      ...encryptedConfig.cmc,
      apiKey: encryptedConfig.cmc.apiKey
        ? EncryptionService.decrypt(encryptedConfig.cmc.apiKey)
        : ''
    }

    // Décrypter les clés de plateforme
    const decryptedPlatform: { [key in PLATFORM]: ApiKeyConfig } = {} as {
      [key in PLATFORM]: ApiKeyConfig
    }
    Object.entries(encryptedConfig.platform).forEach(([platform, config]) => {
      decryptedPlatform[platform as PLATFORM] = this.decryptApiKeyConfig(
        config as ApiKeyConfig & { iv: string }
      )
    })

    return {
      ...encryptedConfig,
      cmc: decryptedCmc,
      platform: decryptedPlatform
    }
  }

  static async updateApiConfig(config: ApiConfig): Promise<void> {
    // Crypter CMC
    const { encryptedData: encryptedCmcKey } = EncryptionService.encrypt(
      config.cmc.apiKey
    )
    const encryptedCmc = {
      ...config.cmc,
      apiKey: encryptedCmcKey
    }

    // Crypter les clés de plateforme
    const encryptedPlatform: {
      [key in PLATFORM]: ApiKeyConfig
    } = {} as { [key in PLATFORM]: ApiKeyConfig }
    Object.entries(config.platform).forEach(([platform, platformConfig]) => {
      encryptedPlatform[platform as PLATFORM] =
        this.encryptApiKeyConfig(platformConfig)
    })

    const encryptedConfig = {
      ...config,
      cmc: encryptedCmc,
      platform: encryptedPlatform
    }

    await DatabaseService.deleteAndInsertData(COLLECTION_NAME, [
      encryptedConfig
    ] as MappedData[])
  }
}
