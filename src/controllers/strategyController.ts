// src/controllers/strategyController.ts
import { Request, Response } from 'express'
import { handleControllerError } from '@utils/errorUtil'
import { LastUpdateService } from '@services/lastUpdateService'
import { StrategyService } from '@services/strategyService'

/**
 * Récupère les stratégies de la base de données.
 */
async function getStrat(req: Request, res: Response): Promise<void> {
  try {
    const data = await StrategyService.fetchDatabaseStrategies()
    res.json(data)
  } catch (error) {
    console.error(
      `🚀 ~ file: strategyController.ts:23 ~ getStrat ~ error:`,
      error
    )
    //console.error("Échec de la récupération des stratégies", { error: (error as Error).message });
    handleControllerError(res, error as Error, 'getStrat')
  }
}

/**
 * Met à jour les stratégies dans la base de données.
 */
async function updateStrat(req: Request, res: Response): Promise<void> {
  const strat = req.body
  try {
    const data = await StrategyService.updateStrategies(strat)
    await LastUpdateService.saveLastUpdateToDatabase(
      process.env.TYPE_STRATEGY as string,
      ''
    )
    res.json(data)
  } catch (error) {
    console.log('🚀 ~ updateStrat ~ err:', error)
    res
      .status(500)
      .send({ error: `${(error as Error).name}: ${(error as Error).message}` })
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
    handleControllerError(res, error as Error, 'updateStrategyById')
  }
}

export { getStrat, updateStrat, updateStrategyById }