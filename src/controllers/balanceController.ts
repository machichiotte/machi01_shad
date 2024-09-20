// src/controllers/balanceController.ts
import { Request, Response } from 'express'
import { handleControllerError } from '@utils/errorUtil'
import { BalanceService } from '@src/services/balanceService'

/**
 * Récupère le dernier solde enregistré dans la base de données.
 */
async function getBalances(req: Request, res: Response): Promise<void> {
  try {
    const data = await BalanceService.fetchDatabaseBalances()
    res.status(200).json({
      message: 'Le solde en base de données a été récupéré avec succès.',
      data: data
    })
  } catch (error) {
    handleControllerError(res, error, 'getBalances')
  }
}

/**
 * Met à jour le solde actuel en le récupérant depuis une plateforme et en l'enregistrant dans la base de données.
 */
async function updateCurrentBalance(req: Request, res: Response): Promise<void> {
  const platform = req.params.platform
  try {
    const data = await BalanceService.updateBalanceForPlatform(platform)
    res.status(200).json({
      message: 'Le solde actuel a été mis à jour avec succès.',
      data: data
    })
  } catch (error) {
    handleControllerError(res, error, 'updateCurrentBalance')
  }
}

export { getBalances, updateCurrentBalance }