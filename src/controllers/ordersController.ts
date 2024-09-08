import { Request, Response } from 'express';
import * as ordersService from '../services/ordersService';
import { handleErrorResponse } from "../utils/errorUtil";
import { validateEnvVariables } from "../utils/controllerUtil";

validateEnvVariables([
  "MONGODB_COLLECTION_ACTIVE_ORDERS",
  "TYPE_ACTIVE_ORDERS",
]);

/**
 * Récupère toutes les commandes de la base de données.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 * @returns {Promise<Response>} Réponse JSON avec les commandes ou une erreur.
 */
async function getOrders(req: Request, res: Response): Promise<Response> {
  try {
    const orders = await ordersService.fetchDatabaseOrders();
    return res.status(200).json(orders);
  } catch (error) {
    return handleErrorResponse(res, error, "getOrders");
  }
}

/**
 * Met à jour les commandes depuis le serveur pour une plateforme spécifique.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 * @returns {Promise<Response>} Réponse JSON avec les données mappées ou une erreur.
 */
async function updateOrders(req: Request, res: Response): Promise<Response> {
  const { platform } = req.params;
  try {
    const mappedData = await ordersService.updateOrdersFromServer(platform);
    return res.status(200).json(mappedData);
  } catch (error) {
    return handleErrorResponse(res, error, "updateOrders");
  }
}

/**
 * Supprime une commande spécifique.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 * @returns {Promise<Response>} Réponse JSON avec le résultat de la suppression ou une erreur.
 */
async function deleteOrder(req: Request, res: Response): Promise<Response> {
  const { platform, oId, symbol } = req.body;
  try {
    const data = await ordersService.deleteOrder(platform, oId, symbol);
    return res.json(data);
  } catch (error) {
    return handleErrorResponse(res, error, "deleteOrder");
  }
}

/**
 * Crée un ordre d'achat au marché.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 */
async function createMarketBuyOrder(req: Request, res: Response): Promise<void> {
  await createMarketOrder(req, res, "buy");
}

/**
 * Crée un ordre de vente au marché.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 */
async function createMarketSellOrder(req: Request, res: Response): Promise<void> {
  await createMarketOrder(req, res, "sell");
}

/**
 * Crée un ordre au marché (achat ou vente).
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 * @param {string} orderType - Le type d'ordre ("buy" ou "sell").
 * @returns {Promise<Response>} Réponse JSON avec le résultat de la création de l'ordre ou une erreur.
 */
async function createMarketOrder(req: Request, res: Response, orderType: string): Promise<Response> {
  const { platform, asset, amount } = req.body;
  try {
    const result = await ordersService.createMarketOrder(platform, asset, amount, orderType);
    return res.status(200).json({ message: result, status: 200 });
  } catch (error) {
    return handleErrorResponse(res, error, `createMarketOrder (${orderType})`);
  }
}

/**
 * Crée un ordre limite (achat ou vente).
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 * @param {string} orderType - Le type d'ordre ("buy" ou "sell").
 * @returns {Promise<Response>} Réponse JSON avec le résultat de la création de l'ordre ou une erreur.
 */
async function createLimitOrder(req: Request, res: Response, orderType: string): Promise<Response> {
  const { platform, price, amount, asset } = req.body;
  try {
    const result = await ordersService.createLimitOrder(platform, asset, amount, price, orderType);
    return res.status(200).json({ message: result, status: 200 });
  } catch (error) {
    console.log(`🚀 ~ file: ordersController.ts:63 ~ createLimitOrder ~ error:`, error);
    handleErrorResponse(res, error, `createLimitOrder (${orderType})`);
    return res.status(500).json({ error: "Une erreur est survenue lors de la création de l'ordre limite" });
  }
}

/**
 * Crée un groupe d'ordres de vente limite.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 */
async function createBunchLimitSellOrders(req: Request, res: Response): Promise<void> {
  await createLimitOrder(req, res, "sell");
}

/**
 * Crée un groupe d'ordres d'achat limite.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 */
async function createBunchLimitBuyOrders(req: Request, res: Response): Promise<void> {
  await createLimitOrder(req, res, "buy");
}

/**
 * Annule tous les ordres pour une plateforme et un actif spécifiques.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 * @returns {Promise<Response>} Réponse JSON avec le résultat de l'annulation ou une erreur.
 */
async function cancelAllOrders(req: Request, res: Response): Promise<Response> {
  const { platform, asset } = req.body;
  try {
    const result = await ordersService.cancelAllOrders(platform, asset);
    return res.status(200).json({ message: result, status: 200 });
  } catch (error) {
    return handleErrorResponse(res, error, "cancelAllOrders");
  }
}

/**
 * Annule tous les ordres de vente pour une plateforme et un actif spécifiques.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 * @returns {Promise<Response>} Réponse JSON avec le résultat de l'annulation ou une erreur.
 */
async function cancelAllSellOrders(req: Request, res: Response): Promise<Response> {
  const { platform, asset } = req.body;
  try {
    const result = await ordersService.cancelAllSellOrders(platform, asset);
    return res.status(200).json(result);
  } catch (error) {
    return handleErrorResponse(res, error, "cancelAllSellOrders");
  }
}

export {
  getOrders,
  updateOrders,
  deleteOrder,
  createBunchLimitSellOrders,
  createBunchLimitBuyOrders,
  cancelAllOrders,
  cancelAllSellOrders,
  createMarketBuyOrder,
  createMarketSellOrder,
};