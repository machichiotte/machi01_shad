// config/types.ts
import { PLATFORM } from "@src/types/platform";
export interface DatabaseConfig {
    user: string;
    password: string;
    cluster: string;
    dbName: string;
}

export interface CollectionConfig {
    [key: string]: string;
}

export interface CacheExpirationTimes {
    cmc: number;
    balances: number;
    highestPrices: number;
    timestamps: number;
    markets: number;
    orders: number;
    shad: number;
    strats: number;
    swaps: number;
    tickers: number;
    trades: number;
    users: number;
}

export interface CollectionTypeConfig {
    [key: string]: string;
}

export interface ApiKeyConfig {
    apiKey: string;
    secretKey?: string;
    passphrase?: string;
}

export type ApiKeysPlatform = {
    [key in PLATFORM]: ApiKeyConfig
}

export interface ApiKeysConfig {
    cmc: ApiKeyConfig
    platform: ApiKeysPlatform;
}

export interface SmtpAuthConfig {
    user: string | undefined;
    receiver: string | undefined;
    pass: string | undefined;
}

export interface SmtpConfig {
    host: string;
    port: number;
    auth: SmtpAuthConfig;
}

export interface CronSchedulesConfig {
    shad: string;
    markets: string;
    tickers: string;
    balances: string;
}

export interface LogFilesConfig {
    error: string;
    info: string;
}

export interface SecurityConfig {
    hashRounds: number;
}

export interface EnvironmentConfig {
    port: number;
    isOffline: boolean;
    database: DatabaseConfig;
    collection: CollectionConfig;
    cacheExpirationTimes: CacheExpirationTimes;
    collectionType: CollectionTypeConfig;
    apiKeys: ApiKeysConfig;
    smtp: SmtpConfig;
    cronSchedules: CronSchedulesConfig;
    logFiles: LogFilesConfig;
    security: SecurityConfig;
}