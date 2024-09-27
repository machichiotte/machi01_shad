// src/services/cron/cronTasksService.ts
import cron from 'node-cron'
import { handleServiceError } from '@utils/errorUtil'
import { config } from '@config/index';

import { TickerService } from '@services/tickerService'
import { MarketService } from '@services/marketService'
import { BalanceService } from '@services/balanceService'

import { Task } from '@src/types/cron';

export class CronTaskService {
  /**
   * Initializes and schedules cron tasks for tickers, markets, and balances.
   *
   * This function sets up periodic tasks using node-cron to run at specified intervals.
   * It initializes tasks for updating tickers, markets, and balances based on the
   * schedules defined in the configuration.
   */
  static async initializeCronTasks(): Promise<void> {
    try {
      console.log('Starting initialization of Cron tasks...')

      const tasks: Task[] = [
        {
          schedule: config.cronSchedules.ticker,
          task: TickerService.cronTicker,
          name: 'Tickers'
        },
        {
          schedule: config.cronSchedules.market,
          task: MarketService.cronMarket,
          name: 'Markets'
        },
        {
          schedule: config.cronSchedules.balance,
          task: BalanceService.cronBalance,
          name: 'Balances'
        }
      ]

      tasks.forEach(({ schedule, task, name }) => {
        cron.schedule(schedule, task)
        console.log(`Cron task initialized: ${name}`)
      })

      console.log('All Cron tasks have been successfully initialized.')
    } catch (error) {
      handleServiceError(error, 'initializeCronTasks', `Error initializing Cron tasks`)
      throw error
    }
  }
}