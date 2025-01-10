import express from 'express';
import request from 'supertest';
import tickerRoutes from '../../../src/routes/routeTicker';
import * as tickerController from '../../../src/ctrl/ctrlTicker';

jest.mock('@ctrl/tickerController');

describe('Ticker Routes', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use('/api/tickers', tickerRoutes);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('GET /api/tickers/get', () => {
        it('devrait appeler getAllTickers et renvoyer 200', async () => {
            (tickerController.getAllTickers as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json({ message: 'Tickers récupérés' });
            });

            const response = await request(app).get('/api/tickers/get');

            expect(response.status).toBe(200);
            expect(tickerController.getAllTickers).toHaveBeenCalled();
            expect(response.body).toEqual({ message: 'Tickers récupérés' });
        });
    });

    describe('GET /api/tickers/update', () => {
        it('devrait appeler updateAllTickers et renvoyer 200', async () => {
            (tickerController.updateAllTickers as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json({ message: 'Tickers mis à jour' });
            });

            const response = await request(app).get('/api/tickers/update');

            expect(response.status).toBe(200);
            expect(tickerController.updateAllTickers).toHaveBeenCalled();
            expect(response.body).toEqual({ message: 'Tickers mis à jour' });
        });
    });
});