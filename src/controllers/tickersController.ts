// src/controllers/tickersController.ts
import { Request, Response } from 'express'
import { handleErrorResponse } from '@utils/errorUtil'
import { TickersService } from '@services/tickersService'

/**
 * Récupère tous les tickers de la base de données.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 */
async function getAllTickers(req: Request, res: Response): Promise<void> {
  try {
    const data = await TickersService.fetchDatabaseTickers()
    res.json(data)
  } catch (error) {
    handleErrorResponse(res, error as Error, 'getAllTickers')
  }
}

/**
 * Récupère tous les tickers pour une plateforme spécifique.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 * @param {string} platform - La plateforme pour laquelle récupérer les tickers.
 */
async function getAllTickersByPlatform(
  req: Request,
  res: Response,
  platform: string
): Promise<void> {
  try {
    const platformTickersData =
      await TickersService.getAllTickersByPlatform(platform)
    res.status(200).json(platformTickersData)
  } catch (error) {
    handleErrorResponse(res, error as Error, 'getAllTickersByPlatform')
  }
}

/**
 * Récupère tous les tickers pour un symbole spécifique d'une plateforme spécifique.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 * @param {string} platform - La plateforme à partir de laquelle récupérer les tickers.
 * @param {string} symbol - Le symbole pour filtrer les tickers.
 */
async function getAllTickersBySymbolFromPlatform(
  req: Request,
  res: Response,
  platform: string,
  symbol: string
): Promise<void> {
  try {
    const filteredTickersData =
      await TickersService.getAllTickersBySymbolFromPlatform(platform, symbol)
    res.status(200).json(filteredTickersData)
  } catch (error) {
    handleErrorResponse(res, error as Error, 'getAllTickersBySymbolFromPlatform')
  }
}

/**
 * Met à jour tous les tickers dans la base de données.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 */
async function updateAllTickers(req: Request, res: Response): Promise<void> {
  try {
    const tickersData = await TickersService.updateAllTickers()
    res.status(200).json(tickersData)
  } catch (error) {
    handleErrorResponse(res, error as Error, 'updateAllTickers')
  }
}

export {
  getAllTickers,
  getAllTickersByPlatform,
  getAllTickersBySymbolFromPlatform,
  updateAllTickers
}
