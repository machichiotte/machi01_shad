// src/js/server/fetchFromServer
import { fetchApiData } from './common';  // Import de fetchApiData depuis common.ts
import { Balance, Cmc, Asset, Order, Strat, Ticker, Trade } from "../../types/responseData";

const ENDPOINTS: Record<string, string> = {
  CMC: '/cmc/get',
  STRATEGY: '/strategy/get',
  BALANCE: '/balance/get',
  TRADE: '/trade/get',
  ORDER: '/order/get',
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

export {
  fetchBalance,
  fetchCmc,
  fetchOrder,
  fetchMachi,
  fetchStrategy,
  fetchTicker,
  fetchTrade,
};