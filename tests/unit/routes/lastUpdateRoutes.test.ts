import express from 'express';
import request from 'supertest';
import lastUpdateRoutes from '@routes/lastUpdateRoutes';
import * as lastUpdateController from '@controllers/lastUpdateController';

// Mock du contrôleur LastUpdate
jest.mock('@controllers/lastUpdateController');

describe('LastUpdate Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use('/lastUpdate', lastUpdateRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /lastUpdate/get', () => {
    it('devrait appeler getLastUpdate et renvoyer 200', async () => {
      const mockGetLastUpdate = lastUpdateController.getLastUpdate as jest.MockedFunction<typeof lastUpdateController.getLastUpdate>;
      mockGetLastUpdate.mockImplementation(async (req, res) => {
        res.status(200).json({ message: 'Dernière mise à jour récupérée' });
        return Promise.resolve();
      });

      const response = await request(app).get('/lastUpdate/get');

      expect(response.status).toBe(200);
      expect(mockGetLastUpdate).toHaveBeenCalled();
      expect(response.body).toEqual({ message: 'Dernière mise à jour récupérée' });
    });
  });

  describe('GET /lastUpdate/get/:type/:platform', () => {
    it('devrait appeler getUniqueLastUpdate et renvoyer 200', async () => {
      const mockGetUniqueLastUpdate = lastUpdateController.getUniqueLastUpdate as jest.MockedFunction<typeof lastUpdateController.getUniqueLastUpdate>;
      mockGetUniqueLastUpdate.mockImplementation(async (req, res) => {
        res.status(200).json({ message: 'Dernière mise à jour unique récupérée', type: req.params.type, platform: req.params.platform });
        return Promise.resolve();
      });

      const response = await request(app).get('/lastUpdate/get/testType/testPlatform');

      expect(response.status).toBe(200);
      expect(mockGetUniqueLastUpdate).toHaveBeenCalled();
      expect(response.body).toEqual({ message: 'Dernière mise à jour unique récupérée', type: 'testType', platform: 'testPlatform' });
    });
  });

  describe('GET /lastUpdate/update/:type', () => {
    it('devrait appeler updateLastUpdateByType et renvoyer 200', async () => {
      const mockUpdateLastUpdateByType = lastUpdateController.updateLastUpdateByType as jest.MockedFunction<typeof lastUpdateController.updateLastUpdateByType>;
      mockUpdateLastUpdateByType.mockImplementation(async (req, res) => {
        res.status(200).json({ message: 'Dernière mise à jour modifiée', type: req.params.type });
        return Promise.resolve();
      });

      const response = await request(app).get('/lastUpdate/update/testType');

      expect(response.status).toBe(200);
      expect(mockUpdateLastUpdateByType).toHaveBeenCalled();
      expect(response.body).toEqual({ message: 'Dernière mise à jour modifiée', type: 'testType' });
    });
  });
});
