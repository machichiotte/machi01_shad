// src/utils/filter.ts
import { Order, Trade } from '../types/responseData'

export const filterTradesByAsset = (trades: Trade[], base: string, platform: string) =>
    trades.filter((trade) => trade.base === base && trade.platform === platform)

export const filterOrdersByAsset = (orders: Order[], base: string, platform: string) =>
    orders.filter((order) => order.symbol.startsWith(base + '/') && order.platform === platform)


export function applyGlobalFilter<T extends Record<string, unknown>>(
    items: T[],
    filterText: string
): T[] {
    if (!filterText.trim()) return items
    const lowerFilter = filterText.toLowerCase()
    return items.filter(item =>
        Object.values(item).some(value =>
            String(value).toLowerCase().includes(lowerFilter)
        )
    )
}
