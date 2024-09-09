import { Request, Response } from 'express';
import { handleErrorResponse } from '../utils/errorUtil';
import { errorLogger } from '../utils/loggerUtil';
import { validateEnvVariables } from '../utils/controllerUtil';
import * as marketsService from '../services/marketsService';

validateEnvVariables(["MONGODB_COLLECTION_LOAD_MARKETS", "TYPE_LOAD_MARKETS"]);

/**
 * Récupère les données de marché sauvegardées.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 */
async function getMarkets(req: Request, res: Response): Promise<void> {
  try {
    const data = await marketsService.getSavedMarkets();
    res.json(data);
  } catch (error: any) {
    errorLogger.error("Échec de la récupération des données de marché.", {
      error: (error as Error).message,
    });
    handleErrorResponse(res, error, "getMarkets");
  }
}

/**
 * Met à jour les données de marché pour une plateforme spécifique.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 */
async function updateMarkets(req: Request, res: Response): Promise<void> {
  const { platform } = req.params;
  try {
    const marketData = await marketsService.fetchMarketData(platform);
    const updatedData = await marketsService.updateMarketDataInDatabase(marketData, platform);
    res.status(200).json(updatedData);
  } catch (error:any) {
    console.log(
      `🚀 ~ file: marketsController.ts:175 ~ updateMarkets ~ error:`,
      error
    );
    handleErrorResponse(res, error, "updateMarkets");
  }
}

export {
  getMarkets,
  updateMarkets,
};