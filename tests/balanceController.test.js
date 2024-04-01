// balanceController.test.js
const balanceController = require('../src/controllers/balanceController');

import { getData, createExchangeInstance, deleteAndSaveData, saveLastUpdateToMongoDB, handleErrorResponse } from '../src/services/utils.js';
import { mapBalance } from '../src/services/mapping.js';

// Import mocking tools
jest.mock('../src/services/utils.js');
jest.mock('../src/services/mapping.js');

test('getLastBalance should call getData with correct collection and default file', async () => {
    // Mock getData to return a mock result
    getData.mockResolvedValueOnce({ data: 'mocked data' });

    const req = {};
    const res = {};

    await balanceController.getLastBalance(req, res);

    expect(getData).toHaveBeenCalledWith(req, res, process.env.MONGODB_COLLECTION_BALANCE, 'db_machi_shad.collection_balance.json');
});

describe('updateCurrentBalance', () => {
    it('should call expected functions and return mapped data', async () => {
        // Mock dependencies
        const mockExchange = { fetchBalance: jest.fn().mockResolvedValue({ mockData: 'data' }) };
        createExchangeInstance.mockReturnValue(mockExchange);
        mapBalance.mockReturnValue({ mockMappedData: 'mappedData' });
        deleteAndSaveData.mockResolvedValueOnce();
        saveLastUpdateToMongoDB.mockResolvedValueOnce();

        const req = { params: { exchangeId: 'testExchange' } };

        // Create an empty object to simulate the response (res)
        const res = {
            status: jest.fn().mockReturnThis(), // Chain the status function
            json: jest.fn() // Create a spy for the json function of res
        };

        await balanceController.updateCurrentBalance(req, res);

        expect(createExchangeInstance).toHaveBeenCalledWith('testExchange');
        expect(mockExchange.fetchBalance).toHaveBeenCalled();
        expect(mapBalance).toHaveBeenCalledWith('testExchange', { mockData: 'data' });
        expect(deleteAndSaveData).toHaveBeenCalledWith({ mockMappedData: 'mappedData' }, process.env.MONGODB_COLLECTION_BALANCE, 'testExchange');

        // Use the spy for assertion
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ mockMappedData: 'mappedData' });
        expect(saveLastUpdateToMongoDB).toHaveBeenCalledWith(process.env.TYPE_BALANCE, 'testExchange');
    });


    // Add this test to check that fetchBalance handles errors correctly
    it('should handle error if fetchBalance fails', async () => {
        // Mock dependencies to simulate fetchBalance failure
        const mockExchange = { fetchBalance: jest.fn().mockRejectedValue(new Error('Fetch failed')) };
        createExchangeInstance.mockReturnValue(mockExchange);

        const req = { params: { exchangeId: 'testExchange' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await balanceController.updateCurrentBalance(req, res);

        // Ensure that handleErrorResponse is called with the correct error message
        expect(handleErrorResponse).toHaveBeenCalledWith(res, new Error('Fetch failed'), 'updateCurrentBalance');
    });

    // Add this test to check that mapBalance handles errors correctly
    it('should handle error if mapBalance fails', async () => {
        // Mock dependencies to simulate mapBalance failure
        const mockExchange = { fetchBalance: jest.fn().mockResolvedValue({ mockData: 'data' }) };
        createExchangeInstance.mockReturnValue(mockExchange);
        mapBalance.mockImplementation(() => {
            throw new Error('Mapping failed');
        });

        const req = { params: { exchangeId: 'testExchange' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await balanceController.updateCurrentBalance(req, res);

        // Ensure that handleErrorResponse is called with the correct error message
        expect(handleErrorResponse).toHaveBeenCalledWith(res, new Error('Mapping failed'), 'updateCurrentBalance');
    });

    // Add this test to check that deleteAndSaveData is called correctly on success
    it('should call deleteAndSaveData with correct parameters on success', async () => {
        // Mock dependencies to simulate successful update
        const mockExchange = { fetchBalance: jest.fn().mockResolvedValue({ mockData: 'data' }) };
        createExchangeInstance.mockReturnValue(mockExchange);
        mapBalance.mockReturnValue({ mockMappedData: 'mappedData' });
        deleteAndSaveData.mockResolvedValueOnce();

        const req = { params: { exchangeId: 'testExchange' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await balanceController.updateCurrentBalance(req, res);

        // Ensure that deleteAndSaveData is called with the correct parameters
        expect(deleteAndSaveData).toHaveBeenCalledWith({ mockMappedData: 'mappedData' }, process.env.MONGODB_COLLECTION_BALANCE, 'testExchange');
    });

    // Add this test to check that saveLastUpdateToMongoDB is called correctly on success
    it('should call saveLastUpdateToMongoDB with correct parameters on success', async () => {
        // Mock dependencies to simulate successful update
        const mockExchange = { fetchBalance: jest.fn().mockResolvedValue({ mockData: 'data' }) };
        createExchangeInstance.mockReturnValue(mockExchange);
        mapBalance.mockReturnValue({ mockMappedData: 'mappedData' });
        deleteAndSaveData.mockResolvedValueOnce();
        saveLastUpdateToMongoDB.mockResolvedValueOnce();

        const req = { params: { exchangeId: 'testExchange' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await balanceController.updateCurrentBalance(req, res);

        // Ensure that saveLastUpdateToMongoDB is called with the correct parameters
        expect(saveLastUpdateToMongoDB).toHaveBeenCalledWith(process.env.TYPE_BALANCE, 'testExchange');
    });
});