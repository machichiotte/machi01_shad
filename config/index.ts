// config/index.ts
import dotenv from 'dotenv';
import path from 'path';

import {
    DEFAULT_MONGODB_COLLECTION,
    DEFAULT_DATABASE_CATEGORY,
    DEFAULT_SERVER_CONFIG,
    DEFAULT_APICONFIG
} from './default';

import { ApiConfig, EnvironmentConfig, ServerConfig } from './types';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

switch (process.env.NODE_ENV) {
    case 'prod': dotenv.config({ path: path.resolve(__dirname, '../.env.prod') });
        break;
    case 'dev': dotenv.config({ path: path.resolve(__dirname, '../.env.dev') });
        break;
    case 'test': dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
        break;
}

// Configuration minimale pour la connexion initiale à MongoDB
export const config: EnvironmentConfig = {
    port: Number(process.env.PORT),
    isOffline: process.env.OFFLINE_MODE === "true",

    databaseConfig: {
        credentials: {
            user: process.env.MONGODB_USER || '',
            password: process.env.MONGODB_PASSWORD || '',
            cluster: process.env.MONGODB_CLUSTER || '',
            dbName: process.env.MONGODB_DATABASE || '',
        },

        collection: {
            balance: process.env.MONGODB_COLLECTION_BALANCE || DEFAULT_MONGODB_COLLECTION.balance,
            cmc: process.env.MONGODB_COLLECTION_CMC || DEFAULT_MONGODB_COLLECTION.cmc,
            highestPrice: process.env.MONGODB_COLLECTION_HIGHEST_PRICE || DEFAULT_MONGODB_COLLECTION.highestPrice,
            timestamp: process.env.MONGODB_COLLECTION_TIMESTAMP || DEFAULT_MONGODB_COLLECTION.timestamp,
            market: process.env.MONGODB_COLLECTION_MARKET || DEFAULT_MONGODB_COLLECTION.market,
            order: process.env.MONGODB_COLLECTION_ORDER || DEFAULT_MONGODB_COLLECTION.order,
            machi: process.env.MONGODB_COLLECTION_MACHI || DEFAULT_MONGODB_COLLECTION.machi,
            serverConfig: process.env.MONGODB_COLLECTION_SERVER_CONFIG || DEFAULT_MONGODB_COLLECTION.serverConfig,
            apiConfig: process.env.MONGODB_COLLECTION_API_CONFIG || DEFAULT_MONGODB_COLLECTION.apiConfig,
            strat: process.env.MONGODB_COLLECTION_STRAT || DEFAULT_MONGODB_COLLECTION.strat,
            swap: process.env.MONGODB_COLLECTION_SWAP || DEFAULT_MONGODB_COLLECTION.swap,
            ticker: process.env.MONGODB_COLLECTION_TICKER || DEFAULT_MONGODB_COLLECTION.ticker,
            trade: process.env.MONGODB_COLLECTION_TRADE || DEFAULT_MONGODB_COLLECTION.trade,
            user: process.env.MONGODB_COLLECTION_USER || DEFAULT_MONGODB_COLLECTION.user,
        },

        category: {
            balance: process.env.COLLECTION_CATEGORY_BALANCE || DEFAULT_DATABASE_CATEGORY.balance,
            cmc: process.env.COLLECTION_CATEGORY_CMC || DEFAULT_DATABASE_CATEGORY.cmc,
            timestamp: process.env.COLLECTION_CATEGORY_TIMESTAMP || DEFAULT_DATABASE_CATEGORY.timestamp,
            market: process.env.COLLECTION_CATEGORY_MARKET || DEFAULT_DATABASE_CATEGORY.market,
            order: process.env.COLLECTION_CATEGORY_ORDER || DEFAULT_DATABASE_CATEGORY.order,
            machi: process.env.COLLECTION_CATEGORY_MACHI || DEFAULT_DATABASE_CATEGORY.machi,
            strat: process.env.COLLECTION_CATEGORY_STRAT || DEFAULT_DATABASE_CATEGORY.strat,
            ticker: process.env.COLLECTION_CATEGORY_TICKER || DEFAULT_DATABASE_CATEGORY.ticker,
            trade: process.env.COLLECTION_CATEGORY_TRADE || DEFAULT_DATABASE_CATEGORY.trade,
            serverConfig: process.env.COLLECTION_CATEGORY_SERVER_CONFIG || DEFAULT_DATABASE_CATEGORY.serverConfig,
            apiConfig: process.env.COLLECTION_CATEGORY_API_CONFIG || DEFAULT_DATABASE_CATEGORY.apiConfig
        }, 
    },

    apiConfig: {
        cmc: {
            url: DEFAULT_APICONFIG.cmc.url || '',
            iv: DEFAULT_APICONFIG.cmc.iv || '',
            apiKey: DEFAULT_APICONFIG.cmc.apiKey || ''
        },
        platform: {
            binance: {
                iv: '',
                apiKey: process.env.APIKEY_BINANCE || '',
                secretKey: process.env.SECRETKEY_BINANCE || ''
            },
            kucoin: {
                iv: '',
                apiKey: process.env.APIKEY_KUCOIN || '',
                secretKey: process.env.SECRETKEY_KUCOIN || '',
                passphrase: process.env.PASSPHRASE_KUCOIN || ''
            },
            htx: {
                iv: '',
                apiKey: process.env.APIKEY_HTX || '',
                secretKey: process.env.SECRETKEY_HTX || '',
            },
            okx: {
                iv: '',
                apiKey: process.env.APIKEY_OKX || '',
                secretKey: process.env.SECRETKEY_OKX || '',
                passphrase: process.env.PASSPHRASE_OKX || ''
            },
            gateio: {
                iv: '',
                apiKey: process.env.APIKEY_GATEIO || '',
                secretKey: process.env.SECRETKEY_GATEIO || '',
            },
        }
    },
    serverConfig: {
        ...DEFAULT_SERVER_CONFIG
    }
};

// Fonction pour fusionner la configuration de base avec celle de la base de données
export async function loadServerConfig(serverConfig: ServerConfig): Promise<void> {
    config.serverConfig = serverConfig
};

export async function loadApiConfig(apiConfig: ApiConfig): Promise<void> {
    config.apiConfig = apiConfig
};