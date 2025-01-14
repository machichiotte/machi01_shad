import { Request, Response } from 'express';
import { getTrades } from '../../../src/ctrl/ctrlTrade';
import { ServiceTrade } from '../../../src/services/api/platform/serviceTrade';

describe('ctrlTrade', () => {
    it('devrait récupérer tous les trades avec succès', async () => {
        const mockResponse = { status: 'success', message: 'Trades récupérés', data: [] };
        const mockRequest = {};
        const mockResponseObject = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        jest.spyOn(ServiceTrade, 'fetchFromDb').mockResolvedValue([]);

        await getTrades(mockRequest as Request, mockResponseObject as Response);

        expect(mockResponseObject.status).toHaveBeenCalledWith(200);
        expect(mockResponseObject.json).toHaveBeenCalledWith(mockResponse);
    });

    it('devrait gérer les erreurs correctement', async () => {
        const mockRequest = {};
        const mockResponseObject = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        const mockError = new Error('Erreur de récupération des trades');
        jest.spyOn(ServiceTrade, 'fetchFromDb').mockRejectedValue(mockError);

        await getTrades(mockRequest as Request, mockResponseObject as Response);

        expect(mockResponseObject.status).toHaveBeenCalledWith(500);
        expect(mockResponseObject.json).toHaveBeenCalledWith({ status: 'error', message: 'Erreur de récupération des trades' });
    });
});