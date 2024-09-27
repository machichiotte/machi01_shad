// src/types/platform
import { Trade, Market, Order, Tickers, Balance, Balances } from 'ccxt'

export type PlatformOrder = Order
export type PlatformTrade = Trade
export type PlatformMarket = Market
export type PlatformTickers = Tickers
export type PlatformBalance = Balance
export type PlatformBalances = Balances

export const PLATFORMS = [
    'binance', 'kucoin', 'htx', 'okx', 'gateio'
] as const

export type PLATFORM = typeof PLATFORMS[number];