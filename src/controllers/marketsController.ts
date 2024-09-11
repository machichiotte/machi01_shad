import { Request, Response } from 'express'
import { handleErrorResponse } from '../utils/errorUtil'
import { errorLogger } from '../utils/loggerUtil'
import { validateEnvVariables } from '../utils/controllerUtil'
import { getSavedMarkets } from '../services/marketsService'

validateEnvVariables(['MONGODB_COLLECTION_LOAD_MARKETS', 'TYPE_LOAD_MARKETS'])

/**
 * Récupère les données de marché sauvegardées.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 */
async function getMarkets(req: Request, res: Response): Promise<void> {
  try {
    const data = await getSavedMarkets()
    res.json(data)
  } catch (error) {
    errorLogger.error('Échec de la récupération des données de marché.', {
      error: (error as Error).message
    })
    handleErrorResponse(res, error as Error, 'getMarkets')
  }
}

export { getMarkets }
