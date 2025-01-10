// src/ctrl/balanceController.ts
import { Request, Response } from 'express'
import { handleControllerError } from '@utils/errorUtil'
import { ServiceBalance } from '@services/api/platform/serviceBalance'
import { PLATFORM } from '@typ/platform'
import { PLATFORMS } from '@src/constants/platform'

/** 
 * Récupère le dernier solde enregistré dans la base de données.
 */
async function getBalances(req: Request, res: Response): Promise<void> {
  try {
    const data = await ServiceBalance.fetchDatabaseBalance()
    res.status(200).json({
      status: "success",
      message: 'Le solde en base de données a été récupéré avec succès.',
      data: data
    })
  } catch (error) {
    handleControllerError(res, error, getBalances.name)
  }
}

/**
 * Met à jour le solde actuel en le récupérant depuis une plateforme et en l'enregistrant dans la base de données.
 */
async function updateCurrentBalance(req: Request, res: Response): Promise<void> {
  const platform = req.params.platform as PLATFORM //ici je veux m'assurer que c'est bien une des plateforme que je possede

  if (!PLATFORMS.includes(platform)) {
    res.status(400).json({
      status: "error",
      message: `La plateforme ${platform} n'est pas supportée. Veuillez spécifier une plateforme valide.`,
    })
  }

  try {
    const data = await ServiceBalance.updateBalanceForPlatform(platform)
    res.status(200).json({
      status: "success",
      message: 'Le solde actuel a été mis à jour avec succès.',
      data: data
    })
  } catch (error) {
    handleControllerError(res, error, updateCurrentBalance.name)
  }
}

export { getBalances, updateCurrentBalance }