// src/services/cryptoAnalytics/indicator/bollingerBands.ts

/**
 * Calculates the Bollinger Bands.
 * @param prices Array of historical prices.
 * @param period The number of periods to calculate the bands.
 * @param stdDevMultiplier The multiplier for the standard deviation.
 * @returns Object containing upper and lower bands.
 */
export function calculateBollingerBands(prices: number[], period: number, stdDevMultiplier: number): { upperBand: number, lowerBand: number } {
    if (prices.length < period) return { upperBand: 0, lowerBand: 0 };

    const average = prices.slice(-period).reduce((a, b) => a + b, 0) / period;
    const variance = prices.slice(-period).reduce((a, b) => a + Math.pow(b - average, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    const upperBand = average + (stdDev * stdDevMultiplier);
    const lowerBand = average - (stdDev * stdDevMultiplier);

    return { upperBand, lowerBand };
}
