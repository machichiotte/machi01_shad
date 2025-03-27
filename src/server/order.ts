// src/server/order.ts
import { executeApiRequest } from './common';  // Plus besoin de serverHost ici
import { ApiResponse } from '../types/response';

const cancelAllOrders = <T>(platform: string, asset: string): Promise<ApiResponse<T>> => {
  return executeApiRequest('/order/cancel-all', { platform, asset });
};

const cancelAllSellOrders = <T>(platform: string, asset: string): Promise<ApiResponse<T>> => {
  return executeApiRequest('/order/cancel-all-sell', { platform, asset });
};

const cancelAllBuyOrders = <T>(platform: string, asset: string): Promise<ApiResponse<T>> => {
  return executeApiRequest('/order/cancel-all-buy', { platform, asset });
};

const addMarketSellOrder = <T>(platform: string, asset: string, amount: number): Promise<ApiResponse<T>> => {
  return executeApiRequest('/order/market-sell-order', { platform, asset, amount });
};

const addLimitSellOrder = <T>(platform: string, asset: string, amount: number, price: number): Promise<ApiResponse<T>> => {
  return executeApiRequest('/order/limit-sell-order', { platform, asset, amount, price });
};

const addLimitBuyOrder = <T>(platform: string, asset: string, amount: number, price: number): Promise<ApiResponse<T>> => {
  return executeApiRequest('/order/limit-buy-order', { platform, asset, amount, price });
};

export {
  cancelAllOrders,
  cancelAllSellOrders,
  cancelAllBuyOrders,
  addMarketSellOrder,
  addLimitSellOrder,
  addLimitBuyOrder
};
