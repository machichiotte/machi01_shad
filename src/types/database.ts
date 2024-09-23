// src/types/database
import { MappedTrade } from '@typ/trade'
export interface LastUpdateData {
    [key: string]: number | { [key: string]: number }
}

export interface MappedCmc {
    _id?: { $oid: string };
    id: number;
    name: string;
    symbol: string;
    slug: string;
    num_market_pairs: number;
    date_added: string;
    tags: string[];
    max_supply: number | null;
    circulating_supply: number;
    total_supply: number;
    platform: {
        id: number;
        name: string;
        symbol: string;
        slug: string;
        token_address: string;
    } | null;
    infinite_supply: boolean;
    cmc_rank: number;
    self_reported_circulating_supply: number | null;
    self_reported_market_cap: number | null;
    tvl_ratio: number | null;
    last_updated: string;
    quote: {
        USD: {
            price: number;
            volume_24h: number;
            volume_change_24h: number;
            percent_change_1h: number;
            percent_change_24h: number;
            percent_change_7d: number;
            percent_change_30d: number;
            percent_change_60d: number;
            percent_change_90d: number;
            market_cap: number;
            market_cap_dominance: number;
            fully_diluted_market_cap: number;
            tvl: number | null;
            last_updated: string;
        };
    };
}

// Interface pour le mapping des balances
export interface MappedBalance {
    _id?: string
    base: string
    balance: number
    available: number
    platform: string
}

// Interface pour le mapping des trades


// Interface pour le mapping des ordres
export interface MappedOrder {
    _id?: string
    oId: string
    cId: string | undefined
    platform: string
    symbol: string
    type: string | undefined
    side: string | undefined
    amount: number
    price: number
}

// Interface pour le mapping des tickers
export interface MappedTicker {
    _id?: string
    symbol: string
    timestamp: number | undefined
    last: number | undefined
    platform: string
}

// Interface pour le mapping des marchés
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

export interface MappedStrategy {
    _id?: string
    asset: string
    strategies: {
        [key: string]: string
    }
    maxExposure: {
        [key: string]: number
    }
}

export interface ShadData {
    // Define the structure of SHAD data here
    [key: string]: string | number | object
}

export interface HighestPrice {
    asset: string
    platform: string
    highestPrice: number
}

export interface SwapMigration {
    oldAsset: string
    newAsset: string
    swapRate: string
    platform: string
    delistingDate: string
}

export interface AssetMetrics {
    iconUrl: string;
    asset: string;
    status: number[] | string;
    strat: string;
    ratioShad: string | number;
    totalShad: string | number;
    rank: string | number;
    averageEntryPrice: string | number;
    totalBuy: string | number;
    maxExposition: string | number;
    percentageDifference: string | number | undefined;
    currentPrice: string | number | undefined;
    currentPossession: string | number;
    profit: string | number;
    totalSell: string | number;
    recupShad: string | number;
    nbOpenBuyOrders: string | number;
    nbOpenSellOrders: string | number;
    totalAmount: string | number;
    balance: string | number;
    recupTp1: string | number;
    recupTpX: string | number;
    tp1: string | number;
    tp2: string | number;
    tp3: string | number;
    tp4: string | number;
    tp5: string | number;
    percentToNextTp: string | number | undefined;
    platform: string;
}

export interface HighestPrices {
    _id?: string
    base: string
    platform: string
    highestPrice: number
}

export type MappedData = HighestPrices | AssetMetrics | MappedMarket | MappedBalance | MappedOrder | MappedTrade | MappedTicker | MappedCmc | MappedStrategy | ShadData | SwapMigration;