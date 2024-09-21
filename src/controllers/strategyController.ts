// src/controllers/strategyController.ts
import { Request, Response } from 'express'
import { handleControllerError } from '@utils/errorUtil'
import { LastUpdateService } from '@services/lastUpdateService'
import { StrategyService } from '@services/strategyService'
import config from '@config/index'

/**
 * Récupère les stratégies de la base de données.
 */
async function getStrat(req: Request, res: Response): Promise<void> {
  try {
    const data = await StrategyService.fetchDatabaseStrategies()
    res.status(200).json({ message: 'Stratégies récupérées', data })
  } catch (error) {
    handleControllerError(res, error, 'getStrat')
  }
}

/**
 * Met à jour les stratégies dans la base de données.
 */
async function updateStrat(req: Request, res: Response): Promise<void> {
  try {
    const strat = req.body
    const data = await StrategyService.updateStrategies(strat)
    await LastUpdateService.saveLastUpdateToDatabase(
      config.collectionType?.strat ?? '',
      ''
    )
    res.status(200).json({ message: 'Stratégies mises à jour', data })
  } catch (error) {
    handleControllerError(res, error, 'updateStrat')
  }
}

/**
 * Met à jour une stratégie spécifique par son ID.
 */
async function updateStrategyById(req: Request, res: Response): Promise<void> {
  const { strategyId } = req.params
  const updatedStrategy = req.body
  try {
    const result = await StrategyService.updateStrategyById(
      strategyId,
      updatedStrategy
    )
    res.json(result)
  } catch (error) {
    handleControllerError(res, error, 'updateStrategyById')
  }
}

export { getStrat, updateStrat, updateStrategyById }