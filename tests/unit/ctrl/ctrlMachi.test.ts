import { getMachi } from "@src/ctrl/ctrlMachi";
import { ServiceMachi } from "@src/services/api/platform/serviceMachi";

describe('ctrlMachi', () => {
    it('devrait récupérer les données Machi avec succès', async () => {
        const mockResponse = { status: 'success', message: 'Données Machi récupérées', data: [] };
        const mockRequest = {};
        const mockResponseObject = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        jest.spyOn(ServiceMachi, 'fetchMachiInDatabase').mockResolvedValue([]);

        await getMachi(mockRequest as Request, mockResponseObject as Response);

        expect(mockResponseObject.status).toHaveBeenCalledWith(200);
        expect(mockResponseObject.json).toHaveBeenCalledWith(mockResponse);
    });

    it('devrait gérer les erreurs correctement', async () => {
        const mockRequest = {};
        const mockResponseObject = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        const mockError = new Error('Erreur de récupération des données Machi');
        jest.spyOn(ServiceMachi, 'fetchMachiInDatabase').mockRejectedValue(mockError);

        await getMachi(mockRequest as Request, mockResponseObject as Response);

        expect(mockResponseObject.status).toHaveBeenCalledWith(500);
        expect(mockResponseObject.json).toHaveBeenCalledWith({ status: 'error', message: 'Erreur de récupération des données Machi' });
    });
});