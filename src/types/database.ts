// src/types/database.ts
import { MappedBalance } from '@typ/balance'
import { MappedCmc } from '@typ/cmc'
import { MappedStrat } from '@typ/strat'
import { MappedOrder } from '@typ/order'
import { MappedMarket } from '@typ/market'
import { MappedTrade } from '@typ/trade'
import { MappedTicker } from '@typ/ticker'
import { TimestampData } from '@typ/timestamp'
import { Asset } from '@typ/metrics'
import { ApiConfig, ServerConfig } from '@config/types'

import { ObjectId } from 'mongodb';

export interface SwapMigration {
    _id?: ObjectId;
    oldBase: string
    newBase: string
    swapRate: string
    platform: string
    delistingDate: string
}

export interface HighestPrices {
    _id?: ObjectId;
    base: string
    platform: string
    highestPrice: number
}

export type MappedData = ApiConfig | ServerConfig | TimestampData | HighestPrices | Asset | MappedMarket | MappedBalance | MappedOrder | MappedTrade | MappedTicker | MappedCmc | MappedStrat | SwapMigration;