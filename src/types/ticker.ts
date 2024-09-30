// src/types/ticker.ts
import { ObjectId } from 'mongodb';

export interface MappedTicker {
    _id: ObjectId;
    symbol: string
    timestamp: number | undefined
    last: number | undefined
    platform: string
}