// src/controllers/strategyController.ts
import { Request, Response } from 'express'
import { handleControllerError } from '@utils/errorUtil'
import { StrategyService } from '@services/strategyService'
import { MappedStrat } from '@src/types/strat'

/**
 * Récupère les stratégies de la base de données.
 */
async function getStrat(req: Request, res: Response): Promise<void> {
  try {
    const data = await StrategyService.fetchDatabaseStrategies()
    res.status(200).json({ status: "success", message: 'Stratégies récupérées', data })
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
    res.status(200).json({ status: "success", message: 'Stratégies mises à jour', data })
  } catch (error) {
    handleControllerError(res, error, 'updateStrat')
  }
}

/**
 * Met à jour une stratégie spécifique par son ID.
 */
async function updateStrategyById(req: Request, res: Response): Promise<void> {
  //TODO changer ca dans le front const { strategyId } = req.params
  //const { strategyId } = req.params
  const updatedStrategy = req.body.data as MappedStrat
  try {
    const data = await StrategyService.updateStrategyById(updatedStrategy)
    res.json({ status: "success", message: `La strategie de ${updatedStrategy.asset} a été mise à jour`, data })
  } catch (error) {
    handleControllerError(res, error, 'updateStrategyById')
  }
}

/**
 * Met à jour une stratégie spécifique par son ID.
 */
async function updateStrategyByIds(req: Request, res: Response): Promise<void> {
  const updatedStrategies = req.body.data as MappedStrat[];
  const results = [];

  for (const strategy of updatedStrategies) {
    try {
      const result = await StrategyService.updateStrategyById(strategy);
      results.push(result);
    } catch (error) {
      handleControllerError(res, error, 'updateStrategyById');
      return;
    }
  }

  res.status(200).json({ status: "success", message: 'Stratégies mises à jour', data: results });
}

export { getStrat, updateStrat, updateStrategyById, updateStrategyByIds }