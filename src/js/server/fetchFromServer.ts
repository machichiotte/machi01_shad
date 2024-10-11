// src/js/server/fetchFromServer
import { fetchApiData } from './common';  // Import de fetchApiData depuis common.ts
import { Balance, Cmc, Machi, Order, Strat, Ticker, Trade } from "../../types/responseData";

const ENDPOINTS: Record<string, string> = {
  CMC: '/cmc/get',
  STRATEGY: '/strategy/get',
  BALANCE: '/balance/get',
  TRADES: '/trades/get',
  ORDERS: '/order/get',
  TICKERS: '/tickers/get',
  MACHI: '/shad/get'
};

// Wrapper functions for fetching different types of data
const fetchBalance = (): Promise<Balance[]> => fetchApiData<Balance[]>(ENDPOINTS.BALANCE);
const fetchCmc = (): Promise<Cmc[]> => fetchApiData<Cmc[]>(ENDPOINTS.CMC);
const fetchOrder = (): Promise<Order[]> => fetchApiData<Order[]>(ENDPOINTS.ORDERS);
const fetchMachi = (): Promise<Machi[]> => fetchApiData<Machi[]>(ENDPOINTS.MACHI);
const fetchStrategy = (): Promise<Strat[]> => fetchApiData<Strat[]>(ENDPOINTS.STRATEGY);
const fetchTicker = (): Promise<Ticker[]> => fetchApiData<Ticker[]>(ENDPOINTS.TICKERS);
const fetchTrade = (): Promise<Trade[]> => fetchApiData<Trade[]>(ENDPOINTS.TRADES);

export {
  fetchBalance,
  fetchCmc,
  fetchOrder,
  fetchMachi,
  fetchStrategy,
  fetchTicker,
  fetchTrade,
};
