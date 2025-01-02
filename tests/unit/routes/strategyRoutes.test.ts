import express from 'express';
import request from 'supertest';
import strategyRoutes from '../../../src/routes/routeStrategy';
import * as strategyController from '../../../src/ctrl/ctrlStrategy';

// Mock du contrôleur Strategy
jest.mock('../../../src/ctrl/strategyController');

describe('strategyRoutes', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use('/strategy', strategyRoutes);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /strategy/get', () => {
        it('devrait appeler getStrat et renvoyer 200', async () => {
            const mockGetStrat = strategyController.getStrat as jest.MockedFunction<typeof strategyController.getStrat>;
            mockGetStrat.mockImplementation(async (req, res) => {
                res.status(200).json({ message: 'Stratégie récupérée' });
                return Promise.resolve();
            });

            const response = await request(app).get('/strategy/get');

            expect(response.status).toBe(200);
            expect(mockGetStrat).toHaveBeenCalled();
            expect(response.body).toEqual({ message: 'Stratégie récupérée' });
        });
    });

    describe('POST /strategy/update', () => {
        it('devrait appeler updateStrat et renvoyer 200', async () => {
            const mockUpdateStrat = strategyController.updateStrat as jest.MockedFunction<typeof strategyController.updateStrat>;
            mockUpdateStrat.mockImplementation(async (req, res) => {
                res.status(200).json({ message: 'Stratégie mise à jour' });
                return Promise.resolve();
            });

            const response = await request(app)
                .post('/strategy/update')
                .send({ strategyData: 'someData' });

            expect(response.status).toBe(200);
            expect(mockUpdateStrat).toHaveBeenCalled();
            expect(response.body).toEqual({ message: 'Stratégie mise à jour' });
        });
    });
});
