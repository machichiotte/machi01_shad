// src/ctrl/marketController.ts
import { Request, Response } from 'express'
import { handleControllerError } from '@utils/errorUtil'
import { ServiceMarket } from '@services/api/platform/serviceMarket'

/**
 * Récupère les données de marché sauvegardées.
 */
async function getMarkets(req: Request, res: Response): Promise<void> {
  try {
    const data = await ServiceMarket.getSavedMarkets()
    res.status(200).json({
      status: 'success',
      message: 'Données de marché récupérées',
      data
    })
  } catch (error) {
    handleControllerError(res, error, getMarkets.name)
  }
}

export { getMarkets }
