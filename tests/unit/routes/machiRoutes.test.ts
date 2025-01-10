import express from 'express';
import request from 'supertest';
import machiRoutes from '../../../src/routes/routeMachi';
import * as machiController from '../../../src/ctrl/ctrlMachi';

// Mock du contrôleur Machi
jest.mock('../../../src/ctrl/ctrlMachi');

describe('machiRoutes', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use('/machi', machiRoutes);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /machi/get', () => {
        it('devrait appeler getMachi et renvoyer 200', async () => {
            const mockGetMachi = machiController.getMachi as jest.MockedFunction<typeof machiController.getMachi>;
            mockGetMachi.mockImplementation(async (req, res) => {
                res.status(200).json({ message: 'Données Machi récupérées' });
                return Promise.resolve();
            });

            const response = await request(app).get('/machi/get');

            expect(response.status).toBe(200);
            expect(mockGetMachi).toHaveBeenCalled();
            expect(response.body).toEqual({ message: 'Données Machi récupérées' });
        });
    });

    describe('POST /machi/trailing', () => {
        it('devrait appeler handleTrailingStopHedge et renvoyer 200', async () => {
            const mockHandleTrailingStopHedge = machiController.handleTrailingStopHedge as jest.MockedFunction<typeof machiController.handleTrailingStopHedge>;
            mockHandleTrailingStopHedge.mockImplementation(async (req, res) => {
                res.status(200).json({ message: 'Trailing stop hedge traité' });
                return Promise.resolve();
            });

            const response = await request(app)
                .post('/machi/trailing')
                .send({ /* Ajoutez ici les données nécessaires pour le test */ });

            expect(response.status).toBe(200);
            expect(mockHandleTrailingStopHedge).toHaveBeenCalled();
            expect(response.body).toEqual({ message: 'Trailing stop hedge traité' });
        });
    });
});
