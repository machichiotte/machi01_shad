import { Request, Response } from 'express'
import { OrdersService } from '../services/ordersService'
import { handleControllerError } from '@utils/errorUtil'
import { validateEnvVariables } from '@utils/controllerUtil'

validateEnvVariables(['MONGODB_COLLECTION_ACTIVE_ORDERS', 'TYPE_ACTIVE_ORDERS'])

/**
 * Récupère toutes les commandes de la base de données.
 */
async function getOrders(req: Request, res: Response): Promise<void> {
  try {
    const data = await OrdersService.fetchDatabaseOrders()
    res.status(200).json({ message: 'Commandes récupérées', data })
  } catch (error) {
    handleControllerError(res, error, 'getOrders')
  }
}

/**
 * Met à jour les commandes depuis le serveur pour une plateforme spécifique.
 */
async function updateOrders(req: Request, res: Response): Promise<void> {
  const { platform } = req.params
  try {
    const data = await OrdersService.updateOrdersFromServer(platform)
    res.status(200).json({ message: 'Ordres mis à jour', data })
  } catch (error) {
    handleControllerError(res, error, 'updateOrders')
  }
}

/**
 * Supprime une commande spécifique.
 */
async function deleteOrder(req: Request, res: Response): Promise<void> {
  const { platform, oId, symbol } = req.body
  try {
    await OrdersService.deleteOrder(platform, oId, symbol)
    res.status(200).json({ message: 'Commande supprimée' })
  } catch (error) {
    handleControllerError(res, error, 'deleteOrder')
  }
}

/**
 * Crée un ordre d'achat au marché.
 */
async function createMarketBuyOrder(req: Request, res: Response): Promise<void> {
  await createMarketOrder(req, res, 'buy')
}

/**
 * Crée un ordre de vente au marché.
 */
async function createMarketSellOrder(req: Request, res: Response): Promise<void> {
  await createMarketOrder(req, res, 'sell')
}

/**
 * Crée un ordre au marché (achat ou vente).
 */
async function createMarketOrder(req: Request, res: Response, orderType: 'buy' | 'sell'): Promise<void> {
  const { platform, asset, amount } = req.body
  try {
    const data = await OrdersService.createMarketOrder(platform, asset, amount, orderType)
    res.status(200).json({ message: 'Ordre créé', data })
  } catch (error) {
    handleControllerError(res, error, `createMarketOrder (${orderType})`)
  }
}

/**
 * Crée un ordre limite (achat ou vente).
 */
async function createLimitOrder(req: Request, res: Response, orderType: 'buy' | 'sell'): Promise<void> {
  const { platform, price, amount, asset } = req.body
  try {
    const data = await OrdersService.createLimitOrder(platform, asset, amount, orderType, price)
    res.status(200).json({ message: `Ordre limit ${orderType} créé`, data })
  } catch (error) {
    handleControllerError(res, error, `createLimitOrder (${orderType})`)
  }
}

/**
 * Crée un ordre de vente au marché.
 */
async function createLimitSellOrder(req: Request, res: Response): Promise<void> {
  await createLimitOrder(req, res, 'sell')
}

/**
 * Crée un groupe d'ordres de vente limite.
 */
async function createBunchLimitSellOrders(req: Request, res: Response): Promise<void> {
  await createLimitOrder(req, res, 'sell')
}

/**
 * Crée un groupe d'ordres d'achat limite.
 */
async function createBunchLimitBuyOrders(req: Request, res: Response): Promise<void> {
  await createLimitOrder(req, res, 'buy')
}

/**
 * Annule tous les ordres pour une plateforme et un actif spécifiques.
 */
async function cancelAllOrders(req: Request, res: Response): Promise<void> {
  const { platform, asset } = req.body
  try {
    const data = await OrdersService.cancelAllOrders(platform, asset)
    res.status(200).json({ message: `Tous les ordres annulés pour ${asset} sur ${platform}`, data })
  } catch (error) {
    handleControllerError(res, error, 'cancelAllOrders')
  }
}

/**
 * Annule tous les ordres de vente pour une plateforme et un actif spécifiques.
 */
async function cancelAllSellOrders(req: Request, res: Response): Promise<void> {
  const { platform, asset } = req.body
  try {
    const data = await OrdersService.cancelAllSellOrders(platform, asset)
    res.status(200).json({ message: `Tous les ordres de vente annulés pour ${asset} sur ${platform}`, data })
  } catch (error) {
    handleControllerError(res, error, 'cancelAllSellOrders')
  }
}

export {
  getOrders,
  updateOrders,
  deleteOrder,
  createLimitSellOrder,
  createBunchLimitSellOrders,
  createBunchLimitBuyOrders,
  cancelAllOrders,
  cancelAllSellOrders,
  createMarketBuyOrder,
  createMarketSellOrder
}
