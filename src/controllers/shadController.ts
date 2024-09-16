// src/controllers/shadController.ts
import { Request, Response } from 'express'
import { handleErrorResponse } from '../utils/errorUtil'
import { validateEnvVariables } from '../utils/controllerUtil'
import { ShadService } from '../services/shadService'

validateEnvVariables(['MONGODB_COLLECTION_CMC', 'TYPE_CMC'])

/**
 * Récupère les dernières données CoinMarketCap de la base de données.
 * @param {Request} req - Objet de requête HTTP.
 * @param {Response} res - Objet de réponse HTTP.
 */
async function getShad(req: Request, res: Response): Promise<void> {
  try {
    const data = await ShadService.fetchShadInDatabase()
    console.log('Données Shad récupérées', { count: data.length })
    res.json(data)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Erreur dans getShad: ${error.message}`, { error })
      handleErrorResponse(res, error, 'getShad')
    } else {
      console.error('Erreur inconnue dans getShad')
      handleErrorResponse(res, new Error('Erreur inconnue'), 'getShad')
    }
  }
}

export { getShad }
