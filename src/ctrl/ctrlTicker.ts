// src/ctrl/tickerController.ts
import { Request, Response } from 'express'
import { handleControllerError } from '@utils/errorUtil'
import { ServiceTicker } from '@services/api/platform/serviceTicker'
import { isValidPlatform } from '@utils/platformUtil'

/**
 * Récupère tous les tickers de la base de données.
 */
async function getAllTickers(req: Request, res: Response): Promise<void> {
  try {
    const data = await ServiceTicker.fetchDatabaseTickers()
    res
      .status(200)
      .json({ status: 'success', message: 'Tickers récupérés', data })
  } catch (error) {
    handleControllerError(res, error, getAllTickers.name)
  }
}

/**
 * Récupère tous les tickers pour une plateforme spécifique.
 */
async function getAllTickersByPlatform(
  req: Request,
  res: Response
): Promise<void> {
  const { platform } = req.params

  if (!isValidPlatform(platform)) {
    res
      .status(400)
      .json({ message: `La plateforme '${platform}' n'est pas valide.` })
    return
  }

  try {
    const data = await ServiceTicker.getAllTickersByPlatform(platform)
    res
      .status(200)
      .json({ status: 'success', message: 'Tickers récupérés', data })
  } catch (error) {
    handleControllerError(res, error, getAllTickersByPlatform.name)
  }
}

/**
 * Récupère tous les tickers pour un symbole spécifique d'une plateforme spécifique.
 */
async function getAllTickersBySymbolFromPlatform(
  req: Request,
  res: Response
): Promise<void> {
  const { platform, symbol } = req.params

  if (!isValidPlatform(platform)) {
    res
      .status(400)
      .json({ message: `La plateforme '${platform}' n'est pas valide.` })
    return
  }

  try {
    const data = await ServiceTicker.getAllTickersBySymbolFromPlatform(
      platform,
      symbol
    )
    res
      .status(200)
      .json({ status: 'success', message: 'Tickers récupérés', data })
  } catch (error) {
    handleControllerError(res, error, getAllTickersBySymbolFromPlatform.name)
  }
}

/**
 * Met à jour tous les tickers dans la base de données.
 */
async function updateAllTickers(req: Request, res: Response): Promise<void> {
  try {
    const data = await ServiceTicker.updateAllTickers()
    res
      .status(200)
      .json({ status: 'success', message: 'Tickers mis à jour', data })
  } catch (error) {
    handleControllerError(res, error, updateAllTickers.name)
  }
}

/**
 * Récupère les derniers tickers pour une plateforme spécifiques.
 */
async function fetchLastTickers(req: Request, res: Response): Promise<void> {
  const { platform } = req.params

  if (!isValidPlatform(platform)) {
    res.status(400).json({ message: `La plateforme '${platform}' n'est pas valide.` });
    return;
  }

  try {
    const data = await ServiceTicker.fetchCurrentTickers(platform)
    res.status(200).json({ status: "success", message: 'Derniers tickers récupérés', data })
  } catch (error) {
    handleControllerError(res, error, 'fetchLastBalances')
  }
}

export {
  getAllTickers,
  getAllTickersByPlatform,
  getAllTickersBySymbolFromPlatform,
  updateAllTickers,
  fetchLastTickers
}
