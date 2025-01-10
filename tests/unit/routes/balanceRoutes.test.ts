import express from 'express';
import request from 'supertest';
import balanceRoutes from '../../../src/routes/routeBalance';
import * as balanceController from '../../../src/ctrl/ctrlBalance';

// Mock du contrôleur de balance
jest.mock('../../../src/ctrl/ctrlBalance');

describe('balanceRoutes', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use('/balance', balanceRoutes);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /balance/get', () => {
        it('devrait appeler getBalances et renvoyer 200', async () => {
            const mockGetBalances = balanceController.getBalances as jest.MockedFunction<typeof balanceController.getBalances>;
            mockGetBalances.mockImplementation(async (req, res) => {
                res.status(200).json({ message: 'Balances récupérées' });
                return Promise.resolve();
            });


            const response = await request(app).get('/balance/get');

            expect(response.status).toBe(200);
            expect(mockGetBalances).toHaveBeenCalled();
            expect(response.body).toEqual({ message: 'Balances récupérées' });
        });
    });

    describe('GET /balance/update/:platform', () => {
        it('devrait appeler updateCurrentBalance et renvoyer 200', async () => {
            const mockUpdateCurrentBalance = balanceController.updateCurrentBalance as jest.MockedFunction<typeof balanceController.updateCurrentBalance>;
            mockUpdateCurrentBalance.mockImplementation(async (req, res) => {
                res.status(200).json({ message: 'Balance mise à jour' });
                return Promise.resolve();
            });


            const response = await request(app).get('/balance/update/testPlatform');

            expect(response.status).toBe(200);
            expect(mockUpdateCurrentBalance).toHaveBeenCalled();
            expect(response.body).toEqual({ message: 'Balance mise à jour' });
        });

        it('devrait passer le paramètre platform correctement', async () => {
            const mockUpdateCurrentBalance = balanceController.updateCurrentBalance as jest.MockedFunction<typeof balanceController.updateCurrentBalance>;
            mockUpdateCurrentBalance.mockImplementation(async (req, res) => {
                res.status(200).json({ platform: req.params.platform });
                return Promise.resolve();
            });


            const response = await request(app).get('/balance/update/testPlatform');

            expect(response.status).toBe(200);
            expect(mockUpdateCurrentBalance).toHaveBeenCalled();
            expect(response.body).toEqual({ platform: 'testPlatform' });
        });
    });
});