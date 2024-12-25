// src/js/constants.ts
export const BINANCE_PLATFORM_ID = 'binance';
export const BINANCE_THRESHOLD = 3; // 300%

export const HTX_PLATFORM_ID = 'htx';
export const HTX_THRESHOLD = 3; // 300%

export const performanceOptions = [24, 7, 30, 60, 90];

//export const STABLECOINS: string[] = ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'PAX', 'GUSD', 'HUSD', 'USDN'];
export const STABLECOINS: string[] = ['USDT', 'USDC', 'BUSD'];
export const MAJOR_CRYPTO_PAIRS: string[] = ['BTC', 'ETH'];
export const QUOTE_CURRENCIES: string[] = [...MAJOR_CRYPTO_PAIRS, ...STABLECOINS];
