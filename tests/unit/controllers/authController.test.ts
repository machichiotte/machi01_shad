import { Request, Response } from 'express'
import { registerUser, loginUser } from '../../../src/controllers/authController'
import { AuthService } from '../../../src/services/authService'

jest.mock('../../../src/services/authService')

describe('authController', () => {
    let mockRequest: Partial<Request>
    let mockResponse: Partial<Response>
    let responseObject: { json: jest.Mock; status: jest.Mock }

    beforeEach(() => {
        mockRequest = {}
        responseObject = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis()
        }
        mockResponse = responseObject
    })

    describe('registerUser', () => {
        it("devrait renvoyer une erreur 400 si l'email ou le mot de passe est manquant", async () => {
            mockRequest.body = {}
            await registerUser(mockRequest as Request, mockResponse as Response)
            expect(mockResponse.status).toHaveBeenCalledWith(400)
            expect(responseObject.json).toHaveBeenCalledWith({
                message: 'Missing email or password'
            })
        })

        it('devrait créer un utilisateur avec succès', async () => {
            mockRequest.body = { email: 'test@example.com', password: 'password123' };
            (AuthService.createUserDBService as jest.Mock).mockResolvedValue(true)
            await registerUser(mockRequest as Request, mockResponse as Response)
            expect(mockResponse.status).toHaveBeenCalledWith(201)
            expect(responseObject.json).toHaveBeenCalledWith({
                message: 'User created successfully'
            })
        })

        // Ajoutez d'autres tests pour les cas d'erreur...
    })

    describe('loginUser', () => {
        it("devrait renvoyer une erreur 400 si l'email ou le mot de passe est manquant", async () => {
            mockRequest.body = {}
            await loginUser(mockRequest as Request, mockResponse as Response)
            expect(mockResponse.status).toHaveBeenCalledWith(400)
            expect(responseObject.json).toHaveBeenCalledWith({
                message: 'Missing email or password'
            })
        })

        it('devrait authentifier un utilisateur avec succès', async () => {
            mockRequest.body = { email: 'test@example.com', password: 'password123' }
                ; (AuthService.findUserByEmail as jest.Mock).mockResolvedValue({
                    _id: 'userId',
                    password: 'testPassword'
                })
                ; (AuthService.isPasswordMatch as jest.Mock).mockResolvedValue(true)
                ; (AuthService.generateSessionToken as jest.Mock).mockResolvedValue(
                    'token123'
                )
            await loginUser(mockRequest as Request, mockResponse as Response)
            expect(mockResponse.status).toHaveBeenCalledWith(200)
            expect(responseObject.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Login successful',
                    data: {
                        userId: 'userId',
                        token: 'token123',
                        expiresIn: expect.any(Number)
                    }
                })
            )
        })

        // Ajoutez d'autres tests pour les cas d'erreur...
    })
})
