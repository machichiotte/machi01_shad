// src/controllers/balanceController.ts

import { Request, Response } from 'express'
import { handleErrorResponse } from '@utils/errorUtil'
import BalanceService from '@services/balanceService'

/**
 * Récupère le dernier solde enregistré dans la base de données.
 * @param {Request} req - Objet de requête HTTP.
 * @param {Response} res - Objet de réponse HTTP.
 */
async function getBalances(req: Request, res: Response): Promise<void> {
  try {
    const data = await BalanceService.fetchDatabaseBalances()
    res.json(data)
  } catch (error) {
    handleErrorResponse(res, error as Error, 'getBalances')
  }
}

/**
 * Met à jour le solde actuel en le récupérant depuis une plateforme et en l'enregistrant dans la base de données.
 * @param {Request} req - Objet de requête HTTP contenant l'identifiant de la plateforme.
 * @param {Response} res - Objet de réponse HTTP.
 */
async function updateCurrentBalance(
  req: Request,
  res: Response
): Promise<void> {
  const platform = req.params.platform
  try {
    const data = await BalanceService.updateBalanceForPlatform(platform)
    res.status(200).json({
      status: true,
      message: 'Le solde actuel a été mis à jour avec succès.',
      data: data
    })
  } catch (error) {
    handleErrorResponse(res, error as Error, 'updateCurrentBalance')
  }
}

export { getBalances, updateCurrentBalance }
