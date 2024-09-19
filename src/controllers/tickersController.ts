// src/controllers/tickersController.ts
import { Request, Response } from 'express'
import { handleControllerError } from '@utils/errorUtil'
import { TickersService } from '@services/tickersService'

/**
 * Récupère tous les tickers de la base de données.
 */
async function getAllTickers(req: Request, res: Response): Promise<void> {
  try {
    const data = await TickersService.fetchDatabaseTickers()
    res.json(data)
  } catch (error) {
    handleControllerError(res, error as Error, 'getAllTickers')
  }
}

/**
 * Récupère tous les tickers pour une plateforme spécifique.
 */
async function getAllTickersByPlatform(req: Request, res: Response, platform: string): Promise<void> {
  try {
    const platformTickersData =
      await TickersService.getAllTickersByPlatform(platform)
    res.status(200).json(platformTickersData)
  } catch (error) {
    handleControllerError(res, error as Error, 'getAllTickersByPlatform')
  }
}

/**
 * Récupère tous les tickers pour un symbole spécifique d'une plateforme spécifique.
 */
async function getAllTickersBySymbolFromPlatform(req: Request, res: Response, platform: string, symbol: string): Promise<void> {
  try {
    const filteredTickersData =
      await TickersService.getAllTickersBySymbolFromPlatform(platform, symbol)
    res.status(200).json(filteredTickersData)
  } catch (error) {
    handleControllerError(res, error as Error, 'getAllTickersBySymbolFromPlatform')
  }
}

/**
 * Met à jour tous les tickers dans la base de données.
 */
async function updateAllTickers(req: Request, res: Response): Promise<void> {
  try {
    const tickersData = await TickersService.updateAllTickers()
    res.status(200).json(tickersData)
  } catch (error) {
    handleControllerError(res, error as Error, 'updateAllTickers')
  }
}

export {
  getAllTickers,
  getAllTickersByPlatform,
  getAllTickersBySymbolFromPlatform,
  updateAllTickers
}