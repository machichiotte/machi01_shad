// src/repositories/apiConfigRepository.ts
import { config } from '@config/index'
import { DEFAULT_APICONFIG } from '@config/default'
import { ApiConfig, ApiKeyConfig } from '@config/types'
import { DatabaseService } from '@services/api/database/databaseService'
import { MappedData } from '@typ/database'
import { PLATFORM } from '@typ/platform'
import { EncryptionService } from '@utils/encryption'
import { randomBytes } from 'crypto'

const COLLECTION_NAME = config.databaseConfig.collection.apiConfig

export class ApiConfigRepository {
  static async fetchApiConfig(): Promise<ApiConfig> {
    const data = (await DatabaseService.getData(COLLECTION_NAME)) as ApiConfig[]
    if (!data || data.length === 0) {
      await DatabaseService.insertData(COLLECTION_NAME, DEFAULT_APICONFIG)
      return DEFAULT_APICONFIG
    }

    const encryptedConfig = data[0] as ApiConfig
    // Décrypter CMC
    const decryptedCmc = {
      ...encryptedConfig.cmc,
      apiKey: encryptedConfig.cmc.apiKey
        ? EncryptionService.decrypt(
            encryptedConfig.cmc.iv,
            encryptedConfig.cmc.apiKey
          )
        : ''
    }
    // Décrypter les clés de plateforme
    const decryptedPlatform: { [key in PLATFORM]: ApiKeyConfig } = {} as {
      [key in PLATFORM]: ApiKeyConfig
    }

    Object.entries(encryptedConfig.platform).forEach(([platform, config]) => {
      const iv = config.iv
      if (iv) {
        decryptedPlatform[platform as PLATFORM] = this.decryptApiKeyConfig(
          config as ApiKeyConfig & { iv: string }
        )
      } else {
        console.warn(
          `No IV provided for platform: ${platform}. Skipping decryption.`
        )
        // Handle the case where IV is missing (e.g., set to undefined or a default value)
      }
    })

    return {
      ...encryptedConfig,
      cmc: decryptedCmc,
      platform: decryptedPlatform
    }
  }

  static async updateApiConfig(config: ApiConfig): Promise<void> {
    const rd = randomBytes(16) // Generate a random IV
    const iv = rd.toString('hex')
    const { encryptedData: encryptedCmcKey } = EncryptionService.encrypt(
      iv,
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

  /**
   * Updates the CMC API key with encryption.
   */
  static async updateCmcApiKey(apiKey: string): Promise<void> {
    const rd = randomBytes(16) // Générer un IV aléatoire
    const iv = rd.toString('hex')
    const { encryptedData: encryptedKey } = EncryptionService.encrypt(
      iv,
      apiKey
    )

    // Récupérer la configuration actuelle
    const currentConfig = await this.fetchApiConfig()
    currentConfig.cmc = {
      ...currentConfig.cmc,
      apiKey: encryptedKey,
      iv
    }

    // Sauvegarder la nouvelle configuration
    await this.updateApiConfig(currentConfig)
  }

  /**
   * Updates a platform-specific API key with encryption.
   */
  static async updatePlatformApiKey(
    platform: PLATFORM,
    apiKey: string,
    secretKey: string,
    passphrase?: string
  ): Promise<void> {
    const rd = randomBytes(16) // Générer un IV aléatoire
    const iv = rd.toString('hex')

    // Chiffrement des données
    const encryptedApiKey = EncryptionService.encrypt(iv, apiKey).encryptedData
    const encryptedSecretKey = secretKey
      ? EncryptionService.encrypt(iv, secretKey).encryptedData
      : undefined
    const encryptedPassphrase = passphrase
      ? EncryptionService.encrypt(iv, passphrase).encryptedData
      : undefined
    // Récupérer la configuration actuelle
    const currentConfig = await this.fetchApiConfig()

    // Mettre à jour la configuration pour la plateforme spécifique
    currentConfig.platform[platform] = {
      iv,
      apiKey: encryptedApiKey,
      secretKey: encryptedSecretKey,
      passphrase: encryptedPassphrase
    }

    // Sauvegarder la nouvelle configuration
    await this.updateApiConfig(currentConfig)
  }

  private static encryptApiKeyConfig(config: ApiKeyConfig): ApiKeyConfig {
    const rd = randomBytes(16) // Generate a random IV
    const iv = rd.toString('hex')
    const { encryptedData: encryptedKey } = EncryptionService.encrypt(
      iv,
      config.apiKey
    )
    const encryptedSecret = config.secretKey
      ? EncryptionService.encrypt(iv, config.secretKey).encryptedData
      : undefined
    const encryptedPassphrase = config.passphrase
      ? EncryptionService.encrypt(iv, config.passphrase).encryptedData
      : undefined

    return {
      iv,
      apiKey: encryptedKey,
      secretKey: encryptedSecret,
      passphrase: encryptedPassphrase
    }
  }

  private static decryptApiKeyConfig(
    config: ApiKeyConfig & { iv: string }
  ): ApiKeyConfig {
    const iv = config.iv
    return {
      iv,
      apiKey: EncryptionService.decrypt(iv, config.apiKey),
      secretKey: config.secretKey
        ? EncryptionService.decrypt(iv, config.secretKey)
        : undefined,
      passphrase: config.passphrase
        ? EncryptionService.decrypt(iv, config.passphrase)
        : undefined
    }
  }
}
