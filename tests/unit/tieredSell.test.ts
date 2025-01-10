import { calculateTieredSell } from '../../src/services/cryptoAnalytics/invest/tieredSell';

describe('calculateTieredSell', () => {
    it('should return correct amounts to sell based on tiered amounts', () => {
        const totalAmount = 1000;
        const tieredAmounts = [300, 200, 500];
        const expectedAmounts = [300, 200, 500];

        const result = calculateTieredSell(totalAmount, tieredAmounts);
        expect(result).toEqual(expectedAmounts);
    });
});
