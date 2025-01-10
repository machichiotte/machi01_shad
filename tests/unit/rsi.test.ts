import { calculateRSI } from '../../src/services/cryptoAnalytics/indicator/rsi';

test('calculates RSI value', () => {
    const prices = [1, 2, 1, 3, 2, 4, 3, 5, 4, 6]; // Fluctuating prices
    const period = 5;

    const rsiValue = calculateRSI(prices, period);

    expect(rsiValue).toBeGreaterThan(0);
    expect(rsiValue).toBeLessThan(100);
});
