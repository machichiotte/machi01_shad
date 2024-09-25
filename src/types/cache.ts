// src/types/cache
import { MappedData } from "./database";

export interface CacheItem {
    data: MappedData[];
    timestamp: number;
}