import { getStrat } from "@src/ctrl/ctrlStrategy";
import { ServiceStrategy } from "@src/services/api/database/serviceStrategy";

describe('ctrlStrategy', () => {
    it('devrait récupérer les stratégies avec succès', async () => {
        const mockResponse = { status: 'success', message: 'Stratégies récupérées', data: [] };
        const mockRequest = {};
        const mockResponseObject = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        jest.spyOn(ServiceStrategy, 'fetchDatabaseStrategies').mockResolvedValue([]);

        await getStrat(mockRequest as Request, mockResponseObject as Response);

        expect(mockResponseObject.status).toHaveBeenCalledWith(200);
        expect(mockResponseObject.json).toHaveBeenCalledWith(mockResponse);
    });

    it('devrait gérer les erreurs correctement', async () => {
        const mockRequest = {};
        const mockResponseObject = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        const mockError = new Error('Erreur de récupération des stratégies');
        jest.spyOn(ServiceStrategy, 'fetchDatabaseStrategies').mockRejectedValue(mockError);

        await getStrat(mockRequest as Request, mockResponseObject as Response);

        expect(mockResponseObject.status).toHaveBeenCalledWith(500);
        expect(mockResponseObject.json).toHaveBeenCalledWith({ status: 'error', message: 'Erreur de récupération des stratégies' });
    });
});
