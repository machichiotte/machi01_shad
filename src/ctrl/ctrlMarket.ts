import { Request, Response } from 'express'
import { handleControllerError } from '@utils/errorUtil'
import { ServiceMarket } from '@services/api/platform/serviceMarket'
import { isValidPlatform } from '@utils/platformUtil'

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

/**
 * Récupère les derniers markets pour une plateforme spécifiques.
 */
async function fetchLastMarkets(req: Request, res: Response): Promise<void> {
  const { platform } = req.params

  if (!isValidPlatform(platform)) {
    res.status(400).json({ message: `La plateforme '${platform}' n'est pas valide.` });
    return;
  }

  try {
    const data = await ServiceMarket.fetchCurrentMarkets(platform)
    res.status(200).json({ status: "success", message: 'Derniers markets récupérés', data })
  } catch (error) {
    handleControllerError(res, error, 'fetchLastMarkets')
  }
}

export { getMarkets, fetchLastMarkets}
