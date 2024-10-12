// src/js/server/strat.ts
import { executeApiRequest } from './common';
import { ApiResponse } from '../../types/response';
import { Strat } from '../../types/responseData';

const updateStrategies = async <T>(strategies: any): Promise<ApiResponse<T>> => {
    return executeApiRequest('/strategy/update', { strategies });
};

const updateMaxExposure = async <T>(maxExposure: any): Promise<ApiResponse<T>> => {
    return executeApiRequest('/strategy/updateMaxExposure', { maxExposure });
};

const updateStrategyById = async <T>(strat: Strat): Promise<ApiResponse<T>> => {
    return executeApiRequest('/strategy/updateStrategyById', { data: strat });
};

const updateStrategyByIds = async <T>(strats: Strat[]): Promise<ApiResponse<T>> => {
    return executeApiRequest('/strategy/updateStrategyByIds', { data: strats });
};

export {
    updateStrategies,
    updateMaxExposure,
    updateStrategyById,
    updateStrategyByIds
};
