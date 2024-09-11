import { Request, Response } from 'express'
import { getCmc, updateCmc } from '@controllers/cmcController'
import * as cmcService from '@services/cmcService'
import { handleErrorResponse } from '@utils/errorUtil'
import { errorLogger } from '@utils/loggerUtil'

jest.mock('@services/cmcService')
jest.mock('@utils/errorUtil')
jest.mock('@utils/loggerUtil')

describe('CMC Controller', () => {
    let mockRequest: Partial<Request>
    let mockResponse: Partial<Response>
    let responseObject: { json: jest.Mock; status: jest.Mock }
    let originalConsoleLog: typeof console.log

    beforeEach(() => {
        mockRequest = {}
        responseObject = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis()
        }
        mockResponse = responseObject
        process.env.MONGODB_COLLECTION_CMC = 'testCollection'

        // Sauvegarder la fonction console.log originale
        originalConsoleLog = console.log
        // Remplacer console.log par un mock
        console.log = jest.fn()
    })

    afterEach(() => {
        // Restaurer la fonction console.log originale après chaque test
        console.log = originalConsoleLog
    })

    describe('getCmc', () => {
        it('devrait récupérer les données CMC avec succès', async () => {
            const mockCmcData = [{ id: 1, name: 'Bitcoin' }]
                ; (cmcService.fetchDatabaseCmc as jest.Mock).mockResolvedValue(mockCmcData)

            await getCmc(mockRequest as Request, mockResponse as Response)

            expect(responseObject.json).toHaveBeenCalledWith(mockCmcData)
            expect(console.log).toHaveBeenCalledWith('Données CMC récupérées', {
                collectionName: 'testCollection',
                count: 1
            })
        })

        it('devrait gérer les erreurs correctement', async () => {
            const mockError = new Error('Erreur de test')
                ; (cmcService.fetchDatabaseCmc as jest.Mock).mockRejectedValue(mockError)

            await getCmc(mockRequest as Request, mockResponse as Response)

            expect(errorLogger.error).toHaveBeenCalledWith(
                `Erreur dans getCmc: ${mockError.message}`,
                { error: mockError }
            )
            expect(handleErrorResponse).toHaveBeenCalledWith(
                mockResponse,
                mockError,
                'getCmc'
            )
        })
    })

    describe('updateCmc', () => {
        it('devrait mettre à jour les données CMC avec succès', async () => {
            const mockUpdateResult = { updated: true, count: 100 }
                ; (cmcService.updateCmcData as jest.Mock).mockResolvedValue(
                    mockUpdateResult
                )

            await updateCmc(mockRequest as Request, mockResponse as Response)

            expect(mockResponse.status).toHaveBeenCalledWith(200)
            expect(responseObject.json).toHaveBeenCalledWith(mockUpdateResult)
        })

        it('devrait gérer les erreurs correctement', async () => {
            const mockError = new Error('Erreur de test')
                ; (cmcService.updateCmcData as jest.Mock).mockRejectedValue(mockError)

            await updateCmc(mockRequest as Request, mockResponse as Response)

            expect(errorLogger.error).toHaveBeenCalledWith(
                `Erreur dans updateCmc: ${mockError.message}`,
                { error: mockError }
            )
            expect(handleErrorResponse).toHaveBeenCalledWith(
                mockResponse,
                mockError,
                'updateCmc'
            )
        })
    })
})
