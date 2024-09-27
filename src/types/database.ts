// src/types/database
import { MappedBalance } from '@typ/balance'
import { MappedCmc } from '@typ/cmc'
import { MappedStrat } from '@typ/strat'
import { AssetMetrics } from '@typ/metrics'
import { MappedOrder } from '@typ/order'
import { MappedMarket } from '@typ/market'
import { MappedTrade } from '@typ/trade'
import { MappedTicker } from '@typ/ticker'
import { TimestampData } from '@typ/timestamp'

export interface ShadData {
    // Define the structure of SHAD data here
    [key: string]: string | number | object
}

export interface SwapMigration {
    _id?: { $oid: string };
    oldAsset: string
    newAsset: string
    swapRate: string
    platform: string
    delistingDate: string
}

export interface HighestPrices {
    _id?: { $oid: string };
    base: string
    platform: string
    highestPrice: number
}

export type MappedData = TimestampData | HighestPrices | AssetMetrics | MappedMarket | MappedBalance | MappedOrder | MappedTrade | MappedTicker | MappedCmc | MappedStrat | ShadData | SwapMigration;