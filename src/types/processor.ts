// src/types/processor.ts

import { PLATFORM } from "./platform"

export interface Difference {
    base: string
    platform: PLATFORM
    newSymbol?: boolean
    balanceDifference?: boolean
    zeroBalance?: boolean
}

export interface Balance {
    platform: PLATFORM
    base: string
    balance: number
}

export interface Ticker {
    symbol: string
    platform: PLATFORM
}
