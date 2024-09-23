// src/types/mongodb
import { Document, InsertOneResult, InsertManyResult } from 'mongodb';

export interface CacheItem {
    data: Document[];
    timestamp: number;
}

export type InsertData = InsertOneResult<Document> | InsertManyResult<Document>;

export interface UpdateOneDataParams {
    matchedCount: number;
    modifiedCount: number;
    upsertedId: object;
    upsertedCount: number;
}