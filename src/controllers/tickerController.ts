// src/controllers/tickerController.ts
import { Request, Response } from 'express'
import { handleControllerError } from '@utils/errorUtil'
import { TickerService } from '@src/services/tickerService'

/**
 * Récupère tous les tickers de la base de données.
 */
async function getAllTickers(req: Request, res: Response): Promise<void> {
  try {
    const data = await TickerService.fetchDatabaseTickers()
    res.status(200).json({ message: 'Tickers récupérés', data })
  } catch (error) {
    handleControllerError(res, error, 'getAllTickers')
  }
}

/**
 * Récupère tous les tickers pour une plateforme spécifique.
 */
async function getAllTickersByPlatform(req: Request, res: Response): Promise<void> {
  const { platform } = req.params
  try {
    const data = await TickerService.getAllTickersByPlatform(platform)
    res.status(200).json({ message: 'Tickers récupérés', data })
  } catch (error) {
    handleControllerError(res, error, 'getAllTickersByPlatform')
  }
}

/**
 * Récupère tous les tickers pour un symbole spécifique d'une plateforme spécifique.
 */
async function getAllTickersBySymbolFromPlatform(req: Request, res: Response): Promise<void> {
  const { platform, symbol } = req.params
  try {
    const data = await TickerService.getAllTickersBySymbolFromPlatform(platform, symbol)
    res.status(200).json({ message: 'Tickers récupérés', data })
  } catch (error) {
    handleControllerError(res, error, 'getAllTickersBySymbolFromPlatform')
  }
}

/**
 * Met à jour tous les tickers dans la base de données.
 */
async function updateAllTickers(req: Request, res: Response): Promise<void> {
  try {
    const data = await TickerService.updateAllTickers()
    res.status(200).json({ message: 'Tickers mis à jour', data })
  } catch (error) {
    handleControllerError(res, error, 'updateAllTickers')
  }
}

export {
  getAllTickers,
  getAllTickersByPlatform,
  getAllTickersBySymbolFromPlatform,
  updateAllTickers
}