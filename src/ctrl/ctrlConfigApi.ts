// src/ctrl/ctrlConfigApi.ts
import { Request, Response } from 'express'
import { RepoConfigApi } from '@src/repo/repoConfigApi'
import { Api } from '@config/types'
import { handleControllerError } from '@utils/errorUtil'

/**
 * Retrieves the current API configuration.
 */
export const getConfigApi = async (req: Request, res: Response): Promise<void> => {
  try {
    const apiConfig = await RepoConfigApi.fetchDecryptedConfig()
    res.status(200).json({
      status: 'success',
      message: 'API configuration retrieved successfully',
      data: apiConfig,
    })
  } catch (error) {
    handleControllerError(res, error, getConfigApi.name)
  }
}

/**
 * Updates the API configuration.
 */
export const updateConfigApi = async (req: Request, res: Response): Promise<void> => {
  try {
    const config: Api = req.body // Assuming the body contains the new config
    await RepoConfigApi.updateConfigApi(config)
    res.status(200).json({
      status: 'success',
      message: 'API configuration updated successfully',
    })
  } catch (error) {
    handleControllerError(res, error, updateConfigApi.name)
  }
}

/**
 * Updates the API key based on the provided type.
 */
export const updateApiKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, platform, apiKey, secretKey, passphrase } = req.body

    // Validation des données entrantes
    if (!type || !apiKey) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid payload: "type" and "apiKey" are required.',
      })
      return
    }

    // Traitement en fonction du type de configuration
    if (type === 'cmc') {
      await RepoConfigApi.encryptConfigCmc(apiKey)
    } else if (type === 'gemini') {
      await RepoConfigApi.encryptConfigGemini(apiKey)
    } else if (type === 'platform' && platform) {
      await RepoConfigApi.encryptConfigPlatform(platform, apiKey, secretKey, passphrase)
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Invalid payload: Provide valid configuration type and required parameters.',
      })
      return
    }

    const updatedFor =
      type === 'cmc'
        ? 'CMC'
        : type === 'gemini'
          ? 'GEMINI'
          : platform

    res.status(200).json({
      status: 'success',
      message: `API key updated successfully for ${updatedFor}.`,
    })
  } catch (error) {
    handleControllerError(res, error, updateApiKey.name)
  }
}
