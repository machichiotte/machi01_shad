export interface MappedCmc {
    // Define the structure of CoinMarketCap data
    [key: string]: string | number | object | undefined
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
export interface MappedTrade {
    _id?: string
    base: string
    quote: string
    pair: string
    date?: string
    timestamp?: number
    type: string
    price: number
    amount: number
    total: number
    fee: number
    feecoin: string
    platform: string
    totalUSDT: number
}

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