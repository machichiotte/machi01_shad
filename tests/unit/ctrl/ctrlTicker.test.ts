import { Request, Response } from 'express';
import { getAllTickers } from '../../../src/ctrl/ctrlTicker';
import { ServiceTicker } from '../../../src/services/api/platform/serviceTicker';

describe('ctrlTicker', () => {
    it('devrait récupérer tous les tickers avec succès', async () => {
        const mockResponse = { status: 'success', message: 'Tickers récupérés', data: [] };
        const mockRequest = {};
        const mockResponseObject = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        jest.spyOn(ServiceTicker, 'fetchDatabaseTickers').mockResolvedValue([]);

        await getAllTickers(mockRequest as Request, mockResponseObject as Response);

        expect(mockResponseObject.status).toHaveBeenCalledWith(200);
        expect(mockResponseObject.json).toHaveBeenCalledWith(mockResponse);
    });

    it('devrait gérer les erreurs correctement', async () => {
        const mockRequest = {};
        const mockResponseObject = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        const mockError = new Error('Erreur de récupération des tickers');
        jest.spyOn(ServiceTicker, 'fetchDatabaseTickers').mockRejectedValue(mockError);

        await getAllTickers(mockRequest as Request, mockResponseObject as Response);

        expect(mockResponseObject.status).toHaveBeenCalledWith(500);
        expect(mockResponseObject.json).toHaveBeenCalledWith({ status: 'error', message: 'Erreur de récupération des tickers' });
    });
});