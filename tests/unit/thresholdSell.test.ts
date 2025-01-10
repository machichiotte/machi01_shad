import { calculateThresholdSell } from '../../src/services/cryptoAnalytics/invest/thresholdSell';

describe('calculateThresholdSell', () => {
    it('should return total amount if current price meets or exceeds threshold', () => {
        const totalAmount = 1000;
        const thresholdPrice = 150;
        const currentPrice = 160;

        const result = calculateThresholdSell(totalAmount, thresholdPrice, currentPrice);
        expect(result).toEqual(totalAmount);
    });

    it('should return 0 if current price is below threshold', () => {
        const totalAmount = 1000;
        const thresholdPrice = 150;
        const currentPrice = 140;

        const result = calculateThresholdSell(totalAmount, thresholdPrice, currentPrice);
        expect(result).toEqual(0);
    });
});
