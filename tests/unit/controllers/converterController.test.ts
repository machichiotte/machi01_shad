import { Request, Response } from 'express';
import { getConvertedCsv } from '../../../src/controllers/converterController';
import * as ConverterService from '../../../src/services/converterService';
import Papa from 'papaparse';
import { handleControllerError } from '../../../src/utils/errorUtil';

jest.mock('../../../src/services/converterService');
jest.mock('papaparse');
jest.mock('../../../src/utils/errorUtil');

describe('converterController', () => {
  describe('getConvertedCsv', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;

    beforeEach(() => {
      mockJson = jest.fn();
      mockStatus = jest.fn().mockReturnThis();
      mockResponse = {
        json: mockJson,
        status: mockStatus,
      };
      mockRequest = {};
      jest.clearAllMocks();
    });

    it('should convert a CSV file to JSON successfully', async () => {
      // Mock request file
      const mockFileBuffer = Buffer.from('base,balance,available,platform\nBTC,100,50,BINANCE');
      mockRequest.file = { buffer: mockFileBuffer } as Express.Multer.File;

      // Mock PapaParse parsing result
      const mockParseResult = {
        data: [{ base: 'BTC', balance: '100', available: '50', platform: 'BINANCE' }],
      };
      (Papa.parse as jest.Mock).mockImplementation((_, options) => {
        options.complete(mockParseResult);
      });

      // Mock convertToJSON
      const mockConvertedData = [{ base: 'BTC', balance: 100, available: 50, platform: 'BINANCE' }];
      (ConverterService.convertToJSON as jest.Mock).mockResolvedValue(mockConvertedData);

      await getConvertedCsv(mockRequest as Request, mockResponse as Response);

      expect(Papa.parse).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
      expect(ConverterService.convertToJSON).toHaveBeenCalledWith(mockParseResult.data);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'CSV converted to JSON',
        data: mockConvertedData,
      });
    });

    it('should return an error if no file is uploaded', async () => {
      await getConvertedCsv(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'No file uploaded',
      });
    });

    it('should handle CSV parsing error', async () => {
      // Mock request file 
      const mockFileBuffer = Buffer.from('invalid,csv');
      mockRequest.file = { buffer: mockFileBuffer } as Express.Multer.File;

      // Mock PapaParse error
      const mockError = new Error('Parse error');
      (Papa.parse as jest.Mock).mockImplementation((_, options) => {
        options.error(mockError);
      });

      await getConvertedCsv(mockRequest as Request, mockResponse as Response);

      expect(handleControllerError).toHaveBeenCalledWith(mockResponse, mockError, 'papaParse');
    });
  });
});
