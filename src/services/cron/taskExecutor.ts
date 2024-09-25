// src/services/cron/taskExecutor.ts
import { sendMail } from './emailService'
import { handleServiceError } from '@utils/errorUtil'

import { MarketService } from '@services/marketService'
import { TickerService } from '@services/tickerService'
import { BalanceService } from '@services/balanceService'

import { config } from '@config/index';
import { PLATFORM, PLATFORMS } from '@typ/platform'
/**
 * Executes a cron task with retry mechanism and error handling
 */
async function executeCronTask(task: () => Promise<void>, isCritical: boolean = false, retries: number = 3): Promise<void> {
  let attempts = 0
  while (attempts < retries) {
    try {
      await task()
      return
    } catch (error) {
      handleServiceError(error, 'executeCronTask', `Task execution failed`)
      if (isCritical) {
        if (attempts < retries - 1) {
          await new Promise((res) => setTimeout(res, 5000 * (attempts + 1)))
        } else {
          if (!config.smtp) {
            throw new Error('Configuration SMTP manquante')
          }

          sendMail({
            from: config.smtp.auth.user as string,
            to: config.smtp.auth.receiver as string,
            subject: 'Critical Error Alert',
            text: `Critical error in scheduled task: ${(error as Error).message}`
          })
        }
      }
      attempts++
    }
  }
}

/**
 * Executes a given task function for all platforms
 */
async function executeForPlatforms(
  taskName: string,
  taskFunction: (platform: PLATFORM) => Promise<void>
): Promise<void> {
  console.log(`Executing cron job for ${taskName}...`)
  await Promise.all(
    PLATFORMS.map((platform) =>
      executeCronTask(() => taskFunction(platform), true)
    )
  )
}

/**
 * Cron function for updating tickers across all platforms
 */
export async function cronTickers(): Promise<void> {
  await executeForPlatforms('updateTickers', TickerService.updateTickersForPlatform)
}

/**
 * Cron function for updating markets across all platforms
 */
export async function cronMarkets(): Promise<void> {
  await executeForPlatforms('updateMarkets', MarketService.updateMarketsForPlatform)
}

/**
 * Cron function for updating balances across all platforms
 */
export async function cronBalances(): Promise<void> {
  await executeForPlatforms('updateBalances', BalanceService.updateBalancesForPlatform)
}