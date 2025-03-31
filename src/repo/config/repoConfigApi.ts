// src/repo/repoConfigApi.ts
import { config } from '@config/index'
import { DEFAULT_APICONFIG } from '@config/default'
import { Api, ApiPlatform, ApiCmc } from '@config/types'
import { ServiceDatabase } from '@services/api/database/serviceDatabase'
import { MappedData } from '@typ/database'
import { PLATFORM } from '@typ/platform'
import { EncryptionService } from '@utils/encryption'
import { randomBytes } from 'crypto'

const COLLECTION_NAME = config.databaseConfig.collection.apiConfig

export class RepoConfigApi {
  static async fetchConfig(): Promise<Api> {
    return await this.fetchOrCreateConfig()
  }

  static async fetchDecryptedConfig(): Promise<Api> {
    const encryptedConfig = await this.fetchOrCreateConfig()

    const decryptedCmc = this.decryptConfigCmc(encryptedConfig.cmc)

    const decryptedPlatform = this.decryptConfigPlatforms(
      encryptedConfig.platform
    )

    return {
      ...encryptedConfig,
      cmc: decryptedCmc,
      platform: decryptedPlatform
    }
  }

  private static async fetchOrCreateConfig(): Promise<Api> {
    const data = (await ServiceDatabase.getCollectionDocuments(COLLECTION_NAME)) as Api[]
    if (!data || data.length === 0) {
      await ServiceDatabase.insertDocuments(COLLECTION_NAME, DEFAULT_APICONFIG)
      return DEFAULT_APICONFIG
    }
    return data[0]
  }

  static async updateConfigApi(config: Api): Promise<void> {
    await ServiceDatabase.replaceDocuments(COLLECTION_NAME, [
      config
    ] as MappedData[])
  }

  static async encryptConfigCmc(apiKey: string): Promise<void> {
    const rd = randomBytes(16) // Générer un IV aléatoire
    const iv = rd.toString('hex')
    const encryptedKey = EncryptionService.encrypt(iv, apiKey).encryptedData

    // Récupérer la configuration actuelle
    const currentConfig = await this.fetchConfig()
    currentConfig.cmc = {
      ...currentConfig.cmc,
      apiKey: encryptedKey,
      iv
    }

    // Sauvegarder la nouvelle configuration
    await this.updateConfigApi(currentConfig)
  }

  static async encryptConfigPlatform(
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
    const currentConfig = await this.fetchConfig()

    // Mettre à jour la configuration pour la plateforme spécifique
    currentConfig.platform[platform] = {
      iv,
      apiKey: encryptedApiKey,
      secretKey: encryptedSecretKey,
      passphrase: encryptedPassphrase
    }

    // Sauvegarder la nouvelle configuration
    await this.updateConfigApi(currentConfig)
  }

  static decryptConfigCmc(cmcConfig: ApiCmc): ApiCmc {
    if (!cmcConfig || !cmcConfig.apiKey) {
      console.warn('CMC API key is null.')
      return cmcConfig || { apiKey: '', iv: '' }
    }

    const decryptedApiKey = EncryptionService.decrypt(
      cmcConfig.iv,
      cmcConfig.apiKey
    )
    return { ...cmcConfig, apiKey: decryptedApiKey }
  }

  static decryptConfigPlatform(config: ApiPlatform): ApiPlatform {
    const iv = config.iv
    const apiKey = EncryptionService.decrypt(config.iv, config.apiKey)
    const secretKey = config.secretKey
      ? EncryptionService.decrypt(config.iv, config.secretKey)
      : undefined
    const passphrase = config.passphrase
      ? EncryptionService.decrypt(config.iv, config.passphrase)
      : undefined

    return {
      iv,
      apiKey,
      secretKey,
      passphrase
    }
  }

  private static decryptConfigPlatforms(platformConfigs: {
    [key in PLATFORM]: ApiPlatform
  }): { [key in PLATFORM]: ApiPlatform } {
    const decryptedPlatform: { [key in PLATFORM]: ApiPlatform } = {} as {
      [key in PLATFORM]: ApiPlatform
    }

    Object.entries(platformConfigs).forEach(([platform, config]) => {
      if (!config.iv) {
        console.warn(
          `No IV provided for platform: ${platform}. Skipping decryption.`
        )
        return
      }

      decryptedPlatform[platform as PLATFORM] = this.decryptConfigPlatform(config)
    })

    return decryptedPlatform
  }
}