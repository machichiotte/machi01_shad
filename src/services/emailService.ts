// src/services/cron/emailService.ts
import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer'
import { handleServiceError } from '@utils/errorUtil'
import { config } from '@config/index';
import { EmailOptions } from '@src/types/email';

const transporter: Transporter = nodemailer.createTransport(config.smtp)

export class EmailService {

  /**
   * Sends an email using the configured SMTP transporter.
   */
  static async sendMail(options: EmailOptions): Promise<SentMessageInfo> {
    try {
      const info = await transporter.sendMail(options)
      //console.info(`Email sent: ${info.response}`)
      return info
    } catch (error) {
      handleServiceError(error, 'sendMail', `Error sending email`)
      throw error
    }
  }
}