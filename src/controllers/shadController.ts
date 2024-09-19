// src/controllers/shadController.ts
import { Request, Response } from 'express'
import { handleControllerError } from '../utils/errorUtil'
import { validateEnvVariables } from '../utils/controllerUtil'
import { ShadService } from '../services/shadService'
import { TrailingStopService } from '../services/trailingStopService'

validateEnvVariables(['MONGODB_COLLECTION_CMC', 'TYPE_CMC'])

/**
 * Récupère les dernières données CoinMarketCap de la base de données.
 */
async function getShad(req: Request, res: Response): Promise<void> {
  try {
    const data = await ShadService.fetchShadInDatabase()
    res.status(200).json({ message: 'Données Shad récupérées', data })
  } catch (error) {
    handleControllerError(res, error, 'getShad')
  }
}

async function handleTrailingStopHedge(req: Request, res: Response): Promise<void> {
  try {
    // Vérifie si des actifs sélectionnés sont fournis dans les paramètres, sinon les définit comme undefined
    const simplifiedSelectedAssets = req.params.simplifiedSelectedAssets
      ? JSON.parse(req.params.simplifiedSelectedAssets as string) as Array<{ base: string, platform: string }>
      : undefined;

    const data = await TrailingStopService.handleTrailingStopHedge(simplifiedSelectedAssets);
    res.status(200).json({ message: 'Mise à jour des ordres de trailing stop terminée', data });
  } catch (error) {
    handleControllerError(res, error, 'handleTrailingStopHedge');
  }
}

export { getShad, handleTrailingStopHedge }
