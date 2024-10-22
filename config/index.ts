// config/index.ts
import dotenv from 'dotenv';
import path from 'path';

import { DEFAULT_PORT, DEFAULT_CACHE_EXPIRATION } from './default';
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
    isOffline: process.env.OFFLINE_MODE === 'true',
    database: {
        user: process.env.MONGODB_USER || '',
        password: process.env.MONGODB_PASSWORD || '',
        cluster: process.env.MONGODB_CLUSTER || '',
        dbName: process.env.MONGODB_DATABASE || 'myDevDatabase'
    },

    collection: {
        balance: process.env.MONGODB_COLLECTION_BALANCE || '',
        cmc: process.env.MONGODB_COLLECTION_CMC || '',
        highestPrice: process.env.MONGODB_COLLECTION_HIGHEST_PRICE || '',
        timestamp: process.env.MONGODB_COLLECTION_TIMESTAMP || '',
        market: process.env.MONGODB_COLLECTION_MARKET || '',
        order: process.env.MONGODB_COLLECTION_ORDER || '',
        shad: process.env.MONGODB_COLLECTION_SHAD || '',
        strat: process.env.MONGODB_COLLECTION_STRAT || '',
        swap: process.env.MONGODB_COLLECTION_SWAP || '',
        ticker: process.env.MONGODB_COLLECTION_TICKER || '',
        trade: process.env.MONGODB_COLLECTION_TRADE || '',
        user: process.env.MONGODB_COLLECTION_USER || ''
    },

    cacheExpirationTimes: {
        cmc: Number(process.env.CACHE_EXPIRATION_CMC) || DEFAULT_CACHE_EXPIRATION.cmc,
        balance: Number(process.env.CACHE_EXPIRATION_BALANCE) || DEFAULT_CACHE_EXPIRATION.balance,
        highestPrice: Number(process.env.CACHE_EXPIRATION_HIGHEST_PRICE) || DEFAULT_CACHE_EXPIRATION.highestPrice,
        timestamp: Number(process.env.CACHE_EXPIRATION_TIMESTAMP) || DEFAULT_CACHE_EXPIRATION.timestamp,
        market: Number(process.env.CACHE_EXPIRATION_MARKET) || DEFAULT_CACHE_EXPIRATION.market,
        order: Number(process.env.CACHE_EXPIRATION_ORDER) || DEFAULT_CACHE_EXPIRATION.order,
        shad: Number(process.env.CACHE_EXPIRATION_SHAD) || DEFAULT_CACHE_EXPIRATION.shad,
        strat: Number(process.env.CACHE_EXPIRATION_STRAT) || DEFAULT_CACHE_EXPIRATION.strat,
        swaps: Number(process.env.CACHE_EXPIRATION_SWAP) || DEFAULT_CACHE_EXPIRATION.swap,
        ticker: Number(process.env.CACHE_EXPIRATION_TICKER) || DEFAULT_CACHE_EXPIRATION.ticker,
        trade: Number(process.env.CACHE_EXPIRATION_TRADE) || DEFAULT_CACHE_EXPIRATION.trade,
        user: Number(process.env.CACHE_EXPIRATION_USER) || DEFAULT_CACHE_EXPIRATION.user
    },


    collectionCategory: {
        balance: process.env.COLLECTION_CATEGORY_BALANCE || '',
        cmc: process.env.COLLECTION_CATEGORY_CMC || '',
        timestamp: process.env.COLLECTION_CATEGORY_TIMESTAMP || '',
        market: process.env.COLLECTION_CATEGORY_MARKET || '',
        order: process.env.COLLECTION_CATEGORY_ORDER || '',
        shad: process.env.COLLECTION_CATEGORY_SHAD || '',
        strat: process.env.COLLECTION_CATEGORY_STRAT || '',
        ticker: process.env.COLLECTION_CATEGORY_TICKER || '',
        trade: process.env.COLLECTION_CATEGORY_TRADE || '',
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
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
            user: process.env.SMTP_EMAIL || '',
            receiver: process.env.SMTP_EMAIL_SEND || '',
            pass: process.env.SMTP_PASSWORD || ''
        }
    },

    cronSchedules: {
        shad: process.env.CRON_SCHEDULE_SHAD || '*/30 * * * *',
        market: process.env.CRON_SCHEDULE_MARKET || '* */12 * * *',
        ticker: process.env.CRON_SCHEDULE_TICKER || '*/1 * * * *',
        balance: process.env.CRON_SCHEDULE_BALANCE || '*/2 * * * *',
        cmc: process.env.CRON_SCHEDULE_CMC || '0 0 * * *'
    },

    logFiles: {
        error: process.env.LOG_FILE_ERROR || 'error.log',
        info: process.env.LOG_FILE_INFO || 'info.log'
    },

    security: {
        hashRounds: Number(process.env.SECURITY_HASHROUNDS) || 10
    }

};