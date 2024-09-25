// src/types/market
export interface MappedMarket {
    _id?: string
    symbol: string
    base: string
    quote: string
    active: boolean
    type: string
    amountMin: number
    amountMax: number
    priceMin: number
    priceMax: number
    precisionAmount?: number
    precisionPrice?: number
    platform: string
}