// src/services/mapping.ts

import { Trade, Balances, Ticker, Market, Order, Tickers } from 'ccxt'; // Importation des types nécessaires de ccxt
import { isStableCoin, getStableCoins, isMajorCryptoPair, getTotalUSDT } from '../utils/mappingUtil';

// Interface pour le mapping des balances
export interface MappedBalance {
  base: string;
  balance: number;
  available: number;
  platform: string;
}

// Interface pour le mapping des trades
export interface MappedTrade {
  _id?: string;
  base: string;
  quote: string;
  pair: string;
  timestamp: number;
  type: string;
  price: number;
  amount: number;
  total: number;
  fee: number;
  feecoin: string;
  platform: string;
  totalUSDT: number;
}

// Interface pour le mapping des ordres
export interface MappedOrder {
  oId: string;
  cId: string | undefined;
  platform: string;
  symbol: string;
  type: string | undefined;
  side: string | undefined;
  amount: number;
  price: number;
}

// Interface pour le mapping des tickers
export interface MappedTicker {
  symbol: string;
  timestamp: number | undefined;
  last: number | undefined;
  platform: string;
}

// Interface pour le mapping des marchés
export interface MappedMarket {
  symbol: string;
  base: string;
  quote: string;
  active: boolean;
  type: string;
  amountMin: number;
  amountMax: number;
  priceMin: number;
  priceMax: number;
  precisionAmount?: number;
  precisionPrice?: number;
  platform: string;
}

/**
 * Maps common balance data across all platforms.
 * @param {string} base - The base asset.
 * @param {number} balance - The total balance.
 * @param {number} available - The available balance.
 * @param {string} platform - The exchange platform.
 * @returns {Object} An object containing the mapped balance information.
 */
function mapBalanceCommon(base: string, balance: number, available: number, platform: string): MappedBalance {
  return {
    base,
    balance: parseFloat(balance.toString()),
    available: parseFloat(available.toString()),
    platform,
  };
}

/**
 * Maps balance data for a specific platform.
 * @param {string} platform - The exchange platform.
 * @param {Balance} data - The raw balance data.
 * @returns {Record<string, any>[]} An array of objects containing the mapped balances.
 */
function mapBalance(platform: string, data: Balances): MappedBalance[] {
  const mappings: Record<string, (item: any) => MappedBalance> = {
    binance: item =>
      mapBalanceCommon(
        item.asset,
        parseFloat(item.free) + parseFloat(item.locked),
        item.free,
        platform
      ),
    kucoin: item =>
      mapBalanceCommon(item.currency, item.balance, item.available, platform),
    htx: ([key, value]) =>
      mapBalanceCommon(key.toUpperCase(), value.total, value.free, platform),
    okx: item =>
      mapBalanceCommon(item.ccy, item.cashBal, item.availBal, platform),
    gateio: item =>
      mapBalanceCommon(
        item.currency,
        parseFloat(item.available) + parseFloat(item.locked),
        item.available,
        platform
      ),
  };

  const platformMapping = mappings[platform];
  if (!platformMapping) {
    console.warn(`Platform ${platform} not supported.`);
    return [];
  }

  const balanceData = Array.isArray(
    data.info?.balances || data.info?.data || data
  ) 
    ? (data.info?.balances || data.info?.data || data)
    : Object.entries(data).filter(
        ([key, value]) =>
          !["info", "free", "used", "total"].includes(key) && (value as any).total > 0
      );

  return balanceData
    .filter((item: any) => {
      const balance = parseFloat(
        item.balance ||
          item.free ||
          item.cashBal ||
          item.available ||
          item.locked ||
          item[1]?.total ||
          "0"
      );
      return balance > 0;
    })
    .map(platformMapping);
}

/**
 * Maps common trade data across all platforms.
 * @param {Trade} item - The raw trade data.
 * @param {string} platform - The exchange platform.
 * @param {Record<string, number>} conversionRates - Conversion rates (optional).
 * @returns {Record<string, any>} An object containing the mapped trade information.
 */
