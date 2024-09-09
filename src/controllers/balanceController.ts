// src/controllers/balanceController.ts

import { Request, Response } from 'express';
import * as balanceService from '../services/balanceService';
import { handleErrorResponse } from "../utils/errorUtil";

/**
 * Récupère le dernier solde enregistré dans la base de données.
 * @param {Request} req - Objet de requête HTTP.
 * @param {Response} res - Objet de réponse HTTP.
 */
async function getBalances(req: Request, res: Response): Promise<void> {
  try {
    const data = await balanceService.fetchDatabaseBalances();
    res.json(data);
  } catch (error: any) {
    handleErrorResponse(res, error, "getBalances");
  }
}

/**
 * Met à jour le solde actuel en le récupérant depuis une plateforme et en l'enregistrant dans la base de données.
 * @param {Request} req - Objet de requête HTTP contenant l'identifiant de la plateforme.
 * @param {Response} res - Objet de réponse HTTP.
 */
async function updateCurrentBalance(req: Request, res: Response): Promise<void> {
  const platform = req.params.platform;
  try {
    const data = await balanceService.updateBalanceForPlatform(platform);
    res.status(200).json({
      status: true,
      message: "Le solde actuel a été mis à jour avec succès.",
      data: data,
    });
  } catch (error: any) {
    handleErrorResponse(res, error, "updateCurrentBalance");
  }
}

export {
  getBalances,
  updateCurrentBalance,
};
