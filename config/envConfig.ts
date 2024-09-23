// config/envDev.ts
import { EnvironmentConfig } from '@config/types';
const DEFAULT_PORT = 10000;
const DEFAULT_CACHE_EXPIRATION = {
    cmc: 14400000,
    balances: 30000,
    highestPrices: 30000,
    lastUpdates: 30000,
    markets: 86400000,
    orders: 60000,
    shad: 60000,
    strats: 36000000,
    swaps: 86400000,
    tickers: 30000,
    trades: 30000,
    users: 0
};

export const envConfig: EnvironmentConfig = {
    port: Number(process.env.PORT) || DEFAULT_PORT,
    isOffline: process.env.OFFLINE_MODE === 'false',
    database: {
        user: process.env.MONGODB_USER || '',
        password: process.env.MONGODB_PASSWORD || '',
        cluster: process.env.MONGODB_CLUSTER || '',
        dbName: process.env.MONGODB_DATABASE || 'myDevDatabase'
    },

    collection: {
        balances: process.env.MONGODB_COLLECTION_BALANCE || '',
        cmc: process.env.MONGODB_COLLECTION_CMC || '',
        highestPrices: process.env.MONGODB_HIGHEST_PRICE || '',
        lastUpdates: process.env.MONGODB_COLLECTION_LAST_UPDATE || '',
        markets: process.env.MONGODB_COLLECTION_MARKETS || '',
        orders: process.env.MONGODB_COLLECTION_ORDERS || '',
        shad: process.env.MONGODB_COLLECTION_SHAD || '',
        strats: process.env.MONGODB_COLLECTION_STRAT || '',
        swaps: process.env.MONGODB_COLLECTION_SWAP || '',
        tickers: process.env.MONGODB_COLLECTION_TICKERS || '',
        trades: process.env.MONGODB_COLLECTION_TRADES || '',
        users: process.env.MONGODB_COLLECTION_USERS || ''
    },

    cacheExpirationTimes: {
        cmc: Number(process.env.CACHE_EXPIRATION_CMC) || DEFAULT_CACHE_EXPIRATION.cmc,
        balances: Number(process.env.CACHE_EXPIRATION_BALANCE) || DEFAULT_CACHE_EXPIRATION.balances,
        highestPrices: Number(process.env.CACHE_EXPIRATION_HIGHEST_PRICES) || DEFAULT_CACHE_EXPIRATION.highestPrices,
        lastUpdates: Number(process.env.CACHE_EXPIRATION_LAST_UPDATE) || DEFAULT_CACHE_EXPIRATION.lastUpdates,
        markets: Number(process.env.CACHE_EXPIRATION_MARKETS) || DEFAULT_CACHE_EXPIRATION.markets,
        orders: Number(process.env.CACHE_EXPIRATION_ORDERS) || DEFAULT_CACHE_EXPIRATION.orders,
        shad: Number(process.env.CACHE_EXPIRATION_SHAD) || DEFAULT_CACHE_EXPIRATION.shad,
        strats: Number(process.env.CACHE_EXPIRATION_STRAT) || DEFAULT_CACHE_EXPIRATION.strats,
        swaps: Number(process.env.CACHE_EXPIRATION_SWAP) || DEFAULT_CACHE_EXPIRATION.swaps,
        tickers: Number(process.env.CACHE_EXPIRATION_TICKERS) || DEFAULT_CACHE_EXPIRATION.tickers,
        trades: Number(process.env.CACHE_EXPIRATION_TRADES) || DEFAULT_CACHE_EXPIRATION.trades,
        users: Number(process.env.CACHE_EXPIRATION_USERS) || DEFAULT_CACHE_EXPIRATION.users
    },


    collectionType: {
        balances: process.env.TYPE_BALANCE || '',
        cmc: process.env.TYPE_CMC || '',
        lastUpdates: process.env.TYPE_LAST_UPDATE || '',
        markets: process.env.TYPE_MARKETS || '',
        orders: process.env.TYPE_ORDERS || '',
        shad: process.env.TYPE_SHAD || '',
        strats: process.env.TYPE_STRAT || '',
        tickers: process.env.TYPE_TICKERS || '',
        trades: process.env.TYPE_TRADES || '',
    },

    apiKeys: {
        cmc: {
            apiKey: process.env.CMC_APIKEY || ''
        },
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