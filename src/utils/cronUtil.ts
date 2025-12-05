// src/utils/cronUtil.ts
//import { EmailService } from './emailService'
import { handleServiceError } from '@utils/errorUtil'
import { config } from '@config/index';
import { PLATFORM } from '@typ/platform'
import { checkApiKeys } from './platformUtil';
import { retry } from './retryUtil';
import { PLATFORMS } from '@constants/platform'
import path from 'path'; import { logger } from './loggerUtil';

/**
 * Exécute une tâche cron avec gestion des erreurs et mécanisme de retry
 */
export async function executeCronTask(task: () => Promise<void>, isCritical: boolean = false, retries: number = 3): Promise<void> {
  try {
    // Utilise la fonction retry pour effectuer plusieurs tentatives
    await retry(task, [], `executeCronTask ${task}`, retries);
  } catch (error) {
    handleServiceError(error, `executeCronTask`, `Task execution failed  ${task}`);

    // Si la tâche est critique et que toutes les tentatives échouent
    if (isCritical) {
      if (!config.serverConfig.smtp) {
        throw new Error('Configuration SMTP manquante');
      }

      // Remplacer par l'envoi d'une notification critique par email ou push
      /*
      EmailService.sendMail({
        from: config.smtp.auth.user as string,
        to: config.smtp.auth.receiver as string,
        subject: 'Critical Error Alert',
        text: `Critical error in scheduled task: ${(error as Error).message}`
      });
      */
    }
  }
}

/**
 * Executes a given task function for all platforms
 */
export async function executeForPlatforms(taskName: string, taskFunction: (platform: PLATFORM) => Promise<void>): Promise<void> {
  const operation = 'executeForPlatforms'
  logger.debug(`Exécution de la tâche cron pour ${taskName}...`, { module: path.parse(__filename).name, operation })
  await Promise.all(
    PLATFORMS.filter(platform => checkApiKeys(platform)).map((platform) =>
      executeCronTask(() => taskFunction(platform), true)
    )
  )
}