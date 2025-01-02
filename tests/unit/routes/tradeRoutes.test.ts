import express from 'express';
import request from 'supertest';
import tradeRoutes from '../../../src/routes/routeTrade';
import * as tradeController from '../../../src/ctrl/ctrlTrade';

// Mock du contrôleur Trade
jest.mock('../../../src/ctrl/tradeController');

describe('tradeRoutes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use('/trade', tradeRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /trade/get', () => {
    it('devrait appeler getTrades et renvoyer 200', async () => {
      const mockGetTrades = tradeController.getTrades as jest.MockedFunction<typeof tradeController.getTrades>;
      mockGetTrades.mockImplementation(async (req, res) => {
        res.status(200).json({ message: 'Trades récupérés' });
        return Promise.resolve();
      });

      const response = await request(app).get('/trade/get');

      expect(response.status).toBe(200);
      expect(mockGetTrades).toHaveBeenCalled();
      expect(response.body).toEqual({ message: 'Trades récupérés' });
    });
  });

  describe('POST /trade/add', () => {
    it('devrait appeler addTradesManually et renvoyer 200', async () => {

    });
  });

  describe('GET /trade/update/:platform', () => {
    it('devrait appeler updateTrades et renvoyer 200', async () => {

    });
  });
});
