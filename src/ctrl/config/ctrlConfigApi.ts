// src/ctrl/config/ctrlConfigApi.ts
import { Request, Response } from 'express';
import { RepoConfigApi } from '@src/repo/config/repoConfigApi';
import { Api } from '@config/types';
import { handleControllerError } from '@src/utils/errorUtil';

/**
 * Retrieves the current API configuration.
 */
export const getApiConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const apiConfig = await RepoConfigApi.fetchDecryptedApiConfig();
    res.status(200).json({
      status: 'success',
      message: 'API configuration retrieved successfully',
      data: apiConfig,
    });
  } catch (error) {
    handleControllerError(res, error, getApiConfig.name);
  }
};

/**
 * Updates the API configuration.
 */
export const updateApiConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const config: Api = req.body; // Assuming the body contains the new config
    await RepoConfigApi.updateConfigApi(config);
    res.status(200).json({
      status: 'success',
      message: 'API configuration updated successfully',
    });
  } catch (error) {
    handleControllerError(res, error, updateApiConfig.name); 
  }
};

export const updateApiKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, platform, apiKey, secretKey, passphrase } = req.body;

    // Validation des données entrantes
    if (!type || !apiKey) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid payload: "type" and "apiKey" are required.',
      });
      return;
    }

    // Cas CMC
    if (type === 'cmc') {
      await RepoConfigApi.encryptConfigCmc(apiKey);
    } 
    // Cas Platform
    else if (type === 'platform' && platform) {
      await RepoConfigApi.encryptConfigPlatform(platform, apiKey, secretKey, passphrase);
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Invalid payload: Provide valid "type" and "platform" for platform updates.',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: `API key updated successfully for ${type === 'cmc' ? 'CMC' : platform}.`,
    });
  } catch (error) {
    handleControllerError(res, error, updateApiKey.name);
  }
};