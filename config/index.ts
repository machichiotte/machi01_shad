// config/index.ts
import dotenv from 'dotenv';
import path from 'path';

import { DEFAULT_PORT, DEFAULT_CRON_SCHEDULE, DEFAULT_SMTP, DEFAULT_OFFLINE_MODE, DEFAULT_MONGODB, DEFAULT_CACHE_EXPIRATION, DEFAULT_COLLECTION, DEFAULT_CATEGORY, DEFAULT_LOG_FILES, DEFAULT_SECURITY } from './default';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

switch (process.env.NODE_ENV) {
    case 'prod': dotenv.config({ path: path.resolve(__dirname, '../.env.prod') });
        break;
    case 'dev': dotenv.config({ path: path.resolve(__dirname, '../.env.dev') });
        break;
    case 'test': dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
        break;
}

// Export the config variables
export const config = {
    port: Number(process.env.PORT) || DEFAULT_PORT,
    isOffline: process.env.OFFLINE_MODE || DEFAULT_OFFLINE_MODE,
    database: {
        user: process.env.MONGODB_USER || DEFAULT_MONGODB.user,
        password: process.env.MONGODB_PASSWORD || DEFAULT_MONGODB.password,
        cluster: process.env.MONGODB_CLUSTER || DEFAULT_MONGODB.cluster,
        dbName: process.env.MONGODB_DATABASE || DEFAULT_MONGODB.database
    },

    collection: {
        balance: process.env.MONGODB_COLLECTION_BALANCE || DEFAULT_COLLECTION.balance,
        cmc: process.env.MONGODB_COLLECTION_CMC || DEFAULT_COLLECTION.cmc,
        highestPrice: process.env.MONGODB_COLLECTION_HIGHEST_PRICE || DEFAULT_COLLECTION.highestPrice,
        timestamp: process.env.MONGODB_COLLECTION_TIMESTAMP || DEFAULT_COLLECTION.timestamp,
        market: process.env.MONGODB_COLLECTION_MARKET || DEFAULT_COLLECTION.market,
        order: process.env.MONGODB_COLLECTION_ORDER || DEFAULT_COLLECTION.order,
        machi: process.env.MONGODB_COLLECTION_MACHI || DEFAULT_COLLECTION.machi,
        serverConfig: process.env.MONGODB_COLLECTION_SERVER_CONFIG || DEFAULT_COLLECTION.serverConfig,
        strat: process.env.MONGODB_COLLECTION_STRAT || DEFAULT_COLLECTION.strat,
        swap: process.env.MONGODB_COLLECTION_SWAP || DEFAULT_COLLECTION.swap,
        ticker: process.env.MONGODB_COLLECTION_TICKER || DEFAULT_COLLECTION.ticker,
        trade: process.env.MONGODB_COLLECTION_TRADE || DEFAULT_COLLECTION.trade,
        user: process.env.MONGODB_COLLECTION_USER || DEFAULT_COLLECTION.user,
    },

    cacheExpirationTimes: {
        cmc: Number(process.env.CACHE_EXPIRATION_CMC) || DEFAULT_CACHE_EXPIRATION.cmc,
        balance: Number(process.env.CACHE_EXPIRATION_BALANCE) || DEFAULT_CACHE_EXPIRATION.balance,
        highestPrice: Number(process.env.CACHE_EXPIRATION_HIGHEST_PRICE) || DEFAULT_CACHE_EXPIRATION.highestPrice,
        timestamp: Number(process.env.CACHE_EXPIRATION_TIMESTAMP) || DEFAULT_CACHE_EXPIRATION.timestamp,
        market: Number(process.env.CACHE_EXPIRATION_MARKET) || DEFAULT_CACHE_EXPIRATION.market,
        order: Number(process.env.CACHE_EXPIRATION_ORDER) || DEFAULT_CACHE_EXPIRATION.order,
        machi: Number(process.env.CACHE_EXPIRATION_MACHI) || DEFAULT_CACHE_EXPIRATION.machi,
        strat: Number(process.env.CACHE_EXPIRATION_STRAT) || DEFAULT_CACHE_EXPIRATION.strat,
        swaps: Number(process.env.CACHE_EXPIRATION_SWAP) || DEFAULT_CACHE_EXPIRATION.swap,
        ticker: Number(process.env.CACHE_EXPIRATION_TICKER) || DEFAULT_CACHE_EXPIRATION.ticker,
        trade: Number(process.env.CACHE_EXPIRATION_TRADE) || DEFAULT_CACHE_EXPIRATION.trade,
        user: Number(process.env.CACHE_EXPIRATION_USER) || DEFAULT_CACHE_EXPIRATION.user
    },


    collectionCategory: {
        balance: process.env.COLLECTION_CATEGORY_BALANCE || DEFAULT_CATEGORY.balance,
        cmc: process.env.COLLECTION_CATEGORY_CMC || DEFAULT_CATEGORY.cmc,
        timestamp: process.env.COLLECTION_CATEGORY_TIMESTAMP || DEFAULT_CATEGORY.timestamp,
        market: process.env.COLLECTION_CATEGORY_MARKET || DEFAULT_CATEGORY.market,
        order: process.env.COLLECTION_CATEGORY_ORDER || DEFAULT_CATEGORY.order,
        machi: process.env.COLLECTION_CATEGORY_MACHI || DEFAULT_CATEGORY.machi,
        strat: process.env.COLLECTION_CATEGORY_STRAT || DEFAULT_CATEGORY.strat,
        ticker: process.env.COLLECTION_CATEGORY_TICKER || DEFAULT_CATEGORY.ticker,
        trade: process.env.COLLECTION_CATEGORY_TRADE || DEFAULT_CATEGORY.trade,
        userConfig: process.env.COLLECTION_CATEGORY_SERVER_CONFIG || DEFAULT_CATEGORY.serverConfig
    },

    apiKeys: {
        cmc: {
            apiKey: process.env.APIKEY_CMC || ''
        },
        platform: {
            binance: {
                apiKey: process.env.APIKEY_BINANCE || '',
                secretKey: process.env.SECRETKEY_BINANCE || ''
            },
            kucoin: {
                apiKey: process.env.APIKEY_KUCOIN || '',
                secretKey: process.env.SECRETKEY_KUCOIN || '',
                passphrase: process.env.PASSPHRASE_KUCOIN || ''
            },
            htx: {
                apiKey: process.env.APIKEY_HTX || '',
                secretKey: process.env.SECRETKEY_HTX || '',
            },
            okx: {
                apiKey: process.env.APIKEY_OKX || '',
                secretKey: process.env.SECRETKEY_OKX || '',
                passphrase: process.env.PASSPHRASE_OKX || ''
            },
            gateio: {
                apiKey: process.env.APIKEY_GATEIO || '',
                secretKey: process.env.SECRETKEY_GATEIO || '',
            },
        }
    },

    smtp: {
        host: process.env.SMTP_HOST || DEFAULT_SMTP.host,
        port: Number(process.env.SMTP_PORT) || DEFAULT_SMTP.port,
        auth: {
            user: process.env.SMTP_EMAIL || DEFAULT_SMTP.auth.user,
            receiver: process.env.SMTP_EMAIL_SEND || DEFAULT_SMTP.auth.receiver,
            pass: process.env.SMTP_PASSWORD || DEFAULT_SMTP.auth.pass
        }
    },

    cronSchedules: {
        machi: process.env.CRON_SCHEDULE_MACHI || DEFAULT_CRON_SCHEDULE.machi,
        market: process.env.CRON_SCHEDULE_MARKET || DEFAULT_CRON_SCHEDULE.market,
        ticker: process.env.CRON_SCHEDULE_TICKER || DEFAULT_CRON_SCHEDULE.ticker,
        balance: process.env.CRON_SCHEDULE_BALANCE || DEFAULT_CRON_SCHEDULE.balance,
        cmc: process.env.CRON_SCHEDULE_CMC || DEFAULT_CRON_SCHEDULE.cmc
    },

    logFiles: {
        error: process.env.LOG_FILE_ERROR || DEFAULT_LOG_FILES.error,
        info: process.env.LOG_FILE_INFO || DEFAULT_LOG_FILES.info
    },

    security: {
        hashRounds: DEFAULT_SECURITY.hashRounds
    }

};