// config/defaults.ts
export const DEFAULT_PORT = 10000;
export const DEFAULT_OFFLINE_MODE = false;

export const DEFAULT_CACHE_EXPIRATION = {
    cmc: 14400000,
    balance: 30000,
    highestPrice: 30000,
    timestamp: 30000,
    market: 86400000,
    order: 60000,
    machi: 60000,
    strat: 36000000,
    swap: 86400000,
    ticker: 30000,
    trade: 30000,
    user: 0
};

export const DEFAULT_COLLECTION =
{
    cmc: 'collection_cmc',
    balance: 'collection_balance',
    highestPrice: 'collection_highest_price',
    timestamp: 'collection_timestamp',
    market: 'collection_market',
    order: 'collection_order',
    machi: 'collection_machi',
    strat: 'collection_strategy',
    swap: 'collection_swap',
    ticker: 'collection_ticker',
    trade: 'collection_trade',
    user: 'collection_user',
    serverConfig: 'collection_serverconfig',
}

export const DEFAULT_CATEGORY =
{
    cmc: 'cmc',
    balance: 'balance',
    highestPrice: 'highestPrice',
    timestamp: 'timestamp',
    market: 'market',
    order: 'order',
    machi: 'machi',
    strat: 'strat',
    swap: 'swap',
    ticker: 'ticker',
    trade: 'trade',
    user: 'user',
    serverConfig: 'serverConfig',
}

export const DEFAULT_MONGODB = {
    user: '',
    password: '',
    cluster: '',
    database: '',
}

export const DEFAULT_SMTP = {
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'sender@email.com',
        receiver: 'receiver@email.com',
        pass: 'abc123'
    },
}

export const DEFAULT_CRON_SCHEDULE = {
    machi: '*/30 * * * *',
    market: '* 23 * * *',
    ticker: '*/1 * * * *',
    balance: '*/2 * * * *',
    cmc: '0 23 * * *'
}

export const DEFAULT_LOG_FILES = {
    error: 'error.log',
    info: 'info.log'
},

export const DEFAULT_SECURITY = {
    hashRounds: 10
}