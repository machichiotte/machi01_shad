import express from 'express';
import request from 'supertest';
import shadRoutes from '@routes/shadRoutes';
import * as shadController from '@controllers/shadController';

// Mock du contrôleur Shad
jest.mock('@controllers/shadController');

describe('shadRoutes', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use('/shad', shadRoutes);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /shad/get', () => {
        it('devrait appeler getShad et renvoyer 200', async () => {
            const mockGetShad = shadController.getShad as jest.MockedFunction<typeof shadController.getShad>;
            mockGetShad.mockImplementation(async (req, res) => {
                res.status(200).json({ message: 'Données Shad récupérées' });
                return Promise.resolve();
            });

            const response = await request(app).get('/shad/get');

            expect(response.status).toBe(200);
            expect(mockGetShad).toHaveBeenCalled();
            expect(response.body).toEqual({ message: 'Données Shad récupérées' });
        });
    });

    describe('POST /shad/trailing', () => {
        it('devrait appeler handleTrailingStopHedge et renvoyer 200', async () => {
            const mockHandleTrailingStopHedge = shadController.handleTrailingStopHedge as jest.MockedFunction<typeof shadController.handleTrailingStopHedge>;
            mockHandleTrailingStopHedge.mockImplementation(async (req, res) => {
                res.status(200).json({ message: 'Trailing stop hedge traité' });
                return Promise.resolve();
            });

            const response = await request(app)
                .post('/shad/trailing')
                .send({ /* Ajoutez ici les données nécessaires pour le test */ });

            expect(response.status).toBe(200);
            expect(mockHandleTrailingStopHedge).toHaveBeenCalled();
            expect(response.body).toEqual({ message: 'Trailing stop hedge traité' });
        });
    });
});
