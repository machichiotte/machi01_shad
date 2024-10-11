// src/js/server/strat.ts
import { executeApiRequest } from './common';
import { ApiResponse } from '../../types/response';

const updateStrategies = async <T>(strategies: any): Promise<ApiResponse<T>> => {
    return executeApiRequest('/strategy/update', { strategies });
};

const updateMaxExposure = async <T>(maxExposure: any): Promise<ApiResponse<T>> => {
    return executeApiRequest('/strategy/updateMaxExposure', { maxExposure });
};

export {
    updateStrategies,
    updateMaxExposure
};
