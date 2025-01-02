import request from 'supertest';
import express from 'express';
import authRoutes from '../../../src/routes/authRoutes';
import * as authController from '../../../src/ctrl/authController';

jest.mock('../../../src/ctrl/authController');

describe('authRoutes', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/auth', authRoutes);
    });

    it('should call loginUser controller for POST /auth/login', async () => {
        const mockLoginUser = authController.loginUser as jest.MockedFunction<typeof authController.loginUser>;

        mockLoginUser.mockImplementation(async (req, res) => {
            res.sendStatus(200);
            return Promise.resolve();
        });

        await request(app)
            .post('/auth/login')
            .send({ username: 'testuser', password: 'password' })
            .expect(200);

        expect(mockLoginUser).toHaveBeenCalled();
    });

    it('should call registerUser controller for POST /auth/register', async () => {
        const mockRegisterUser = authController.registerUser as jest.MockedFunction<typeof authController.registerUser>;
        mockRegisterUser.mockImplementation(async (req, res) => {
            res.sendStatus(201);
            return Promise.resolve();
        });
        await request(app)
            .post('/auth/register')
            .send({ email: 'newuser@example.com', password: 'newpassword' })
            .expect(201);

        expect(mockRegisterUser).toHaveBeenCalledWith(
            expect.objectContaining({
                body: { email: 'newuser@example.com', password: 'newpassword' }
            }),
            expect.anything(),
            expect.anything()
        );
    });
});