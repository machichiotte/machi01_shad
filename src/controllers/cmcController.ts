// src/controllers/cmcController.ts
import { Request, Response } from 'express'
import { handleControllerError } from '@utils/errorUtil'
import { validateEnvVariables } from '@utils/controllerUtil'
import { CmcService } from '@services/cmcService'

validateEnvVariables(['MONGODB_COLLECTION_CMC', 'TYPE_CMC'])

/**
 * Récupère les dernières données CoinMarketCap de la base de données.
 */
async function getCmc(req: Request, res: Response): Promise<void> {
  try {
    const data = await CmcService.fetchDatabaseCmc()
    console.log('Données CMC récupérées', {
      collectionName: process.env.MONGODB_COLLECTION_CMC,
      count: data.length
    })
    res.json(data)
  } catch (error) {
    handleControllerError(res, error as Error, 'getCmc')
  }
}

/**
 * Met à jour les données CoinMarketCap en récupérant les dernières informations de l'API CoinMarketCap et en les sauvegardant dans la base de données.
 */
async function updateCmc(req: Request, res: Response): Promise<void> {
  try {
    const result = await CmcService.updateCmcData()
    res.status(200).json(result)
  } catch (error) {
    handleControllerError(res, error as Error, 'updateCmc')
  }
}

export { getCmc, updateCmc }