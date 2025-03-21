// src/js/server/fetchFromServer
import { fetchApiData } from './common';  // Import de fetchApiData depuis common.ts
import { Balance, Cmc, Asset, Order, Strat, Ticker, Trade } from "../../types/responseData";

const ENDPOINTS: Record<string, string> = {
  CMC: '/cmc/get',
  CMC_API: '/cmc/fetch',
  STRATEGY: '/strategy/get',
  BALANCE: '/balance/get',
  BALANCE_BY_PLATFORM: '/balance/fetch',
  TRADE: '/trade/get',
  TRADE_BY_BASE: '/trade/fetch',
  ORDER: '/order/get',
  ORDER_API: '/order/fetch',
  TICKER: '/ticker/get',
  MACHI: '/machi/get'
};

// Wrapper functions for fetching different types of data
const fetchBalance = (): Promise<Balance[]> => fetchApiData<Balance[]>(ENDPOINTS.BALANCE);
const fetchCmc = (): Promise<Cmc[]> => fetchApiData<Cmc[]>(ENDPOINTS.CMC);
const fetchOrder = (): Promise<Order[]> => fetchApiData<Order[]>(ENDPOINTS.ORDER);
const fetchMachi = (): Promise<Asset[]> => fetchApiData<Asset[]>(ENDPOINTS.MACHI);
const fetchStrategy = (): Promise<Strat[]> => fetchApiData<Strat[]>(ENDPOINTS.STRATEGY);
const fetchTicker = (): Promise<Ticker[]> => fetchApiData<Ticker[]>(ENDPOINTS.TICKER);
const fetchTrade = (): Promise<Trade[]> => fetchApiData<Trade[]>(ENDPOINTS.TRADE);

const fetchCmcApi = (): Promise<any[]> =>
  fetchApiData<any[]>(`${ENDPOINTS.CMC_API}`);

const fetchTradeBySymbol = (params: { base: string; platform: string }): Promise<any[]> =>
  fetchApiData<any[]>(`${ENDPOINTS.TRADE_BY_BASE}/${params.platform}/${params.base}`);

const fetchBalanceByPlatform = (params: { platform: string }): Promise<any[]> =>
  fetchApiData<any[]>(`${ENDPOINTS.BALANCE_BY_PLATFORM}/${params.platform}`);

const fetchOpenOrdersByPlatform = (params: { platform: string }): Promise<any[]> =>
  fetchApiData<any[]>(`${ENDPOINTS.ORDER_API}/${params.platform}`);

export {
  fetchBalance,
  fetchCmc,
  fetchOrder,
  fetchMachi,
  fetchStrategy,
  fetchTicker,
  fetchTrade,
  fetchTradeBySymbol,
  fetchBalanceByPlatform,
  fetchCmcApi,
  fetchOpenOrdersByPlatform
};