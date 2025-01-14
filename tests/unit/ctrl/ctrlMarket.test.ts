import { MappedMarket } from '@src/types/market';
import { ServiceMarket } from '../../../src/services/api/platform/serviceMarket';

describe('ctrlMarket', () => {
    it('should return market data successfully', async () => {
        const mockMarketData: Omit<MappedMarket, '_id'>[] = [{
            symbol: 'BTC',
            base: 'USD',
            quote: 'BTC/USD',
            active: true,
            type: 'spot',
            amountMin: 0.01,
            amountMax: 100,
            priceMin: 30000,
            priceMax: 60000,
            platform: 'somePlatform'
        }];
        jest.spyOn(ServiceMarket, 'fetchCurrentMarkets').mockResolvedValue(mockMarketData);
        const result = await ServiceMarket.fetchCurrentMarkets('somePlatform');
        expect(result).toEqual(mockMarketData);
    });

    it('should handle errors correctly', async () => {
        const mockError = new Error('Failed to fetch market data');
        jest.spyOn(ServiceMarket, 'fetchCurrentMarkets').mockRejectedValue(mockError);
        await expect(ServiceMarket.fetchCurrentMarkets('somePlatform')).rejects.toThrow('Failed to fetch market data');
    });
});