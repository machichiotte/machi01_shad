import { Request, Response } from 'express';
import { registerUser, loginUser } from '../../../src/controllers/authController';
import * as authService from '../../../src/services/authService';

jest.mock('../../../src/services/authService');

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    mockRequest = {};
    responseObject = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    mockResponse = responseObject;
  });

  describe('registerUser', () => {
    it('devrait renvoyer une erreur 400 si l\'email ou le mot de passe est manquant', async () => {
      mockRequest.body = {};
      await registerUser(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: false,
        message: "Missing email or password"
      });
    });

    it('devrait créer un utilisateur avec succès', async () => {
      mockRequest.body = { email: 'test@example.com', password: 'password123' };
      (authService.createUserDBService as jest.Mock).mockResolvedValue(true);
      await registerUser(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: true,
        message: "User created successfully"
      });
    });

    // Ajoutez d'autres tests pour les cas d'erreur...
  });

  describe('loginUser', () => {
    it('devrait renvoyer une erreur 400 si l\'email ou le mot de passe est manquant', async () => {
      mockRequest.body = {};
      await loginUser(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: false,
        message: "Missing email or password"
      });
    });

    it('devrait authentifier un utilisateur avec succès', async () => {
      mockRequest.body = { email: 'test@example.com', password: 'password123' };
      (authService.findUserByEmail as jest.Mock).mockResolvedValue({ _id: 'userId', password: 'hashedPassword' });
      (authService.isPasswordMatch as jest.Mock).mockResolvedValue(true);
      (authService.generateSessionToken as jest.Mock).mockResolvedValue('token123');
      await loginUser(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.json).toHaveBeenCalledWith(expect.objectContaining({
        status: true,
        message: "Login successful",
        userId: 'userId',
        token: 'token123'
      }));
    });

    // Ajoutez d'autres tests pour les cas d'erreur...
  });
});