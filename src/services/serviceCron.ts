// src/services/serviceCron.ts
import cron from 'node-cron'
import { MARKETS, TICKERS, BALANCES, CMC } from '@constants/collection'
import { handleServiceError } from '@utils/errorUtil'
import { checkApiKeys } from '@utils/platformUtil'

import { ServiceCmc } from '@services/api/serviceCmc'
import { ServiceTicker } from '@services/api/platform/serviceTicker'
import { ServiceMarket } from '@services/api/platform/serviceMarket'
import { ServiceBalance } from '@services/api/platform/serviceBalance'
import { ServiceRssProcessor } from '@services/content/serviceRssProcessor' // Importer le nouveau service

import { Task } from '@typ/cron'
import { PLATFORMS } from '@constants/platform'

import { config } from '@config/index'
import { logger } from '@utils/loggerUtil';

export class ServiceCron {
  static async initializeCronTasks(): Promise<void> {
    const operation = 'initializeCronTasks';
    const module = 'ServiceCron'; // Pour ajouter aux logs

    try {
      logger.info(`[${module}] Starting initialization of Cron tasks...`, { module, operation });

      const initializedTasks: string[] = [] // Tâches initialisées avec succès
      const failedTasks: string[] = [] // Tâches ayant échoué

      // Vérifie les plateformes valides via leurs clés API
      const validPlatforms = PLATFORMS.filter((platform) => {
        const isValid = checkApiKeys(platform);
        if (!isValid) {
          logger.warn(`[${module}] API keys check failed or missing for platform: ${platform}. Tasks requiring it will be skipped.`, { module, operation, platform });
        }
        return isValid;
      });
      logger.info(`[${module}] Valid platforms found after API key check: ${validPlatforms.join(', ') || 'None'}`, { module, operation, validPlatforms });

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
        const taskIdentifier = `Platform Task ${name}`;
        try {
          if (validPlatforms.length === 0) {
            logger.warn(`[${module}] Skipping scheduling of ${taskIdentifier} as no valid platforms were found.`, { module, operation, taskName: name });
            failedTasks.push(`${name} (No valid platforms)`);
            return; // Ne pas planifier si aucune plateforme n'est valide
          }

          validPlatforms.forEach((platform) => {
            const platformTaskName = `${taskIdentifier} for ${platform}`;
            logger.debug(`[${module}] Scheduling ${platformTaskName} with schedule: ${schedule}`, { module, operation, taskName: name, platform, schedule });

            cron.schedule(schedule, async () => {
              const startTime = Date.now();
              logger.debug(`[${module}] Executing ${platformTaskName}...`, { module, taskName: name, platform, schedule });

              try {
                await task(platform); // Appelle la tâche avec l'argument platform
                const duration = Date.now() - startTime;
                logger.debug(`[${module}] ${platformTaskName} executed successfully.`, { module, taskName: name, platform, durationMs: duration });
              } catch (err) {
                // handleServiceError utilise déjà le logger
                handleServiceError(
                  err,
                  `${module}: ${platformTaskName}`, // Nom de fonction plus précis pour handleServiceError
                  `Execution failed` // Message personnalisé
                );
                // Pas besoin de logger à nouveau l'erreur ici, handleServiceError s'en charge.
              }
            });
          });
          initializedTasks.push(name);
        } catch (error) {
          failedTasks.push(name);
          // handleServiceError pour les erreurs de planification elles-mêmes
          handleServiceError(
            error,
            `${module}: Scheduling ${taskIdentifier}`,
            `Failed to schedule cron task`
          );
        }
      });

      // Planifie les tâches générales
      generalTasks.forEach(({ schedule, task, name }) => {
        const taskIdentifier = `General Task ${name}`;

        try {
          logger.debug(`[${module}] Scheduling ${taskIdentifier} with schedule: ${schedule}`, { module, operation, taskName: name, schedule });

          cron.schedule(schedule, async () => {
            const startTime = Date.now()
            logger.debug(`[${module}] Executing ${taskIdentifier}...`, { module, taskName: name, schedule });

            try {
              if (task.length > 0) {
                logger.warn(`[${module}] General Task ${taskIdentifier} cannot be executed without arguments.`, { module, operation, taskName: name });

              } else {
                await (task as () => void)()
                const duration = Date.now() - startTime
                logger.debug(`[${module}] ${taskIdentifier} executed successfully.`, { module, taskName: name, durationMs: duration });

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
      if (failedTasks.length === 0) {
        logger.info(`[${module}] All cron tasks initialized successfully.`, { module, operation, initializedTasks, validPlatforms });
      } else {
        logger.warn(`[${module}] Cron tasks initialization completed with some failures.`, { module, operation, initializedTasks, failedTasks, validPlatforms });
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