import { Request, Response } from 'express'
import { getCmc, updateCmc } from '@controllers/cmcController'
import { CmcService } from '@services/cmcService'
import { handleControllerError } from '@utils/errorUtil'

jest.mock('@services/cmcService')
jest.mock('@utils/errorUtil')

describe('cmcController', () => {
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
            const mockCmcData = [{ id: 1, name: 'Bitcoin' }];
            (CmcService.fetchDatabaseCmc as jest.Mock).mockResolvedValue(mockCmcData)

            await getCmc(mockRequest as Request, mockResponse as Response)

            expect(responseObject.json).toHaveBeenCalledWith({
                data: mockCmcData,
                message: 'Données CMC récupérées avec succès'
            })
        })

        it('devrait gérer les erreurs correctement', async () => {
            const mockError = new Error('Erreur de test')
                ; (CmcService.fetchDatabaseCmc as jest.Mock).mockRejectedValue(mockError)

            await getCmc(mockRequest as Request, mockResponse as Response)

            expect(handleControllerError).toHaveBeenCalledWith(
                mockResponse,
                mockError,
                'getCmc'
            )
        })
    })

    describe('updateCmc', () => {
        it('devrait mettre à jour les données CMC avec succès', async () => {
            const mockUpdateResult = { updated: true, count: 100 }

                ; (CmcService.updateCmcData as jest.Mock).mockResolvedValue(
                    mockUpdateResult
                )

            await updateCmc(mockRequest as Request, mockResponse as Response)

            expect(mockResponse.status).toHaveBeenCalledWith(200)
            expect(responseObject.json).toHaveBeenCalledWith({
                data: mockUpdateResult,
                message: "Données CMC mises à jour avec succès"
            })
        })

        it('devrait gérer les erreurs correctement', async () => {
            const mockError = new Error('Erreur de test')
                ; (CmcService.updateCmcData as jest.Mock).mockRejectedValue(mockError)

            await updateCmc(mockRequest as Request, mockResponse as Response)

            expect(handleControllerError).toHaveBeenCalledWith(
                mockResponse,
                mockError,
                'updateCmc'
            )
        })
    })
})
