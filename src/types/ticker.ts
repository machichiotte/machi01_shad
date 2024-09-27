// src/types/ticker
export interface MappedTicker {
    _id: { $oid: string };
    symbol: string
    timestamp: number | undefined
    last: number | undefined
    platform: string
}