// src/ctrl/orderBalanceController.ts
import { Request, Response } from 'express'
import { OrderBalanceService } from '@services/api/platform/orderBalanceService'
import { handleControllerError } from '@utils/errorUtil'
import { isValidPlatform } from '@utils/platformUtil'

/**
 * Récupère toutes les commandes de la base de données.
 */
async function getOrders(req: Request, res: Response): Promise<void> {
  try {
    const data = await OrderBalanceService.fetchDatabase()
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
    const data = await OrderBalanceService.updateOrdersFromServer(platform)
    res.status(200).json({ status: "success", message: 'Ordres mis à jour', data })
  } catch (error) {
    handleControllerError(res, error, updateOrders.name)
  }

}

export {
  getOrders,
  updateOrders,
}