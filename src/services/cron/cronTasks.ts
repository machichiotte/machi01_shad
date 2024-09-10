// src/services/cron/cronTasks.ts
import cron from 'node-cron'
import config from '../config'
import { errorLogger } from '@utils/loggerUtil'

import { cronTickers, cronMarkets, cronBalances } from './taskExecutor'

interface Task {
  schedule: string
  task: () => void
  name: string
}

/**
 * Initializes and schedules cron tasks for tickers, markets, and balances.
 *
 * This function sets up periodic tasks using node-cron to run at specified intervals.
 * It initializes tasks for updating tickers, markets, and balances based on the
 * schedules defined in the configuration.
 *
 * @async
 * @function initializeCronTasks
 * @throws {Error} If there's an error during the initialization process
 */
async function initializeCronTasks(): Promise<void> {
  try {
    console.log('Starting initialization of Cron tasks...')

    const tasks: Task[] = [
      {
        schedule: config.cronSchedules.tickers,
        task: cronTickers,
        name: 'Tickers'
      },
      {
        schedule: config.cronSchedules.markets,
        task: cronMarkets,
        name: 'Markets'
      },
      {
        schedule: config.cronSchedules.balances,
        task: cronBalances,
        name: 'Balances'
      }
    ]

    tasks.forEach(({ schedule, task, name }) => {
      cron.schedule(schedule, task)
      console.log(`Cron task initialized: ${name}`)
    })

    console.log('All Cron tasks have been successfully initialized.')
  } catch (error) {
    errorLogger.error('Error during Cron tasks initialization', { error })
    throw error
  }
}

export { initializeCronTasks }
