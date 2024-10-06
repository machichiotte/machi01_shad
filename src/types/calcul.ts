// src/types/calcul.ts
import { ObjectId } from 'mongodb';
import { PLATFORM } from './platform';

export enum TYPES {
    TRADE = 'trade',
    BALANCE = 'balance',
    STRAT = 'strat',
    CMC = 'cmc',
    ORDER = 'order',
    SHAD = 'shad',
    TICKER = 'ticker'
}

export interface Balance {
    _id: ObjectId;
    base: string;
    balance: number;
    available: number;
    platform: PLATFORM;
}

export interface Trade {
    _id: ObjectId;
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

export interface Strat {
    _id: ObjectId;
    asset: string
    strategies: {
        [key: string]: string
    }
    maxExposure: {
        [key: string]: number
    }
}

export interface Cmc {
    _id?: ObjectId;
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

export interface Order {
    _id: ObjectId;
    oId: string
    cId: string | undefined
    platform: string
    symbol: string
    type: string | undefined
    side: string | undefined
    amount: number
    price: number
}

export interface Shad {
    [key: string]: string | number | object
}

export interface Ticker {
    _id: ObjectId;
    symbol: string
    timestamp: number | undefined
    last: number | undefined
    platform: string
}