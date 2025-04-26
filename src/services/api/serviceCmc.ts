// src/services/api/serviceCmc.ts
import { config } from '@config/index'
import { RepoCmc } from '@repo/repoCmc'
import { RepoConfigApi } from '@repo/repoConfigApi'
import { handleServiceError } from '@utils/errorUtil'
import { MappedCmc, FetchResponse } from '@typ/cmc'

export class ServiceCmc {
  private static readonly limit = 5000
  private static readonly baseStart = 1
  private static readonly convert = 'USD'

  /**
   * Récupère les données CMC actuelles via l'API CoinMarketCap.
   */
  public static async fetchCurrentCmc(): Promise<MappedCmc[]> {
    let start = this.baseStart
    const allData: MappedCmc[] = []
    if (config.apiConfig.cmc && config.apiConfig.cmc.iv && config.apiConfig.cmc.apiKey) {
      const encryptedPlatformConfig = config.apiConfig.cmc;
      const decryptedPlatformConfig = RepoConfigApi.decryptConfigCmc(encryptedPlatformConfig)


      try {
        while (true) {
          const URL = `${config.apiConfig.cmc.url}?start=${start}&limit=${this.limit}&convert=${this.convert}`
          const response = await fetch(URL, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-CMC_PRO_API_KEY': decryptedPlatformConfig.apiKey || ''
            }
          })


          if (!response.ok)
            throw new Error(
              `Échec de la récupération des données CoinMarketCap: ${response.statusText}`
            )


          // Log the raw response for debugging
          const rawResponse = await response.text()

          const { data, status }: FetchResponse = JSON.parse(rawResponse)
          if (data.length === 0) break

          allData.push(...data)
          start += data.length

          // Si toutes les données sont récupérées, on arrête la boucle
          if (status.total_count <= start) break
        }
      } catch (error) {
        handleServiceError(
          error,
          'fetchCurrentCmc',
          'Erreur lors de la récupération des données CMC'
        )
        throw error
      }
    }
    return allData
  }

  /**
   * Récupère les données CMC depuis la base de données via le repository.
   */
  public static async fetchDatabaseCmc(): Promise<MappedCmc[]> {
    try {
      return await RepoCmc.fetchAll()
    } catch (error) {
      handleServiceError(
        error,
        'fetchDatabaseCmc',
        'Erreur lors de la récupération des données CMC de la base de données'
      )
      throw error
    }
  }

  /**
   * Met à jour les données CMC dans la base de données via le repository.
   */
  public static async updateDatabaseCmcData(
    data: MappedCmc[]
  ): Promise<object> {
    try {
      const deleteResult = await RepoCmc.deleteAll()
      const saveResult = await RepoCmc.save(data)

      return {
        status: true,
        message: 'Données CMC mises à jour avec succès',
        data,
        deleteResult,
        saveResult,
        totalCount: data.length
      }
    } catch (error) {
      handleServiceError(
        error,
        'updateDatabaseCmcData',
        'Erreur lors de la mise à jour des données CMC dans la base de données'
      )
      throw error
    }
  }

  /**
   * Met à jour les données CMC en récupérant les informations les plus récentes
   * via l'API puis en les enregistrant dans la base de données.
   */
  public static async updateCmcData(): Promise<object> {
    try {
      const data = await ServiceCmc.fetchCurrentCmc()
      return await ServiceCmc.updateDatabaseCmcData(data)
    } catch (error) {
      handleServiceError(
        error,
        'updateCmcData',
        'Erreur lors de la mise à jour des données CMC'
      )
      throw error
    }
  }
}
