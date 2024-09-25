// src/types/strat
export interface MappedStrat {
    _id?: string
    asset: string
    strategies: {
        [key: string]: string
    }
    maxExposure: {
        [key: string]: number
    }
}