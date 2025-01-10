/**
 * Calculates amounts to sell based on a threshold selling strategy.
 * @param totalAmount - The total amount of crypto to sell.
 * @param thresholdPrice - The price at which to sell.
 * @param currentPrice - The current price of the crypto.
 * @returns The amount to sell based on the threshold.
 */
export function calculateThresholdSell(totalAmount: number, thresholdPrice: number, currentPrice: number): number {
    if (currentPrice >= thresholdPrice) {
        return totalAmount; // Sell all if current price meets or exceeds threshold
    }
    return 0; // Do not sell if current price is below threshold
}
