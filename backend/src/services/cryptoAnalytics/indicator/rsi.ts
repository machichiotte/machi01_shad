// src/services/cryptoAnalytics/indicator/rsi.ts

/**
 * Calculates the Relative Strength Index (RSI).
 * @param prices Array of historical prices.
 * @param period The number of periods to calculate the RSI.
 * @returns The RSI value.
 */
export function calculateRSI(prices: number[], period: number): number {
    if (prices.length < period) return 0;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i < period; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) gains += change;
        else losses -= change;
    }

    const averageGain = gains / period;
    const averageLoss = losses / period;
    const rs = averageLoss === 0 ? 0 : averageGain / averageLoss;

    return 100 - (100 / (1 + rs));
}
