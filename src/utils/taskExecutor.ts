// src/utils/taskExecutor.ts
//import { EmailService } from './emailService'
import { handleServiceError } from '@utils/errorUtil'
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

          /*
          console.log('rajouter les mail ou notifications push)
          EmailService.sendMail({
            from: config.smtp.auth.user as string,
            to: config.smtp.auth.receiver as string,
            subject: 'Critical Error Alert',
            text: `Critical error in scheduled task: ${(error as Error).message}`
          })*/
        }
      }
      attempts++
    }
  }
}

/**
 * Executes a given task function for all platforms
 */
export async function executeForPlatforms(taskName: string, taskFunction: (platform: PLATFORM) => Promise<void>): Promise<void> {
  console.log(`Executing cron job for ${taskName}...`)
  await Promise.all(
    PLATFORMS.map((platform) =>
      executeCronTask(() => taskFunction(platform), true)
    )
  )
}