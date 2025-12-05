// src/types/cache.ts
import { MappedData } from "./database";

export interface CacheItem {
    data: MappedData[];
    timestamp: number;
}