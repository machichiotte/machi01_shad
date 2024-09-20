// src/controllers/marketController.ts
import { Request, Response } from 'express'
import { handleControllerError } from '@utils/errorUtil'
import { validateEnvVariables } from '@utils/controllerUtil'
import { MarketService } from '@services/marketService'

validateEnvVariables(['MONGODB_COLLECTION_LOAD_MARKETS', 'TYPE_LOAD_MARKETS'])

/**
 * Récupère les données de marché sauvegardées.
 */
async function getMarkets(req: Request, res: Response): Promise<void> {
  try {
    const data = await MarketService.getSavedMarkets()
    res.status(200).json({
      message: 'Données de marché récupérées',
      data
    })
  } catch (error) {
    handleControllerError(res, error, 'getMarkets')
  }
}

export { getMarkets }
