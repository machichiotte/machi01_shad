// src/js/strat/common.ts
import { Asset, TakeProfits } from "../../types/responseData";
import { getShadTakeProfitsTargets } from "./shad";

// Calculate the price threshold based on the current price and a given threshold.
export const getPriceThreshold = (currentPrice: number, threshold: number): number => currentPrice * threshold;

// Determine the strategy factor based on the given strategy
export function determineStrategyFactor(strat: string): number | string {
    if (strat !== undefined) {
        switch (strat) {
            case 'shad':
                return 2;
            case 'shad skip x2':
                return 4;
            case 'strategy 3':
                return 8;
            case 'strategy 4':
                return 16;
            default:
                return '8'; // Default value for unrecognized strategies
        }
    }
    return '/'; // Default value if strategy is undefined
}

// Calculates the recovery gap based on total purchases, sales, and maximum exposure.
export function calculateRecoveryGap(totalBuy: number, totalSell: number, maxExposition: number): number {
    if (totalSell > 0) {
        if (maxExposition < totalBuy && totalSell < totalBuy - maxExposition) {
            return 0;
        } else {
            return Math.round(totalSell - (totalBuy - maxExposition));
        }
    }
    return 0;
}

// Generic function to update a specific field of an item in a list and recalculate related values.
export function updateBaseField(items: Array<any>, data: any, field: string, newValue: any): void {
    if (!Array.isArray(items)) {
        console.warn('Invalid items reference or items is not an array:', items)
        return
    }

    const rowIndex = items.findIndex((item: any) => item.base === data.base)
    if (rowIndex === -1) {
        console.warn('Item not found in the list:', data.base)
        return
    }

    const item = { ...items[rowIndex], [field]: newValue }
    const calculatedItem = getTakeProfitsTargets(item)
    Object.assign(item, calculatedItem)
    items[rowIndex] = item
}

// Sets the maximum exposure for a given base and updates related values.
export const setMaxExposure = (items: Array<any>, data: any, maxExposition: number | string): void => {
    if (isNaN(maxExposition as number) || maxExposition as number < 0) {
        console.warn('Invalid maxExposition value:', maxExposition)
        return
    }
    updateBaseField(items, data, 'maxExposition', maxExposition)
}

export function getTakeProfitsTargets(data: Asset): TakeProfits {
    //TODO ajouter pleins de strategies 
    return getShadTakeProfitsTargets(data)
}