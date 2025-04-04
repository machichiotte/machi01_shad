// src/ctrl/ctrlCmc.ts
import { Request, Response } from 'express'
import { handleControllerError } from '@utils/errorUtil'
import { ServiceCmc } from '@services/api/serviceCmc'

/**
 * Récupère les dernières données CoinMarketCap de la base de données.
 */
async function getCmc(req: Request, res: Response): Promise<void> {
  try {
    const data = await ServiceCmc.fetchDatabaseCmc()
    res.status(200).json({
      status: "success",
      message: 'Données CMC récupérées avec succès',
      data
    })
  } catch (error) {
    handleControllerError(res, error, getCmc.name)
  }
}

/**
 * Met à jour les données CoinMarketCap en récupérant les dernières informations de l'API CoinMarketCap et en les sauvegardant dans la base de données.
 */
async function updateCmc(req: Request, res: Response): Promise<void> {
  try {
    const data = await ServiceCmc.updateCmcData()
    res.status(200).json({
      status: "success",
      message: 'Données CMC mises à jour avec succès',
      data,
    })
  } catch (error) {
    handleControllerError(res, error, updateCmc.name)
  }
}

/**
 * Récupère le dernier cmc.
 */
async function fetchLastCmc(req: Request, res: Response): Promise<void> {

  try {
    const data = await ServiceCmc.fetchCurrentCmc()
    res.status(200).json({ status: "success", message: 'Données Cmc récupérées', data })
  } catch (error) {
    handleControllerError(res, error, 'fetchLastTrades')
  }
}

export { getCmc, updateCmc, fetchLastCmc }