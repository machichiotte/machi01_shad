// src/ctrl/ctrlTrade.ts
import { Request, Response } from 'express'
import { ServiceTrade } from '@services/api/platform/serviceTrade'
import { handleControllerError } from '@utils/errorUtil'
import { isValidPlatform } from '@utils/platformUtil'
import { MappedTrade } from '@typ/trade'

/**
 * Récupère tous les trades de la base de données.
 */
async function getTrades(req: Request, res: Response): Promise<void> {
  try {
    const data = await ServiceTrade.fetchFromDb()
    res.status(200).json({ status: "success", message: 'Trades récupérés', data })
  } catch (error) {
    handleControllerError(res, error, 'getTrades')
  }
}

/**
 * Met à jour un trade spécifique par son ID.
 */
async function updateById(req: Request, res: Response): Promise<void> {
  //TODO modifier front const { tradeId } = req.params
  const updatedTrade = req.body as MappedTrade
  if (!updatedTrade._id) {
    throw new Error(`L'ID du trade est requis`)
  }

  try {
    const data = await ServiceTrade.updateById(updatedTrade)
    res.status(200).json({ status: "success", message: `Trade ${updatedTrade._id} mis à jour`, data })
  } catch (error) {
    handleControllerError(res, error, 'updateById')
  }
}

/**
 * Ajoute manuellement des trades à la base de données.
 */
async function insertNewTrades(req: Request, res: Response): Promise<void> {
  const tradesData = req.body.trades_data
  try {
    const data = await ServiceTrade.insertNewTrades(tradesData)
    res.status(200).json({ status: "success", message: 'Trades ajoutés', data })
  } catch (error) {
    handleControllerError(res, error, 'insertNewTrades')
  }
}

/**
 * Met à jour les trades pour une plateforme spécifique.
 */
async function updateTradesByPlatform(req: Request, res: Response): Promise<void> {
  const { platform } = req.params

  if (!isValidPlatform(platform)) {
    res.status(400).json({ message: `La plateforme '${platform}' n'est pas valide.` });
    return;
  }

  try {
    const data = await ServiceTrade.updateTrades(platform)
    res.status(200).json({ status: "success", message: 'Trades mis à jour', data })
  } catch (error) {
    handleControllerError(res, error, 'updateTrades')
  }
}

/**
 * Récupère les derniers trades pour une plateforme et un symbole spécifiques.
 */
async function fetchLastTrades(req: Request, res: Response): Promise<void> {
  const { platform, base } = req.params

  if (!isValidPlatform(platform)) {
    res.status(400).json({ message: `La plateforme '${platform}' n'est pas valide.` });
    return;
  }

  try {
    const data = await ServiceTrade.fetchFromApi(platform, base)
    res.status(200).json({ status: "success", message: 'Derniers trades récupérés', data })
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
    await ServiceTrade.saveTradesToDatabase(newTrades)
    res.status(200).json({ status: "success", message: 'Trades sauvegardés avec succès' })
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
    await ServiceTrade.saveTradesToDatabase(newTrades)
    res.status(200).json({ status: "success", message: 'Tous les trades sauvegardés avec succès' })
  } catch (error) {
    handleControllerError(res, error, 'saveAllTradesToDatabase')
  }
}

export {
  updateById,
  getTrades,
  insertNewTrades,
  updateTradesByPlatform,
  fetchLastTrades,
  saveTradesToDatabase,
  saveAllTradesToDatabase
}