import express from 'express';
import request from 'supertest';
import routeTimestamp from '../../../src/routes/routeTimestamp';
import * as timestampController from '../../../src/ctrl/ctrlTimestamp';

// Mock du contrôleur Timestamp
jest.mock('../../../src/ctrl/ctrlTimestamp');

describe('routeTimestamp', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use('/timestamp', routeTimestamp);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /timestamp/get', () => {
    it('devrait appeler getTimestamp et renvoyer 200', async () => {
      const mockGetTimestamp = timestampController.getTimestamp as jest.MockedFunction<typeof timestampController.getTimestamp>;
      mockGetTimestamp.mockImplementation(async (req, res) => {
        res.status(200).json({ message: 'Dernière mise à jour récupérée' });
        return Promise.resolve();
      });

      const response = await request(app).get('/timestamp/get');

      expect(response.status).toBe(200);
      expect(mockGetTimestamp).toHaveBeenCalled();
      expect(response.body).toEqual({ message: 'Dernière mise à jour récupérée' });
    });
  });

  describe('GET /timestamp/get/:type/:platform', () => {
    it('devrait appeler getUniqueTimestamp et renvoyer 200', async () => {
      const mockGetUniqueTimestamp = timestampController.getUniqueTimestamp as jest.MockedFunction<typeof timestampController.getUniqueTimestamp>;
      mockGetUniqueTimestamp.mockImplementation(async (req, res) => {
        res.status(200).json({ message: 'Dernière mise à jour unique récupérée', type: req.params.type, platform: req.params.platform });
        return Promise.resolve();
      });

      const response = await request(app).get('/timestamp/get/testType/testPlatform');

      expect(response.status).toBe(200);
      expect(mockGetUniqueTimestamp).toHaveBeenCalled();
      expect(response.body).toEqual({ message: 'Dernière mise à jour unique récupérée', type: 'testType', platform: 'testPlatform' });
    });
  });

  describe('GET /timestamp/update/:type', () => {
    it('devrait appeler updateTimestampByType et renvoyer 200', async () => {
      const mockUpdateTimestampByType = timestampController.updateTimestampByType as jest.MockedFunction<typeof timestampController.updateTimestampByType>;
      mockUpdateTimestampByType.mockImplementation(async (req, res) => {
        res.status(200).json({ message: 'Dernière mise à jour modifiée', type: req.params.type });
        return Promise.resolve();
      });

      const response = await request(app).get('/timestamp/update/testType');

      expect(response.status).toBe(200);
      expect(mockUpdateTimestampByType).toHaveBeenCalled();
      expect(response.body).toEqual({ message: 'Dernière mise à jour modifiée', type: 'testType' });
    });
  });
});
