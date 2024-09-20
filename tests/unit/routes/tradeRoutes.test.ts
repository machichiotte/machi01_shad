import express from 'express';
import request from 'supertest';
import tradeRoutes from '@routes/tradeRoutes';
import * as tradeController from '@controllers/tradeController';

// Mock du contrôleur Trade
jest.mock('@controllers/tradeController');

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
      const mockAddTradesManually = tradeController.addTradesManually as jest.MockedFunction<typeof tradeController.addTradesManually>;
      mockAddTradesManually.mockImplementation(async (req, res) => {
        res.status(200).json({ message: 'Trades ajoutés manuellement' });
        return Promise.resolve();
      });

      const response = await request(app)
        .post('/trade/add')
        .send({ tradeData: 'someData' });

      expect(response.status).toBe(200);
      expect(mockAddTradesManually).toHaveBeenCalled();
      expect(response.body).toEqual({ message: 'Trades ajoutés manuellement' });
    });
  });

  describe('GET /trade/update/:platform', () => {
    it('devrait appeler updateTrades et renvoyer 200', async () => {
      const mockUpdateTrades = tradeController.updateTrades as jest.MockedFunction<typeof tradeController.updateTrades>;
      mockUpdateTrades.mockImplementation(async (req, res) => {
        res.status(200).json({ message: 'Trades mis à jour', platform: req.params.platform });
        return Promise.resolve();
      });

      const response = await request(app).get('/trade/update/testPlatform');

      expect(response.status).toBe(200);
      expect(mockUpdateTrades).toHaveBeenCalled();
      expect(response.body).toEqual({ message: 'Trades mis à jour', platform: 'testPlatform' });
    });
  });
});
