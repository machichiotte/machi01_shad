// src/services/cron/updateFunctions.ts

/**
 * This module contains functions for updating markets, tickers, and balances for a given platform.
 * It uses various services to fetch, compare, and save data to the database.
 */
import { deleteAndReplaceAll } from '@services/mongodbService'

import {
  MarketsService
} from '@services/marketsService'
import {
  processBalanceChanges,
  compareBalances,
  calculateAllMetrics
} from '@services/processorService'
import {
  TickersService
} from '@services/tickersService'
import {
  BalancesService
} from '@services/balancesService'

/**
 * Updates the markets for a specified platform.
 * @param {string} platform - The platform to update markets for.
 */
async function updateMarketsForPlatform(platform: string): Promise<void> {
  try {
    const currentMarkets = await MarketsService.fetchCurrentMarkets(platform, 3)
    await MarketsService.saveDatabaseMarkets(currentMarkets, platform)
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour des marchés pour ${platform}:`,
      error
    )
  }
}

/**
 * Updates the tickers for a specified platform.
 * @param {string} platform - The platform to update tickers for.
 */
async function updateTickersForPlatform(platform: string): Promise<void> {
  try {
    const currentTickers = await TickersService.fetchCurrentTickers(platform, 3)
    await TickersService.saveDatabaseTickers(currentTickers, platform)
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour des tickers pour ${platform}:`,
      error
    )
  }
}

/**
 * Updates the balances for a specified platform, compares with previous balances,
 * and processes any changes. Also calculates and saves metrics.
 * @param {string} platform - The platform to update balances for.
 */
async function updateBalancesForPlatform(platform: string): Promise<void> {
  try {
    const [currentBalances, previousBalances] = await Promise.all([
      BalancesService.fetchCurrentBalancesByPlatform(platform, 3),
      BalancesService.fetchDatabaseBalancesByPlatform(platform, 3)
    ])

    const differences = compareBalances(previousBalances, currentBalances)
    if (differences.length > 0) {
      console.log(
        `Différences de solde détectées pour ${platform}:`,
        differences
      )
      await Promise.all([
        BalancesService.saveDatabaseBalance(currentBalances, platform),
        processBalanceChanges(differences, platform)
      ])
    }

    const collectionName = process.env.MONGODB_COLLECTION_SHAD as string
    const metrics = await calculateAllMetrics()
    await deleteAndReplaceAll(collectionName, metrics)
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour des soldes pour ${platform}:`,
      error
    )
  }
}

export {
  updateMarketsForPlatform,
  updateTickersForPlatform,
  updateBalancesForPlatform
}
