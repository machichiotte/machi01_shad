import express from 'express';
import request from 'supertest';
import routeCmc from '../../../src/routes/routeCmc';
import * as cmcController from '../../../src/ctrl/ctrlCmc';

// Mock du contrôleur CMC
jest.mock('../../../src/ctrl/ctrlCmc');

describe('routeCmc', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use('/cmc', routeCmc);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /cmc/get', () => {
        it('devrait appeler getCmc et renvoyer 200', async () => {
            const mockGetCmc = cmcController.getCmc as jest.MockedFunction<typeof cmcController.getCmc>;
            mockGetCmc.mockImplementation(async (req, res) => {
                res.status(200).json({ message: 'Données CMC récupérées' });
                return Promise.resolve();
            });

            const response = await request(app).get('/cmc/get');

            expect(response.status).toBe(200);
            expect(mockGetCmc).toHaveBeenCalled();
            expect(response.body).toEqual({ message: 'Données CMC récupérées' });
        });
    });

    describe('GET /cmc/update', () => {
        it('devrait appeler updateCmc et renvoyer 200', async () => {
            const mockUpdateCmc = cmcController.updateCmc as jest.MockedFunction<typeof cmcController.updateCmc>;
            mockUpdateCmc.mockImplementation(async (req, res) => {
                res.status(200).json({ message: 'Données CMC mises à jour' });
                return Promise.resolve();
            });

            const response = await request(app).get('/cmc/update');

            expect(response.status).toBe(200);
            expect(mockUpdateCmc).toHaveBeenCalled();
            expect(response.body).toEqual({ message: 'Données CMC mises à jour' });
        });
    });
});