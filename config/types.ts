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
    balance: number;
    highestPrice: number;
    timestamp: number;
    market: number;
    order: number;
    machi: number;
    strat: number;
    swap: number;
    ticker: number;
    trade: number;
    user: number;
}

export interface collectionCategoryConfig {
    balance: string;
    cmc: string;
    timestamp: string;
    market: string;
    order: string;
    machi: string;
    strat: string;
    ticker: string;
    trade: string;
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
    machi: string;
    market: string;
    ticker: string;
    balance: string;
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
    collectionCategory: collectionCategoryConfig;
    apiKeys: ApiKeysConfig;
    smtp: SmtpConfig;
    cronSchedules: CronSchedulesConfig;
    logFiles: LogFilesConfig;
    security: SecurityConfig;
}