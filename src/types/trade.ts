// src/types/trade.ts
import { InsertOneResult, InsertManyResult } from 'mongodb'

export type InsertOne = InsertOneResult<Document>
export type InsertMany = InsertManyResult<Document>
export type InsertData = InsertOne | InsertMany;

export interface MappedTrade {
    _id: { $oid: string };
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
    data: InsertData
}