// config/types.ts
export interface EnvironmentConfig {
    port: number;
    isOffline: boolean
    database: {
        user: string;
        password: string;
        cluster: string;
        dbName: string;
    };
    collection: {
        [key: string]: string;
    };
    cacheExpirationTimes: {
        [key: string]: number;
    };
    collectionType: {
        [key: string]: string;
    };
    apiKeys: {
        [platform: string]: {
            apiKey: string;
            secretKey?: string;
            passphrase?: string;
        }
    };
    smtp: {
        host: string;
        port: number;
        auth: {
            user: string | undefined;
            receiver: string | undefined;
            pass: string | undefined;
        }
    };
    cronSchedules: {
        shad: string;
        markets: string;
        tickers: string;
        balances: string;
    };
    logFiles: {
        error: string;
        info: string;
    };
    security: {
        hashRounds: number
    }
}