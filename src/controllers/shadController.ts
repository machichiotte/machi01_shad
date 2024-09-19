// src/controllers/shadController.ts
import { Request, Response } from 'express'
import { handleErrorResponse } from '../utils/errorUtil'
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
      handleErrorResponse(res, error, 'getShad')
    } else {
      console.error('Erreur inconnue dans getShad')
      handleErrorResponse(res, new Error('Erreur inconnue'), 'getShad')
    }
  }
}

async function handleTrailingStopHedgeAssets(req: Request, res: Response): Promise<void> {
  try {
    const simplifiedSelectedAssets = JSON.parse(req.params.simplifiedSelectedAssets as string) as Array<{ base: string, platform: string }>;
    const updatedOrders = await TrailingStopService.handleTrailingStopHedgeAssets(simplifiedSelectedAssets);
    console.log(`Mise à jour des ordres de trailing stop terminée`, { count: updatedOrders.length });
    res.status(200).json({ updatedOrders });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Erreur dans handleTrailingStopHedgeAssets: ${error.message}`, { error });
      handleErrorResponse(res, error, 'handleTrailingStopHedgeAssets');
    } else {
      console.error('Erreur inconnue dans handleTrailingStopHedgeAssets');
      handleErrorResponse(res, new Error('Erreur inconnue'), 'handleTrailingStopHedgeAssets');
    }
  }
}

async function handleTrailingStopHedge(req: Request, res: Response): Promise<void> {
  console.log('handleTrailingStopHedge');
  try {
    const updatedOrders = await TrailingStopService.handleTrailingStopHedge();
    console.log(`Mise à jour des ordres de trailing stop terminée`, { count: updatedOrders.length });
    res.status(200).json({ updatedOrders });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Erreur dans handleTrailingStopHedge: ${error.message}`, { error });
      handleErrorResponse(res, error, 'handleTrailingStopHedge');
    } else {
      console.error('Erreur inconnue dans handleTrailingStopHedge');
      handleErrorResponse(res, new Error('Erreur inconnue'), 'handleTrailingStopHedge');
    }
  }
}

export { getShad, handleTrailingStopHedge, handleTrailingStopHedgeAssets }
