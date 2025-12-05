// src/ctrl/ctrlOrderBalance.ts
import { Request, Response } from 'express'
import { ServiceOrderBalance } from '@services/api/platform/serviceOrderBalance'
import { handleControllerError } from '@utils/errorUtil'
import { isValidPlatform } from '@utils/platformUtil'
import { ServiceCcxt } from '@services/api/platform/serviceCcxt'

/**
 * Récupère toutes les commandes de la base de données.
 */
async function getOrders(req: Request, res: Response): Promise<void> {
  try {
    const data = await ServiceOrderBalance.fetchDatabase()
    res.status(200).json({
      status: "success",
      message: 'Ordres récupérés', data
    })
  } catch (error) {
    handleControllerError(res, error, getOrders.name)
  }
}

/**
 * Met à jour les commandes depuis le serveur pour une plateforme spécifique.
 */
async function updateOrders(req: Request, res: Response): Promise<void> {
  const { platform } = req.params

  if (!isValidPlatform(platform)) {
    res.status(400).json({ status: "error", message: `La plateforme '${platform}' n'est pas valide.` });
    return;

  }

  try {
    const data = await ServiceOrderBalance.updateOrdersFromServer(platform)
    res.status(200).json({ status: "success", message: 'Ordres mis à jour', data })
  } catch (error) {
    handleControllerError(res, error, updateOrders.name)
  }

}

/**
 * Récupère les derniers open orders pour une plateforme spécifiques.
 */
async function fetchLastOpenOrders(req: Request, res: Response): Promise<void> {
  const { platform } = req.params

  if (!isValidPlatform(platform)) {
    res.status(400).json({ message: `La plateforme '${platform}' n'est pas valide.` });
    return;
  }

  try {
    const data = await ServiceCcxt.fetchOpenOrdersByPlatform(platform)
    res.status(200).json({ status: "success", message: 'Derniers ordres ouverts récupérés', data })
  } catch (error) {
    handleControllerError(res, error, 'fetchLastOpenOrders')
  }
}

export {
  getOrders,
  updateOrders,
  fetchLastOpenOrders
}