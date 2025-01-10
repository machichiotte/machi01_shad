import { calculateBollingerBands } from '../../src/services/cryptoAnalytics/indicator/bollingerBands';

test('calculates Bollinger Bands', () => {
    const prices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const period = 5;
    const stdDevMultiplier = 2;

    const bands = calculateBollingerBands(prices, period, stdDevMultiplier);

    expect(bands.upperBand).toBeDefined();
    expect(bands.lowerBand).toBeDefined();
});
