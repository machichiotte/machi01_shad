import { Request, Response } from 'express';
import { createLimitBuyOrder, createMarketSellOrder, cancelAllOrders, deleteOrder } from '../../../src/controllers/orderMarketController';
import { OrderMarketService } from '../../../src/services/orderMarketService';
import { handleControllerError } from '../../../src/utils/errorUtil';

jest.mock('../../../src/services/orderMarketService');
jest.mock('../../../src/utils/errorUtil');

describe('orderMarketController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockJson: jest.Mock;

    beforeEach(() => {
        mockJson = jest.fn();
        mockRequest = {
            body: {
                platform: 'binance',
                asset: 'BTC',
                amount: '1',
                price: '50000',
                oId: '123',
                symbol: 'BTCUSDT'
            }
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: mockJson
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createLimitBuyOrder', () => {
        it('should create a limit buy order successfully', async () => {
            (OrderMarketService.createLimitOrder as jest.Mock).mockResolvedValue({ orderId: '123' });

            await createLimitBuyOrder(mockRequest as Request, mockResponse as Response);

            expect(OrderMarketService.createLimitOrder).toHaveBeenCalledWith('binance', 'BTC', '1', 'buy', '50000');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                message: "Ordre limit d'achat créé",
                data: { orderId: '123' }
            });
        });
    });

    describe('createMarketSellOrder', () => {
        it('should create a market sell order successfully', async () => {
            (OrderMarketService.createMarketOrder as jest.Mock).mockResolvedValue({ orderId: '456' });

            await createMarketSellOrder(mockRequest as Request, mockResponse as Response);

            expect(OrderMarketService.createMarketOrder).toHaveBeenCalledWith('binance', 'BTC', '1', 'sell');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Ordre au marché créé',
                data: { orderId: '456' }
            });
        });
    });

    describe('cancelAllOrders', () => {
        it('should cancel all orders successfully', async () => {
            (OrderMarketService.cancelAllOrdersByBunch as jest.Mock).mockResolvedValue({ cancelledOrders: 5 });

            await cancelAllOrders(mockRequest as Request, mockResponse as Response);

            expect(OrderMarketService.cancelAllOrdersByBunch).toHaveBeenCalledWith('binance', 'BTC');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Tous les ordres annulés pour BTC sur binance',
                data: { cancelledOrders: 5 }
            });
        });
    });

    describe('deleteOrder', () => {
        it('should delete an order successfully', async () => {
            (OrderMarketService.deleteOrder as jest.Mock).mockResolvedValue(undefined);

            await deleteOrder(mockRequest as Request, mockResponse as Response);

            expect(OrderMarketService.deleteOrder).toHaveBeenCalledWith('binance', '123', 'BTCUSDT');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Ordre supprimé',
                data: undefined
            });
        });
    });

    describe('Error handling', () => {
        it('should handle errors correctly', async () => {
            const error = new Error('Test error');
            (OrderMarketService.createLimitOrder as jest.Mock).mockRejectedValue(error);

            await createLimitBuyOrder(mockRequest as Request, mockResponse as Response);

            expect(handleControllerError).toHaveBeenCalledWith(mockResponse, error, 'handleOrder (limitBuy)');
        });
    });
});