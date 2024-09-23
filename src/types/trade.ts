// src/types/trade
import { Trade, Exchange } from 'ccxt'
import { InsertOneResult, InsertManyResult } from 'mongodb'

export interface MappedTrade {
    _id?: string
    base: string
    quote: string
    pair: string
    date?: string
    timestamp?: number
    type: string
    price: number
    amount: number
    total: number
    fee: number
    feecoin: string
    platform: string
    totalUSDT: number
}

export interface TradeServiceResult {
    data: MappedTrade[]
}

export interface ManualTradeAdditionResult {
    data: InsertOneResult<Document> | InsertManyResult<Document>
}

export type PlatformTradeFetcher = (platformInstance: Exchange) => Promise<Trade[]>