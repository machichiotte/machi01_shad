console.log('Configuration mockée chargée');
import { EnvironmentConfig } from '../config/types';
const mockConfig: EnvironmentConfig = {
    port: 10000,
    isOffline: true,
    database: {
        user: 'testUser',
        password: 'testPassword',
        cluster: 'testCluster',
        dbName: 'testDatabase'
    },
    collection: {
        balances: 'test_balances',
        cmc: 'test_cmc',
        highestPrices: 'test_highest_prices',
        lastUpdates: 'test_last_updates',
        markets: 'test_markets',
        orders: 'test_orders',
        shad: 'test_shad',
        strats: 'test_strats',
        swaps: 'test_swaps',
        tickers: 'test_tickers',
        trades: 'test_trades',
        users: 'test_users'
    },
    cacheExpirationTimes: {
        cmc: 60000,
        balances: 60000,
        highestPrices: 60000,
        lastUpdates: 60000,
        markets: 60000,
        orders: 60000,
        shad: 60000,
        strats: 60000,
        swaps: 60000,
        tickers: 60000,
        trades: 60000,
        users: 60000
    },
    collectionType: {
        balances: 'test_balance_type',
        cmc: 'test_cmc_type',
        lastUpdates: 'test_last_update_type',
        markets: 'test_markets_type',
        orders: 'test_orders_type',
        shad: 'test_shad_type',
        strats: 'test_strat_type',
        tickers: 'test_tickers_type',
        trades: 'test_trades_type',
    },
    apiKeys: {
        cmc: {
            apiKey: 'test_cmc_key'
        },
        binance: {
            apiKey: 'test_binance_key',
            secretKey: 'test_binance_secret'
        },
        kucoin: {
            apiKey: 'test_kucoin_key',
            secretKey: 'test_kucoin_secret',
            passphrase: 'test_kucoin_pass'
        },
        htx: {
            apiKey: 'test_htx_key',
            secretKey: 'test_htx_secret',
        },
        okx: {
            apiKey: 'test_okx_key',
            secretKey: 'test_okx_secret',
            passphrase: 'test_okx_pass'
        },
        gateio: {
            apiKey: 'test_gateio_key',
            secretKey: 'test_gateio_secret',
        },
    },
    smtp: {
        host: 'smtp.test.email',
        port: 587,
        auth: {
            user: 'test_smtp_user',
            receiver: 'test_smtp_receiver',
            pass: 'test_smtp_pass'
        }
    },
    cronSchedules: {
        shad: '*/5 * * * *',
        markets: '*/10 * * * *',
        tickers: '*/1 * * * *',
        balances: '*/2 * * * *'
    },
    logFiles: {
        error: 'test_error.log',
        info: 'test_info.log'
    },
    security: {
        hashRounds: 10
    }
};

export default mockConfig;