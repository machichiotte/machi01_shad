import { calculateMovingAverageCross } from '../../src/services/cryptoAnalytics/indicator/movingAverageCross';

test('calculates buy and sell signals for moving average cross', () => {
    const prices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shortPeriod = 3;
    const longPeriod = 5;

    const signals = calculateMovingAverageCross(prices, shortPeriod, longPeriod);

    expect(signals.buySignals.length).toBeGreaterThan(0);
    expect(signals.sellSignals.length).toBe(0);
});
