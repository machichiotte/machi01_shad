// src/services/serviceEmail.ts
import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer'
import { handleServiceError } from '@utils/errorUtil'
import { config } from '@config/index';
import { EmailOptions } from '@typ/email';
import path from 'path'; import { logger } from '@utils/loggerUtil';

const transporter: Transporter = nodemailer.createTransport(config.serverConfig.smtp)
export class ServiceEmail {

  /**
   * Sends an email using the configured SMTP transporter.
   */
  static async sendMail(options: EmailOptions): Promise<SentMessageInfo> {
    const operation = 'sendMail'
    try {
      const info = await transporter.sendMail(options)
      logger.debug(`Email sent: ${info.response}`, { module: path.parse(__filename).name, operation, options })
      return info
    } catch (error) {
      handleServiceError(error, 'sendMail', `Error sending email`)
      throw error
    }
  }
}