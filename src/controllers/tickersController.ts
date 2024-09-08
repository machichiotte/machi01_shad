// src/controllers/tickersController.ts
import { Request, Response } from 'express';
import { handleErrorResponse } from "../utils/errorUtil";
import * as tickersService from '../services/tickersService';

/**
 * Récupère tous les tickers de la base de données.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 */
async function getAllTickers(req: Request, res: Response): Promise<void> {
  try {
    const data = await tickersService.fetchDatabaseTickers();
    res.json(data);
  } catch (error) {
    handleErrorResponse(res, error, "getAllTickers");
  }
}

/**
 * Récupère tous les tickers pour une plateforme spécifique.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 * @param {string} platform - La plateforme pour laquelle récupérer les tickers.
 */
async function getAllTickersByPlatform(req: Request, res: Response, platform: string): Promise<void> {
  try {
    const platformTickersData = await tickersService.getAllTickersByPlatform(platform);
    res.status(200).json(platformTickersData);
  } catch (error) {
    handleErrorResponse(res, error, "getAllTickersByPlatform");
  }
}

/**
 * Récupère tous les tickers pour un symbole spécifique d'une plateforme spécifique.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 * @param {string} platform - La plateforme à partir de laquelle récupérer les tickers.
 * @param {string} symbol - Le symbole pour filtrer les tickers.
 */
async function getAllTickersBySymbolFromPlatform(req: Request, res: Response, platform: string, symbol: string): Promise<void> {
  try {
    const filteredTickersData = await tickersService.getAllTickersBySymbolFromPlatform(platform, symbol);
    res.status(200).json(filteredTickersData);
  } catch (error) {
    handleErrorResponse(res, error, "getAllTickersBySymbolFromPlatform");
  }
}

/**
 * Met à jour tous les tickers dans la base de données.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 */
async function updateAllTickers(req: Request, res: Response): Promise<void> {
  try {
    const tickersData = await tickersService.updateAllTickers();
    res.status(200).json(tickersData);
  } catch (error) {
    handleErrorResponse(res, error, "updateAllTickers");
  }
}

export {
  getAllTickers,
  getAllTickersByPlatform,
  getAllTickersBySymbolFromPlatform,
  updateAllTickers,
};