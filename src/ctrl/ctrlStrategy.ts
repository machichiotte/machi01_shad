// src/ctrl/ctrlStrategy.ts
import { Request, Response } from 'express'
import { handleControllerError } from '@utils/errorUtil'
import { ServiceStrategy } from '@services/api/database/serviceStrategy'
import { MappedStrat } from '@typ/strat'

/**
 * Récupère les stratégies de la base de données.
 */
async function getStrat(req: Request, res: Response): Promise<void> {
  try {
    const data = await ServiceStrategy.fetchDatabaseStrategies()
    res.status(200).json({ status: "success", message: 'Stratégies récupérées', data })
  } catch (error) {
    handleControllerError(res, error, getStrat.name)
  }
}

/**
 * Met à jour les stratégies dans la base de données.
 */
async function updateStrat(req: Request, res: Response): Promise<void> {
  try {
    const strat = req.body
    const data = await ServiceStrategy.updateStrategies(strat)
    res.status(200).json({ status: "success", message: 'Stratégies mises à jour', data })
  } catch (error) {
    handleControllerError(res, error, updateStrat.name)
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
    const data = await ServiceStrategy.updateStrategyById(updatedStrategy)
    res.json({ status: "success", message: `La strategie de ${updatedStrategy.base} a été mise à jour`, data })
  } catch (error) {
    handleControllerError(res, error, updateStrategyById.name)
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
      const result = await ServiceStrategy.updateStrategyById(strategy);
      results.push(result);
    } catch (error) {
      handleControllerError(res, error, updateStrategyById.name);
      return;
    }
  }

  res.status(200).json({ status: "success", message: 'Stratégies mises à jour', data: results });
}

export { getStrat, updateStrat, updateStrategyById, updateStrategyByIds }