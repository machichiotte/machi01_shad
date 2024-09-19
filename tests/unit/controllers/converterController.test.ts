import { Request, Response } from 'express'
import { getConvertedCsv } from '@controllers/converterController'
import * as ConverterService from '@services/converterService'
import Papa from 'papaparse'

jest.mock('@services/converterService')
jest.mock('papaparse')

describe('getConvertedCsv', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockJson: jest.Mock
  let mockStatus: jest.Mock

  beforeEach(() => {
    mockJson = jest.fn()
    mockStatus = jest.fn().mockReturnThis()
    mockResponse = {
      json: mockJson,
      status: mockStatus
    }
    mockRequest = {
      file: {
        buffer: Buffer.from('nom,age\nAlice,30\nBob,25'),
        fieldname: 'file',
        originalname: 'test.csv',
        encoding: '7bit',
        mimetype: 'text/csv',
        size: 25
        // Ajoutez d'autres propriétés si nécessaire
      } as Express.Multer.File
    }
  })

  it('devrait convertir avec succès un fichier CSV en JSON', async () => {
    const mockParsedData = [
      { nom: 'Alice', age: '30' },
      { nom: 'Bob', age: '25' }
    ]
    const mockJsonData = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 }
    ]

      ; (Papa.parse as jest.Mock).mockImplementation((_, options) => {
        options.complete({ data: mockParsedData })
      })

      ; (ConverterService.convertToJSON as jest.Mock).mockResolvedValue(
        mockJsonData
      )

    await getConvertedCsv(mockRequest as Request, mockResponse as Response)

    expect(mockJson).toHaveBeenCalledWith({ message: 'CSV converted to JSON', data: mockJsonData })
  })

  it("devrait renvoyer une erreur 400 si aucun fichier n'est téléchargé", async () => {
    mockRequest.file = undefined

    await getConvertedCsv(mockRequest as Request, mockResponse as Response)

    expect(mockStatus).toHaveBeenCalledWith(400)
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      message: 'No file uploaded'
    })
  })

  it('devrait gérer les erreurs de parsing CSV', async () => {
    const mockError = new Error('Erreur de parsing')

      ; (Papa.parse as jest.Mock).mockImplementation((_, options) => {
        options.error(mockError)
      })

    await getConvertedCsv(mockRequest as Request, mockResponse as Response)

    expect(mockStatus).toHaveBeenCalledWith(500)
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      message: 'Server error'
    })
  })

  // Ajoutez d'autres tests si nécessaire
})
