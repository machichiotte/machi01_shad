// src/controllers/strategyController.ts
import { Request, Response } from 'express';
import { handleErrorResponse } from "../utils/errorUtil";
import * as lastUpdateService from "../services/lastUpdateService";
import * as strategyService from "../services/strategyService";

/**
 * Récupère les stratégies de la base de données.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 */
async function getStrat(req: Request, res: Response): Promise<void> {
  try {
    const data = await strategyService.fetchDatabaseStrategies();
    res.json(data);
  } catch (error: any) {
    console.log(
      `🚀 ~ file: strategyController.ts:23 ~ getStrat ~ error:`,
      error
    );
    //console.error("Échec de la récupération des stratégies", { error: (error as Error).message });
    handleErrorResponse(res, error, "getStrat");
  }
}

/**
 * Met à jour les stratégies dans la base de données.
 * @param {Request} req - L'objet de requête contenant les données de stratégie dans le corps.
 * @param {Response} res - L'objet de réponse.
 */
async function updateStrat(req: Request, res: Response): Promise<void> {
  const strat = req.body;
  try {
    const data = await strategyService.updateStrategies(strat);
    await lastUpdateService.saveLastUpdateToDatabase(process.env.TYPE_STRATEGY as string, "");
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ updateStrat ~ err:", error);
    res.status(500).send({ error: `${(error as Error).name}: ${(error as Error).message}` });
  }
}

/**
 * Met à jour une stratégie spécifique par son ID.
 * @param {Request} req - L'objet de requête contenant l'ID de stratégie dans les paramètres et les données de stratégie mises à jour dans le corps.
 * @param {Response} res - L'objet de réponse.
 */
async function updateStrategyById(req: Request, res: Response): Promise<void> {
  const { strategyId } = req.params;
  const updatedStrategy = req.body;
  try {
    const result = await strategyService.updateStrategyById(strategyId, updatedStrategy);
    res.json(result);
  } catch (error: any) {
    handleErrorResponse(res, error, "updateStrategyById");
  }
}

export { getStrat, updateStrat, updateStrategyById };
