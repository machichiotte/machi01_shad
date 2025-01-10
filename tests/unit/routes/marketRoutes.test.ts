import express from 'express';
import request from 'supertest';
import marketRoutes from '../../../src/routes/routeMarket';
import * as marketController from '../../../src/ctrl/ctrlMarket';

// Mock du contrôleur Market
jest.mock('../../../src/ctrl/ctrlMarket');

describe('marketRoutes', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use('/market', marketRoutes);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /market/get', () => {
        it('devrait appeler getMarkets et renvoyer 200', async () => {
            const mockGetMarkets = marketController.getMarkets as jest.MockedFunction<typeof marketController.getMarkets>;
            mockGetMarkets.mockImplementation(async (req, res) => {
                res.status(200).json({ message: 'Marchés récupérés' });
                return Promise.resolve();
            });

            const response = await request(app).get('/market/get');

            expect(response.status).toBe(200);
            expect(mockGetMarkets).toHaveBeenCalled();
            expect(response.body).toEqual({ message: 'Marchés récupérés' });
        });
    });
});
