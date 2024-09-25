// src/types/ticker
export interface MappedTicker {
    _id?: string
    symbol: string
    timestamp: number | undefined
    last: number | undefined
    platform: string
}