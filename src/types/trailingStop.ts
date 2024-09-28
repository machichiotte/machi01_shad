// src/types/trailingStop.ts
export interface Asset {
    base: string;
    platform: string;
}

export interface HighestPrice {
    base: string;
    platform: string;
    highestPrice: number;
}

export interface UpdatedOrder {
    base: string;
    platform: string;
}

export type RateLimit = {
    weight?: number;
    orders?: number;
    period: number;
}

export type RateLimits = {
    [key: string]: RateLimit;
}