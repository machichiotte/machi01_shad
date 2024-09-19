// src/models/processorTypes.ts

export interface Difference {
    base: string
    platform: string
    newSymbol?: boolean
    balanceDifference?: boolean
    zeroBalance?: boolean
}

export interface Balance {
    platform: string
    base: string
    balance: number
}

export interface Ticker {
    symbol: string
    platform: string
}
