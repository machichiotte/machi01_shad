// src/types/metrics.ts
export interface AssetMetrics {
    iconUrl: string;
    base: string;
    status: number[] | string;
    strat: string;
    ratioShad: string | number;
    totalShad: string | number;
    rank: string | number;
    averageEntryPrice: string | number;
    totalBuy: string | number;
    maxExposition: string | number;
    percentageDifference: string | number | undefined;
    currentPrice: string | number | undefined;
    currentPossession: string | number;
    profit: string | number;
    totalSell: string | number;
    recupShad: string | number;
    nbOpenBuyOrders: string | number;
    nbOpenSellOrders: string | number;
    totalAmount: string | number;
    balance: string | number;
    recupTp1: string | number;
    recupTpX: string | number;
    tp1: string | number;
    tp2: string | number;
    tp3: string | number;
    tp4: string | number;
    tp5: string | number;
    percentToNextTp: string | number | undefined;
    platform: string;
}