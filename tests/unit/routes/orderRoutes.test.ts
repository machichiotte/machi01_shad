import express from 'express';
import request from 'supertest';
import orderRoutes from '../../../src/routes/routeOrder';
import * as orderBalanceController from '../../../src/ctrl/ctrlOrderBalance';
import * as orderMarketController from '../../../src/ctrl/ctrlOrderMarket';

// Mock des contrôleurs
jest.mock('../../../src/ctrl/orderBalanceController');
jest.mock('../../../src/ctrl/orderMarketController');

describe('orderRoutes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/order', orderRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /order/get', () => {
    it('devrait appeler getOrders et renvoyer 200', async () => {
      const mockGetOrders = orderBalanceController.getOrders as jest.MockedFunction<typeof orderBalanceController.getOrders>;
      mockGetOrders.mockImplementation(async (req, res) => {
        res.status(200).json({ message: 'Ordres récupérés' });
        return Promise.resolve();
      });

      const response = await request(app).get('/order/get');

      expect(response.status).toBe(200);
      expect(mockGetOrders).toHaveBeenCalled();
      expect(response.body).toEqual({ message: 'Ordres récupérés' });
    });
  });

  describe('GET /order/update/:platform', () => {
    it('devrait appeler updateOrders et renvoyer 200', async () => {
      const mockUpdateOrders = orderBalanceController.updateOrders as jest.MockedFunction<typeof orderBalanceController.updateOrders>;
      mockUpdateOrders.mockImplementation(async (req, res) => {
        res.status(200).json({ message: 'Ordres mis à jour', platform: req.params.platform });
        return Promise.resolve();
      });

      const response = await request(app).get('/order/update/testPlatform');

      expect(response.status).toBe(200);
      expect(mockUpdateOrders).toHaveBeenCalled();
      expect(response.body).toEqual({ message: 'Ordres mis à jour', platform: 'testPlatform' });
    });
  });

  describe('POST /order/cancel', () => {
    it('devrait appeler deleteOrder et renvoyer 200', async () => {
      const mockDeleteOrder = orderMarketController.deleteOrder as jest.MockedFunction<typeof orderMarketController.deleteOrder>;
      mockDeleteOrder.mockImplementation(async (req, res) => {
        res.status(200).json({ message: 'Ordre annulé' });
        return Promise.resolve();
      });

      const response = await request(app).post('/order/cancel').send({ orderId: '123' });

      expect(response.status).toBe(200);
      expect(mockDeleteOrder).toHaveBeenCalled();
      expect(response.body).toEqual({ message: 'Ordre annulé' });
    });
  });

  describe('POST /order/market-buy-order', () => {
    it('devrait appeler createMarketBuyOrder et renvoyer 200', async () => {
      const mockCreateMarketBuyOrder = orderMarketController.createMarketBuyOrder as jest.MockedFunction<typeof orderMarketController.createMarketBuyOrder>;
      mockCreateMarketBuyOrder.mockImplementation(async (req, res) => {
        res.status(200).json({ message: 'Ordre d\'achat au marché créé' });
        return Promise.resolve();
      });

      const response = await request(app).post('/order/market-buy-order').send({ symbol: 'BTC/USDT', amount: 0.1 });

      expect(response.status).toBe(200);
      expect(mockCreateMarketBuyOrder).toHaveBeenCalled();
      expect(response.body).toEqual({ message: 'Ordre d\'achat au marché créé' });
    });
  });

});
