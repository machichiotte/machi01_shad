// src/services/cryptoAnalytics/indicator/movingAverageCross.ts

/**
 * Calculates the moving average cross strategy signals.
 * @param prices Array of historical prices.
 * @param shortPeriod Short moving average period.
 * @param longPeriod Long moving average period.
 * @returns Object containing buy and sell signals.
 */
export function calculateMovingAverageCross(prices: number[], shortPeriod: number, longPeriod: number): { buySignals: number[], sellSignals: number[] } {
    const shortMA = prices.slice(-shortPeriod).reduce((a, b) => a + b, 0) / shortPeriod;
    const longMA = prices.slice(-longPeriod).reduce((a, b) => a + b, 0) / longPeriod;

    const buySignals: number[] = [];
    const sellSignals: number[] = [];

    if (shortMA > longMA) {
        buySignals.push(prices.length - 1); // index of the last price
    } else if (shortMA < longMA) {
        sellSignals.push(prices.length - 1); // index of the last price
    }

    return { buySignals, sellSignals };
}
