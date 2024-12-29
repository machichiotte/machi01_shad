// src/js/server/config.ts
import { executeApiRequest } from './common'
import { ApiResponse } from '../../types/response'
import { ApiConfig, KeyPayload } from '../../types/config';

// Function to create a new ApiConfig object
export const createApiConfig = (config: KeyPayload): KeyPayload => {
  return {
    type: config.type,
    platform: config.platform,
    apiKey: config.apiKey,
    secretKey: config.secretKey,
    passphrase: config.passphrase,
  };
};

const updateApiConfig = async <T>(config: ApiConfig): Promise<ApiResponse<T>> => {
  return executeApiRequest('/config/api/update', { config })
}

const updateKey = async <T>(payload: KeyPayload): Promise<ApiResponse<T>> => {
  return executeApiRequest('/config/api/update/key', payload);
};

export { updateApiConfig, updateKey }
