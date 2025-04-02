// src/services/cryptoAnalytics/invest/tieredSell.ts

/**
 * Calculates amounts to sell based on a tiered selling strategy.
 * @param totalAmount - The total amount of crypto to sell.
 * @param tieredAmounts - An array of amounts to sell at each tier.
 * @returns An array of amounts to sell at each tier.
 */
export function calculateTieredSell(totalAmount: number, tieredAmounts: number[]): number[] {
    const sellAmounts: number[] = [];
    let remainingAmount = totalAmount;

    for (const amount of tieredAmounts) {
        if (remainingAmount <= 0) break;
        const amountToSell = Math.min(amount, remainingAmount);
        sellAmounts.push(amountToSell);
        remainingAmount -= amountToSell;
    }

    return sellAmounts;
}
