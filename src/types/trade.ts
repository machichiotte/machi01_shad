// src/types/trade.ts
import { InsertOneResult, InsertManyResult } from 'mongodb'
import { ObjectId } from 'mongodb';

export type InsertOne = InsertOneResult<Document>
export type InsertMany = InsertManyResult<Document>
export type InsertData = InsertOne | InsertMany;

export interface MappedTrade {
    _id: ObjectId;
    base: string
    quote: string
    pair: string
    dateUTC?: string
    timestamp?: number
    side: string
    price: number
    amount: number
    total: number
    fee: number
    feecoin: string
    platform: string
    eqUSD: number
}

export interface TradeServiceResult {
    data: MappedTrade[]
}

export interface ManualTradeAdditionResult {
    data: InsertData
}