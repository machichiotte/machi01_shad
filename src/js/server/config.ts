// src/js/server/config.ts
import { executeApiRequest, pleaseApiUpdate } from './common'
import { ApiResponse } from '../../types/response'
import { ApiConfig, KeyPayload } from '../../types/config';

const updateApiConfig = async <T>(config: ApiConfig): Promise<ApiResponse<T>> => {
  return executeApiRequest('/config/api/update', { config })
}

const updateKey = async <T>(payload: KeyPayload): Promise<ApiResponse<T>> => {
  return pleaseApiUpdate('/config/api/update/key', payload);
};

export { updateApiConfig, updateKey }
