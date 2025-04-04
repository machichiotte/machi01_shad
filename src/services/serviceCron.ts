// src/services/serviceCron.ts
import cron from 'node-cron'
import { MARKETS, TICKERS, BALANCES, CMC } from '@src/constants/collection'
import { handleServiceError } from '@utils/errorUtil'
import { checkApiKeys } from '@utils/platformUtil'

import { ServiceCmc } from '@services/api/serviceCmc'
import { ServiceTicker } from '@services/api/platform/serviceTicker'
import { ServiceMarket } from '@services/api/platform/serviceMarket'
import { ServiceBalance } from '@services/api/platform/serviceBalance'
import { ServiceRssProcessor } from '@services/content/serviceRssProcessor' // Importer le nouveau service

import { Task } from '@typ/cron'
import { PLATFORMS } from '@src/constants/platform'

import { config } from '@config/index'

export class ServiceCron {
  static async initializeCronTasks(): Promise<void> {
    try {
      console.info('[ServiceCron] Starting initialization of Cron tasks...')

      const initializedTasks: string[] = [] // Tâches initialisées avec succès
      const failedTasks: string[] = [] // Tâches ayant échoué

      // Vérifie les plateformes valides via leurs clés API
      const validPlatforms = PLATFORMS.filter((platform) =>
        checkApiKeys(platform)
      )

      // Tâches basées sur les plateformes
      const platformTasks: Task[] = [
        {
          schedule: config.serverConfig.cronSchedules.ticker,
          task: ServiceTicker.cronTicker,
          name: TICKERS
        },
        {
          schedule: config.serverConfig.cronSchedules.market,
          task: ServiceMarket.cronMarket,
          name: MARKETS
        },
        {
          schedule: config.serverConfig.cronSchedules.balance,
          task: ServiceBalance.cronBalance,
          name: BALANCES
        }
      ]

      // Tâches non liées aux plateformes (par exemple, CMC)
      const generalTasks: Task[] = [
        {
          schedule: config.serverConfig.cronSchedules.cmc,
          task: ServiceCmc.updateCmcData,
          name: CMC
        },
        {
          schedule: config.serverConfig.cronSchedules.rss, // Utilise la nouvelle config
          task: ServiceRssProcessor.processAllFeeds, // Référence à la fonction
          name: 'RSS'
        }
      ]

      // Planifie les tâches basées sur les plateformes
      platformTasks.forEach(({ schedule, task, name }) => {
        try {
          validPlatforms.forEach((platform) => {
            cron.schedule(schedule, async () => {
              const startTime = Date.now()

              try {
                await task(platform) // Appelle la tâche avec l'argument platform
                const duration = Date.now() - startTime
                console.info(
                  `[ServiceCron] Platform Task ${name} executed successfully in ${duration}ms.`
                )
              } catch (err) {
                handleServiceError(
                  err,
                  `CronTaskService: ${name}`,
                  `Failed task for platform: ${platform}`
                )
              }
            })
          })
          initializedTasks.push(name)
        } catch (error) {
          failedTasks.push(name)
          handleServiceError(
            error,
            `CronTaskService: ${name}`,
            `Failed to initialize cron task for platforms: ${name}`
          )
        }
      })

      // Planifie les tâches générales
      generalTasks.forEach(({ schedule, task, name }) => {
        try {
          cron.schedule(schedule, async () => {
            const startTime = Date.now()

            try {
              if (task.length > 0) {
                // Si `task` attend des arguments, passez une valeur par défaut ou adaptez ici
                console.warn(
                  `[ServiceCron] General Task ${name} cannot be executed without arguments.`
                )
              } else {
                await (task as () => void)()
                const duration = Date.now() - startTime
                console.info(
                  `[ServiceCron] General Task ${name} executed successfully in ${duration}ms.`
                )
              }
            } catch (error) {
              handleServiceError(
                error,
                `CronTaskService: ${name}`,
                `Error executing task: ${name}`
              )
            }
          })
          initializedTasks.push(name)
        } catch (error) {
          failedTasks.push(name)
          handleServiceError(
            error,
            `CronTaskService: ${name}`,
            `Failed to initialize general cron task: ${name}`
          )
        }
      })

      // Log des résultats
      if (initializedTasks.length > 0) {
        console.info(
          `[ServiceCron] Cron Initialized: ${initializedTasks.join(' - ')}, Valid Platforms: ${validPlatforms.join(', ')}`
        )
      }
      if (failedTasks.length > 0) {
        console.error(`[ServiceCron] Cron Failed: ${failedTasks.join(' - ')}`)
      }
    } catch (error) {
      handleServiceError(
        error,
        'initializeCronTasks',
        `Error initializing Cron tasks`
      )
      throw error
    }
  }
}
