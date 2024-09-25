// src/controllers/tradeController.ts
import { Request, Response } from 'express'
import { TradeService } from '@services/tradeService'
import { handleControllerError } from '@utils/errorUtil'
import { isValidPlatform } from '@src/utils/platformUtil'

/**
 * Récupère tous les trades de la base de données.
 */
async function getTrades(req: Request, res: Response): Promise<void> {
  try {
    const data = await TradeService.fetchDatabaseTrades()
    res.status(200).json({ message: 'Trades récupérés', data })
  } catch (error) {
    handleControllerError(res, error, 'getTrades')
  }
}

/**
 * Met à jour un trade spécifique par son ID.
 */
async function updateTradeById(req: Request, res: Response): Promise<void> {
  const { tradeId } = req.params
  const updatedTrade = req.body
  try {
    const data = await TradeService.updateTradeById(tradeId, updatedTrade)
    res.status(200).json({ message: `Trade ${tradeId} mis à jour`, data })
  } catch (error) {
    handleControllerError(res, error, 'updateTradeById')
  }
}

/**
 * Ajoute manuellement des trades à la base de données.
 */
async function addTradesManually(req: Request, res: Response): Promise<void> {
  const tradesData = req.body.trades_data
  try {
    const data = await TradeService.addTradesManually(tradesData)
    res.status(200).json({ message: 'Trades ajoutés', data })
  } catch (error) {
    handleControllerError(res, error, 'addTradesManually')
  }
}

/**
 * Met à jour les trades pour une plateforme spécifique.
 */
async function updateTrades(req: Request, res: Response): Promise<void> {
  const { platform } = req.params

  if (!isValidPlatform(platform)) {
    res.status(400).json({ message: `La plateforme '${platform}' n'est pas valide.` });
    return;
  }

  try {
    const data = await TradeService.updateTrades(platform)
    res.status(200).json({ message: 'Trades mis à jour', data })
  } catch (error) {
    handleControllerError(res, error, 'updateTrades')
  }
}

/**
 * Récupère les derniers trades pour une plateforme et un symbole spécifiques.
 */
async function fetchLastTrades(req: Request, res: Response): Promise<void> {
  const { platform, symbol } = req.params

  if (!isValidPlatform(platform)) {
    res.status(400).json({ message: `La plateforme '${platform}' n'est pas valide.` });
    return;
  }

  try {
    const data = await TradeService.fetchLastTrades(platform, symbol)
    res.status(200).json({ message: 'Derniers trades récupérés', data })
  } catch (error) {
    handleControllerError(res, error, 'fetchLastTrades')
  }
}

/**
 * Sauvegarde de nouveaux trades dans la base de données.
 */
async function saveTradesToDatabase(req: Request, res: Response): Promise<void> {
  const { newTrades } = req.body
  try {
    await TradeService.saveTradesToDatabase(newTrades)
    res.status(200).json({ message: 'Trades sauvegardés avec succès' })
  } catch (error) {
    handleControllerError(res, error, 'saveTradesToDatabase')
  }
}

/**
 * Sauvegarde tous les nouveaux trades dans la base de données.
 */
async function saveAllTradesToDatabase(req: Request, res: Response): Promise<void> {
  const { newTrades } = req.body
  try {
    await TradeService.saveTradesToDatabase(newTrades)
    res.status(200).json({ message: 'Tous les trades sauvegardés avec succès' })
  } catch (error) {
    handleControllerError(res, error, 'saveAllTradesToDatabase')
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