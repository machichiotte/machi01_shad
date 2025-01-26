// src/js/utils/filter.ts
import { Order, Trade } from '../../types/responseData'

export const filterTradesByAsset = (trades: Trade[], base: string, platform: string) =>
  trades.filter((trade) => trade.base === base && trade.platform === platform)

export const filterOrdersByAsset = (orders: Order[], base: string, platform: string) =>
  orders.filter((order) => order.symbol.startsWith(base + '/') && order.platform === platform)
