// src/controllers/tradesController.ts
import { Request, Response } from 'express'
import { TradesService } from '@services/tradesService'
import { handleControllerError } from '@utils/errorUtil'

/**
 * Récupère tous les trades de la base de données.
 */
async function getTrades(req: Request, res: Response): Promise<void> {
  try {
    const trades = await TradesService.fetchDatabaseTrades()
    res.status(200).json(trades)
  } catch (error) {
    handleControllerError(res, error as Error, 'getTrades')
  }
}

/**
 * Met à jour un trade spécifique par son ID.
 */
async function updateTradeById(req: Request, res: Response): Promise<void> {
  const { tradeId } = req.params
  const updatedTrade = req.body
  try {
    const result = await TradesService.updateTradeById(tradeId, updatedTrade)
    res.status(200).json(result)
  } catch (error) {
    handleControllerError(res, error as Error, 'updateTradeById')
  }
}

/**
 * Ajoute manuellement des trades à la base de données.
 */
async function addTradesManually(req: Request, res: Response): Promise<void> {
  const tradesData = req.body.trades_data
  try {
    const result = await TradesService.addTradesManually(tradesData)
    res.status(200).json(result)
  } catch (error) {
    handleControllerError(res, error as Error, 'addTradesManually')
  }
}

/**
 * Met à jour les trades pour une plateforme spécifique.
 */
async function updateTrades(req: Request, res: Response): Promise<void> {
  const { platform } = req.params
  try {
    const result = await TradesService.updateTrades(platform)
    res.status(200).json(result)
  } catch (error) {
    handleControllerError(res, error as Error, 'updateTrades')
  }
}

/**
 * Récupère les derniers trades pour une plateforme et un symbole spécifiques.
 */
async function fetchLastTrades(req: Request, res: Response): Promise<void> {
  const { platform, symbol } = req.params
  try {
    const trades = await TradesService.fetchLastTrades(platform, symbol)
    res.status(200).json(trades)
  } catch (error) {
    handleControllerError(res, error as Error, 'fetchLastTrades')
  }
}

/**
 * Sauvegarde de nouveaux trades dans la base de données.
 */
async function saveTradesToDatabase(
  req: Request,
  res: Response
): Promise<void> {
  const { newTrades } = req.body
  try {
    await TradesService.saveTradesToDatabase(newTrades)
    res.status(200).json({ message: 'Trades sauvegardés avec succès' })
  } catch (error) {
    handleControllerError(res, error as Error, 'saveTradesToDatabase')
  }
}

/**
 * Sauvegarde tous les nouveaux trades dans la base de données.
 */
async function saveAllTradesToDatabase(
  req: Request,
  res: Response
): Promise<void> {
  const { newTrades } = req.body
  try {
    await TradesService.saveAllTradesToDatabase(newTrades)
    res.status(200).json({ message: 'Tous les trades sauvegardés avec succès' })
  } catch (error) {
    handleControllerError(res, error as Error, 'saveAllTradesToDatabase')
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