import { Request, Response } from 'express';
import { getCmc } from '../../../src/ctrl/ctrlCmc';
import { ServiceCmc } from '../../../src/services/api/serviceCmc';

describe('ctrlCmc', () => {
    it('devrait récupérer les données CMC avec succès', async () => {
        const mockResponse = { status: 'success', message: 'Données CMC récupérées avec succès', data: [] };
        const mockRequest = {};
        const mockResponseObject = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        jest.spyOn(ServiceCmc, 'fetchDatabaseCmc').mockResolvedValue([]);

        await getCmc(mockRequest as Request, mockResponseObject as Response);

        expect(mockResponseObject.status).toHaveBeenCalledWith(200);
        expect(mockResponseObject.json).toHaveBeenCalledWith(mockResponse);
    });

    it('devrait gérer les erreurs correctement', async () => {
        const mockRequest = {};
        const mockResponseObject = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        const mockError = new Error('Erreur de récupération des données CMC');
        jest.spyOn(ServiceCmc, 'fetchDatabaseCmc').mockRejectedValue(mockError);

        await getCmc(mockRequest as Request, mockResponseObject as Response);

        expect(mockResponseObject.status).toHaveBeenCalledWith(500);
        expect(mockResponseObject.json).toHaveBeenCalledWith({ status: 'error', message: 'Erreur de récupération des données CMC' });
    });
});
