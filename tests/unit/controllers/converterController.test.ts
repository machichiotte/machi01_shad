import { Request, Response } from 'express';
import { getConvertedCsv } from '@controllers/converterController';
import * as converterService from '@services/converterService';

jest.mock('@services/converterService');

describe('Contrôleur de conversion', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockResponse = {
      json: mockJson,
      status: jest.fn().mockReturnThis(),
    };
    mockRequest = {
        file: {
          buffer: Buffer.from('nom,age\nAlice,30\nBob,25'),
          fieldname: 'file',
          originalname: 'test.csv',
          encoding: '7bit',
          mimetype: 'text/csv',
          size: 25,
          // Ajoutez d'autres propriétés si nécessaire
        } as Express.Multer.File,
      };
  });

  describe('getConvertedCsv', () => {
    it('devrait convertir le CSV en JSON avec succès', async () => {
      const mockConvertedData = [{ nom: 'Alice', age: '30' }, { nom: 'Bob', age: '25' }];
      (converterService.convertToJSON as jest.Mock).mockResolvedValue(mockConvertedData);

      await getConvertedCsv(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockConvertedData,
      });
    });

    it('devrait gérer l\'erreur lorsqu\'aucun fichier n\'est téléchargé', async () => {
      mockRequest.file = undefined;

      await getConvertedCsv(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "No file uploaded",
      });
    });

    it('devrait gérer les erreurs lors de la conversion', async () => {
      (converterService.convertToJSON as jest.Mock).mockRejectedValue(new Error('Erreur de conversion'));

      await getConvertedCsv(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal Server Error",
      });
    });
  });
});