function mapTradeCommon(item: Trade, platform: string, conversionRates: Record<string, number> = {}): Omit<MappedTrade, '_id'> {
  const [baseAsset, quoteAsset] = item?.symbol?.toUpperCase().split("/") || [];
  const totalUSDT = getTotalUSDT(
    item.symbol?.toUpperCase() || "",
    item.cost || 0,
    conversionRates
  );

  const feeCost = item.fee ? parseFloat(item.fee.cost?.toString() || "0") : 0;
  const feeCurrency = item.fee ? item.fee.currency?.toUpperCase() || "N/A" : "N/A";

  return {
    base: baseAsset,
    quote: quoteAsset,
    pair: item.symbol?.toUpperCase() || "",
    timestamp: item.timestamp || -1,
    type: item.side || "",
    price: parseFloat(item.price?.toString() || "0" ),
    amount: parseFloat(item.amount?.toString() || "0"),
    total: parseFloat(item.cost?.toString() || "0"),
    fee: feeCost,
    feecoin: feeCurrency,
    platform,
    totalUSDT: totalUSDT || 0,
  };
}

/**
 * Maps trade data for a specific platform.
 * @param {string} platform - The exchange platform.
 * @param {Trade[]} data - The raw trade data.
 * @param {Record<string, number>} conversionRates - Conversion rates (optional).
 * @returns {Record<string, any>[]} An array of objects containing the mapped trades.
 */
function mapTrades(platform: string, data: Trade[], conversionRates: Record<string, number> = {}): Omit<MappedTrade, '_id'>[] {
  return data.map((item) => {
      const commonData = mapTradeCommon(item, platform, conversionRates);
      if (
        platform === "okx" &&
        item.info?.data?.[0]?.details
      ) {
        return item.info.data[0].details.map((item: Trade) =>
          mapTradeCommon(item, "okx", conversionRates)
        );
      }
      return commonData;
    })
    .flat();
}

/**
 * Maps order data for a specific platform.
 * @param {string} platform - The exchange platform.
 * @param {Order[]} data - The raw order data.
 * @returns {Record<string, any>[]} An array of objects containing the mapped orders.
 */
function mapOrders(platform: string, data: Order[]): MappedOrder[] {
  return data.map((item) => ({
    oId: item.id,
    cId: item?.clientOrderId,
    platform,
    symbol: item.symbol,
    type: item?.type,
    side: item?.side,
    amount: item.amount,
    price: item.price,
  }));
}

/**
 * Maps ticker data for a specific platform.
 * @param {Ticker[]} data - The raw ticker data.
 * @param {string} platform - The exchange platform.
 * @returns {Record<string, any>[]} An array of objects containing the mapped tickers.
 */
function mapTickers(platform: string, data: Tickers): MappedTicker[] {
  return Object.values(data).map((item) => ({
    symbol: item.symbol,
    timestamp: item.timestamp,
    last: item.last,
    platform,
  }));
}

/**
 * Maps market data for a specific platform.
 * @param {Market[]} data - The raw market data.
 * @param {string} platform - The exchange platform.
 * @returns {Record<string, any>[]} An array of objects containing the mapped markets.
 */
function mapMarkets(platform: string, data: Market[]): Record<string, any>[] {
  return Object.values(data)
    .filter((item): item is Market => getStableCoins().some((coin) => item?.quote === coin))
    .map((item) => ({
      symbol: item?.id,
      base: item?.base,
      quote: item?.quote,
      active: item?.active,
      type: item?.type,
      amountMin: item?.limits.amount?.min || 0,
      amountMax: item?.limits.amount?.max || 0,
      priceMin: item?.limits.price?.min || 0,
      priceMax: item?.limits.price?.max || 0,
      precisionAmount: item?.precision?.amount,
      precisionPrice: item?.precision?.price,
      platform,
    }));
}

export {
  mapBalance,
  mapOrders,
  mapTickers,
  mapMarkets,
  mapTrades,
  getTotalUSDT,
  isStableCoin,
  isMajorCryptoPair,
};
