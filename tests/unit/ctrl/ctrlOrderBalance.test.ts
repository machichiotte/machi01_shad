import { ServiceBalance } from '../../../src/services/api/platform/serviceBalance';
import { MappedBalance } from '@src/types/balance';
import { ObjectId } from 'mongodb';

describe('ctrlOrderBalance', () => {
    it('should return balance data with status 200 on success', async () => {
        const mockResponse: MappedBalance[] = [{
            _id: new ObjectId(),
            base: 'USD',
            balance: 1000,
            available: 500,
            platform: 'somePlatform'
        }];
        jest.spyOn(ServiceBalance, 'fetchDatabaseBalance').mockResolvedValue(mockResponse);
        const result = await ServiceBalance.fetchDatabaseBalance();
        expect(result).toEqual(mockResponse);
    });

    it('should handle error and call handleControllerError on failure', async () => {
        const mockError = new Error('Failed to fetch balance');
        jest.spyOn(ServiceBalance, 'fetchDatabaseBalance').mockRejectedValue(mockError);
        await expect(ServiceBalance.fetchDatabaseBalance()).rejects.toThrow('Failed to fetch balance');
    });
});
