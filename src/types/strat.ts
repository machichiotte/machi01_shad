// src/types/strat.ts
export interface MappedStrat {
    _id: { $oid: string };
    asset: string
    strategies: {
        [key: string]: string
    }
    maxExposure: {
        [key: string]: number
    }
}