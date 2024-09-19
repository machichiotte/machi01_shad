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
    console.log('Données Shad récupérées', { count: data.length })
    res.json(data)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Erreur dans getShad: ${error.message}`, { error })
      handleControllerError(res, error, 'getShad')
    } else {
      console.error('Erreur inconnue dans getShad')
      handleControllerError(res, new Error('Erreur inconnue'), 'getShad')
    }
  }
}

async function handleTrailingStopHedge(req: Request, res: Response): Promise<void> {
  try {
    // Vérifie si des actifs sélectionnés sont fournis dans les paramètres, sinon les définit comme undefined
    const simplifiedSelectedAssets = req.params.simplifiedSelectedAssets
      ? JSON.parse(req.params.simplifiedSelectedAssets as string) as Array<{ base: string, platform: string }>
      : undefined;

    // Appelle le service avec ou sans les actifs sélectionnés
    const updatedOrders = await TrailingStopService.handleTrailingStopHedge(simplifiedSelectedAssets);

    // Log et réponse HTTP
    console.log(`Mise à jour des ordres de trailing stop terminée`, { count: updatedOrders.length });
    res.status(200).json({ updatedOrders });
  } catch (error) {
    handleControllerError(res, error as Error, 'handleTrailingStopHedge');
  }
}

export { getShad, handleTrailingStopHedge }
