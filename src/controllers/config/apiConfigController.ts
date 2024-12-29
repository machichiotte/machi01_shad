// src/controllers/config/apiConfigController.ts
import { Request, Response } from 'express';
import { ApiConfigRepository } from '@repositories/config/apiConfigRepository';
import { ApiConfig } from '@config/types';
import { handleControllerError } from '@src/utils/errorUtil';

/**
 * Retrieves the current API configuration.
 */
export const getApiConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const apiConfig = await ApiConfigRepository.fetchApiConfig();
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
    const config: ApiConfig = req.body; // Assuming the body contains the new config
    await ApiConfigRepository.updateApiConfig(config);
    res.status(200).json({
      status: 'success',
      message: 'API configuration updated successfully',
    });
  } catch (error) {
    handleControllerError(res, error, updateApiConfig.name);
  }
};

export const updateApiKey = async (req: Request, res: Response): Promise<void> => {
  console.log('updateApiKey')
  try {
    const { type, platform, apiKey, secretKey, passphrase } = req.body;

    console.log('updateApiKey bodyyyy',req.body)
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
      await ApiConfigRepository.updateCmcApiKey(apiKey);
    } 
    // Cas Platform
    else if (type === 'platform' && platform) {
      await ApiConfigRepository.updatePlatformApiKey(platform, apiKey, secretKey, passphrase);
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