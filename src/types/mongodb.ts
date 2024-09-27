// src/types/mongodb
import { Document } from 'mongodb';

export interface CacheItem {
    data: Document[];
    timestamp: number;
}

export interface UpdateOneDataParams {
    matchedCount: number;
    modifiedCount: number;
    upsertedId: object;
    upsertedCount: number;
}