import { ServiceOrderMarket } from "@src/services/api/platform/serviceOrderMarket";

describe('ctrlOrderMarket', () => {
    it('devrait gérer les commandes de marché avec succès', async () => {
        const mockResponse = { status: 'success', message: 'Commande de marché traitée avec succès' };
        const mockRequest = { body: { platform: 'somePlatform', base: 'USD', amount: 1, price: 30000 } };
        const mockResponseObject = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        jest.spyOn(ServiceOrderMarket, 'handleOrder').mockResolvedValue(mockResponse);

        await handleOrder(mockRequest as Request, mockResponseObject as Response, OrderType.MARKET_BUY);

        expect(mockResponseObject.status).toHaveBeenCalledWith(200);
        expect(mockResponseObject.json).toHaveBeenCalledWith(mockResponse);
    });

    it('devrait gérer les erreurs correctement', async () => {
        const mockRequest = { body: { platform: 'somePlatform', base: 'USD', amount: 1, price: 30000 } };
        const mockResponseObject = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        const mockError = new Error('Erreur de traitement de la commande de marché');
        jest.spyOn(ServiceOrderMarket, 'handleOrder').mockRejectedValue(mockError);

        await handleOrder(mockRequest as Request, mockResponseObject as Response, OrderType.MARKET_BUY);

        expect(mockResponseObject.status).toHaveBeenCalledWith(500);
        expect(mockResponseObject.json).toHaveBeenCalledWith({ status: 'error', message: 'Erreur de traitement de la commande de marché' });
    });
});