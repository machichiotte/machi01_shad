// src/controllers/balanceController.ts
import { Request, Response } from 'express'
import { handleControllerError } from '@utils/errorUtil'
import { BalanceService } from '@services/balanceService'
import { PLATFORM, PLATFORMS } from '@typ/platform'
/**
 * Récupère le dernier solde enregistré dans la base de données.
 */
async function getBalances(req: Request, res: Response): Promise<void> {
  try {
    const data = await BalanceService.fetchDatabaseBalance()
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
  const platform = req.params.platform as PLATFORM //ici je veux m'assurer que c'est bien une des plateforme que je possede

  if (!PLATFORMS.includes(platform)) {
    res.status(400).json({
      message: `La plateforme ${platform} n'est pas supportée. Veuillez spécifier une plateforme valide.`,
    })
  }

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