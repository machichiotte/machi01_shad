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
    isOffline: process.env.OFFLINE_MODE === 'false',
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
        timestamp: process.env.MONGODB_COLLECTION_LAST_UPDATE || '',
        market: process.env.MONGODB_COLLECTION_MARKETS || '',
        order: process.env.MONGODB_COLLECTION_ORDERS || '',
        shad: process.env.MONGODB_COLLECTION_SHAD || '',
        strat: process.env.MONGODB_COLLECTION_STRAT || '',
        swap: process.env.MONGODB_COLLECTION_SWAP || '',
        ticker: process.env.MONGODB_COLLECTION_TICKERS || '',
        trade: process.env.MONGODB_COLLECTION_TRADES || '',
        user: process.env.MONGODB_COLLECTION_USERS || ''
    },

    cacheExpirationTimes: {
        cmc: Number(process.env.CACHE_EXPIRATION_CMC) || DEFAULT_CACHE_EXPIRATION.cmc,
        balance: Number(process.env.CACHE_EXPIRATION_BALANCE) || DEFAULT_CACHE_EXPIRATION.balances,
        highestPrice: Number(process.env.CACHE_EXPIRATION_HIGHEST_PRICES) || DEFAULT_CACHE_EXPIRATION.highestPrices,
        timestamp: Number(process.env.CACHE_EXPIRATION_LAST_UPDATE) || DEFAULT_CACHE_EXPIRATION.timestamps,
        market: Number(process.env.CACHE_EXPIRATION_MARKETS) || DEFAULT_CACHE_EXPIRATION.markets,
        order: Number(process.env.CACHE_EXPIRATION_ORDERS) || DEFAULT_CACHE_EXPIRATION.orders,
        shad: Number(process.env.CACHE_EXPIRATION_SHAD) || DEFAULT_CACHE_EXPIRATION.shad,
        strat: Number(process.env.CACHE_EXPIRATION_STRAT) || DEFAULT_CACHE_EXPIRATION.strats,
        swaps: Number(process.env.CACHE_EXPIRATION_SWAP) || DEFAULT_CACHE_EXPIRATION.swaps,
        ticker: Number(process.env.CACHE_EXPIRATION_TICKERS) || DEFAULT_CACHE_EXPIRATION.tickers,
        trade: Number(process.env.CACHE_EXPIRATION_TRADES) || DEFAULT_CACHE_EXPIRATION.trades,
        user: Number(process.env.CACHE_EXPIRATION_USERS) || DEFAULT_CACHE_EXPIRATION.users
    },


    collectionType: {
        balance: process.env.TYPE_BALANCE || '',
        cmc: process.env.TYPE_CMC || '',
        timestamp: process.env.TYPE_LAST_UPDATE || '',
        market: process.env.TYPE_MARKETS || '',
        order: process.env.TYPE_ORDERS || '',
        shad: process.env.TYPE_SHAD || '',
        strat: process.env.TYPE_STRAT || '',
        ticker: process.env.TYPE_TICKERS || '',
        trade: process.env.TYPE_TRADES || '',
    },

    apiKeys: {
        cmc: {
            apiKey: process.env.CMC_APIKEY || ''
        },
        platform: {
            binance: {
                apiKey: process.env.BINANCE_API_KEY || '',
                secretKey: process.env.BINANCE_SECRET_KEY || ''
            },
            kucoin: {
                apiKey: process.env.KUCOIN_API_KEY || '',
                secretKey: process.env.KUCOIN_SECRET_KEY || '',
                passphrase: process.env.KUCOIN_PASSPHRASE || ''
            },
            htx: {
                apiKey: process.env.HTX_API_KEY || '',
                secretKey: process.env.HTX_SECRET_KEY || '',
            },
            okx: {
                apiKey: process.env.OKX_API_KEY || '',
                secretKey: process.env.OKX_SECRET_KEY || '',
                passphrase: process.env.OKX_PASSPHRASE || ''
            },
            gateio: {
                apiKey: process.env.GATEIO_API_KEY || '',
                secretKey: process.env.GATEIO_SECRET_KEY || '',
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
        markets: process.env.CRON_SCHEDULE_MARKETS || '* */12 * * *',
        tickers: process.env.CRON_SCHEDULE_TICKERS || '*/1 * * * *',
        balances: process.env.CRON_SCHEDULE_BALANCES || '*/2 * * * *'
    },

    logFiles: {
        error: process.env.LOG_FILE_ERROR || 'error.log',
        info: process.env.LOG_FILE_INFO || 'info.log'
    },

    security: {
        hashRounds: Number(process.env.SECURITY_HASHROUNDS) || 10
    }

};