import { getUniqueTimestamp } from "@src/ctrl/ctrlTimestamp";
import { RepoTimestamp } from "@src/repo/repoTimestamp";

describe('ctrlTimestamp', () => {
    it('devrait récupérer le timestamp unique avec succès', async () => {
        const mockResponse = { status: 'success', message: 'Dernière mise à jour unique récupérée', data: {} };
        const mockRequest = { params: { platform: 'somePlatform', type: 'someType' } };
        const mockResponseObject = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        jest.spyOn(RepoTimestamp, 'findTimestamp').mockResolvedValue({});

        await getUniqueTimestamp(mockRequest as Request, mockResponseObject as Response);

        expect(mockResponseObject.status).toHaveBeenCalledWith(200);
        expect(mockResponseObject.json).toHaveBeenCalledWith(mockResponse);
    });

    it('devrait gérer les erreurs correctement', async () => {
        const mockRequest = { params: { platform: 'somePlatform', type: 'someType' } };
        const mockResponseObject = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        const mockError = new Error('Erreur de récupération du timestamp');
        jest.spyOn(RepoTimestamp, 'findTimestamp').mockRejectedValue(mockError);

        await getUniqueTimestamp(mockRequest as Request, mockResponseObject as Response);

        expect(mockResponseObject.status).toHaveBeenCalledWith(500);
        expect(mockResponseObject.json).toHaveBeenCalledWith({ status: 'error', message: 'Erreur de récupération du timestamp' });
    });
});