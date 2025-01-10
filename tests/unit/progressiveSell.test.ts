import { calculateProgressiveSell } from '../src/services/cryptoAnalytics/invest/progressiveSell';

describe('calculateProgressiveSell', () => {
    it('should return correct amounts to sell based on percentage', () => {
        const totalAmount = 1000;
        const sellPercentage = 20;
        const steps = 5;
        const expectedAmounts = [200, 200, 200, 200, 200];

        const result = calculateProgressiveSell(totalAmount, sellPercentage, steps);
        expect(result).toEqual(expectedAmounts);
    });
});
