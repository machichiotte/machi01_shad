import { Request, Response } from 'express'
import { handleControllerError } from '../utils/errorUtil'
import { validateEnvVariables } from '../utils/controllerUtil'
import { MarketsService } from '../services/marketsService'

validateEnvVariables(['MONGODB_COLLECTION_LOAD_MARKETS', 'TYPE_LOAD_MARKETS'])

/**
 * Récupère les données de marché sauvegardées.
 */
async function getMarkets(req: Request, res: Response): Promise<void> {
  try {
    const data = await MarketsService.getSavedMarkets()
    res.json(data)
  } catch (error) {
    handleControllerError(res, error as Error, 'getMarkets')
  }
}

export { getMarkets }
