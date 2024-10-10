// src/types/platform.ts
export const PLATFORMS = [
    'binance', 'kucoin', 'htx', 'okx', 'gateio'
] as const

export type PLATFORM = typeof PLATFORMS[number];