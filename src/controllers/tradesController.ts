// src/controllers/tradesController.ts
import { Request, Response } from 'express'
import * as tradesService from '@services/tradesService'
import { handleErrorResponse } from '@utils/errorUtil'

/**
 * Récupère tous les trades de la base de données.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 */
async function getTrades(req: Request, res: Response): Promise<void> {
  try {
    const trades = await tradesService.fetchDatabaseTrades()
    res.json(trades)
  } catch (error: any) {
    handleErrorResponse(res, error, 'getTrades')
  }
}

/**
 * Met à jour un trade spécifique par son ID.
 * @param {Request} req - L'objet de requête contenant le tradeId dans les paramètres et les données mises à jour dans le corps.
 * @param {Response} res - L'objet de réponse.
 */
async function updateTradeById(req: Request, res: Response): Promise<void> {
  const { tradeId } = req.params
  const updatedTrade = req.body
  try {
    const result = await tradesService.updateTradeById(tradeId, updatedTrade)
    res.json(result)
  } catch (error: any) {
    handleErrorResponse(res, error, 'updateTradeById')
  }
}

/**
 * Ajoute manuellement des trades à la base de données.
 * @param {Request} req - L'objet de requête contenant les données des trades dans le corps.
 * @param {Response} res - L'objet de réponse.
 */
async function addTradesManually(req: Request, res: Response): Promise<void> {
  const tradesData = req.body.trades_data
  try {
    const result = await tradesService.addTradesManually(tradesData)
    res.status(result.status).json(result)
  } catch (error: any) {
    handleErrorResponse(res, error, 'addTradesManually')
  }
}

/**
 * Met à jour les trades pour une plateforme spécifique.
 * @param {Request} req - L'objet de requête contenant la plateforme dans les paramètres.
 * @param {Response} res - L'objet de réponse.
 */
async function updateTrades(req: Request, res: Response): Promise<void> {
  const { platform } = req.params
  try {
    const result = await tradesService.updateTrades(platform)
    res.status(result.status).json(result)
  } catch (error: any) {
    handleErrorResponse(res, error, 'updateTrades')
  }
}

/**
 * Récupère les derniers trades pour une plateforme et un symbole spécifiques.
 * @param {Request} req - L'objet de requête contenant la plateforme et le symbole dans les paramètres.
 * @param {Response} res - L'objet de réponse.
 */
async function fetchLastTrades(req: Request, res: Response): Promise<void> {
  const { platform, symbol } = req.params
  try {
    const trades = await tradesService.fetchLastTrades(platform, symbol)
    res.json(trades)
  } catch (error: any) {
    handleErrorResponse(res, error, 'fetchLastTrades')
  }
}

/**
 * Sauvegarde de nouveaux trades dans la base de données.
 * @param {Request} req - L'objet de requête contenant les nouveaux trades dans le corps.
 * @param {Response} res - L'objet de réponse.
 */
async function saveTradesToDatabase(
  req: Request,
  res: Response
): Promise<void> {
  const { newTrades } = req.body
  try {
    await tradesService.saveTradesToDatabase(newTrades)
    res.status(200).json({ message: 'Trades sauvegardés avec succès' })
  } catch (error: any) {
    handleErrorResponse(res, error, 'saveTradesToDatabase')
  }
}

/**
 * Sauvegarde tous les nouveaux trades dans la base de données.
 * @param {Request} req - L'objet de requête contenant tous les nouveaux trades dans le corps.
 * @param {Response} res - L'objet de réponse.
 */
async function saveAllTradesToDatabase(
  req: Request,
  res: Response
): Promise<void> {
  const { newTrades } = req.body
  try {
    await tradesService.saveAllTradesToDatabase(newTrades)
    res.status(200).json({ message: 'Tous les trades sauvegardés avec succès' })
  } catch (error: any) {
    handleErrorResponse(res, error, 'saveAllTradesToDatabase')
  }
}

export {
  updateTradeById,
  getTrades,
  addTradesManually,
  updateTrades,
  fetchLastTrades,
  saveTradesToDatabase,
  saveAllTradesToDatabase
}
