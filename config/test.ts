// config/test.ts
import { EnvironmentConfig } from '@config/types';

export const config: EnvironmentConfig = {
    database: {
        dbName: 'myTestDatabase'
    },
    cacheExpirationTimes: {
        balances: 60000,
        cmc: 86400000,
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
    }
};
