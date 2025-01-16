// tests/unit/routes/routeAlarm.test.ts
import express from 'express';
import request from 'supertest';
import alarmRoutes from '../../../src/routes/routeAlarm';
import * as alarmController from '../../../src/ctrl/ctrlAlarm';

// Mock du contrôleur
jest.mock('../../../src/ctrl/ctrlAlarm');

describe('routeAlarm', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use(express.json()); // Ajouter le middleware pour gérer les requêtes JSON
        app.use('/alarm', alarmRoutes);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /alarm/set', () => {
        it('devrait appeler setAlarm', async () => {
            const mockSetAlarm = alarmController.setAlarm as jest.MockedFunction<typeof alarmController.setAlarm>;

            // Simuler une réponse du contrôleur
            mockSetAlarm.mockImplementation(async (req, res) => {
                res.status(200).json({ message: 'Alarm created successfully' });
                return Promise.resolve();
            });

            // Envoyer une requête POST
            const response = await request(app)
                .post('/alarm/set')
                .send({
                    platform: 'binance',
                    base: 'BTC',
                    price: 30000,
                    status: 'open',
                });

            // Assertions
            expect(mockSetAlarm).toHaveBeenCalledTimes(1);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Alarm created successfully' });
        });
    });
});
