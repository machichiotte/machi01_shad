// config/development.ts
import { EnvironmentConfig } from '@config/types';

export const config: EnvironmentConfig = {
    database: {
        dbName: 'myDevDatabase'
    },
    cacheExpirationTimes: {
        balances: 30000,
        cmc: 3600000,
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
