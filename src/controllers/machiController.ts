// src/controllers/machiController.ts
import { Request, Response } from 'express'
import { handleControllerError } from '@utils/errorUtil'
import { MachiService } from '@services/api/platform/machiService'
import { TrailingStopService } from '@services/trailingStopService'

/**
 * Récupère les dernières données CoinMarketCap de la base de données.
 */
async function getMachi(req: Request, res: Response): Promise<void> {
  try {
    const data = await MachiService.fetchMachiInDatabase()
    res.status(200).json({ status: "success", message: 'Données Machi récupérées', data })
  } catch (error) {
    handleControllerError(res, error, getMachi.name)
  }
}

async function handleTrailingStopHedge(req: Request, res: Response): Promise<void> {
  try {
    // Vérifie si des actifs sélectionnés sont fournis dans les paramètres, sinon les définit comme undefined
    const simplifiedSelectedBases = req.params.simplifiedSelectedBases
      ? JSON.parse(req.params.simplifiedSelectedBases as string) as Array<{ base: string, platform: string }>
      : undefined;

    const data = await TrailingStopService.handleTrailingStopHedge(simplifiedSelectedBases);
    res.status(200).json({ status: "success", message: 'Mise à jour des ordres de trailing stop terminée', data });
  } catch (error) {
    handleControllerError(res, error, handleTrailingStopHedge.name);
  }
}

export { getMachi, handleTrailingStopHedge }
