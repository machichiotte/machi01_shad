// src/services/serviceEmail.ts
import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer'
import { handleServiceError } from '@utils/errorUtil'
import { config } from '@config/index';
import { EmailOptions } from '@typ/email';

const transporter: Transporter = nodemailer.createTransport(config.serverConfig.smtp)

export class ServiceEmail {

  /**
   * Sends an email using the configured SMTP transporter.
   */
  static async sendMail(options: EmailOptions): Promise<SentMessageInfo> {
    try {
      const info = await transporter.sendMail(options)
      //console.debug(`Email sent: ${info.response}`)
      return info
    } catch (error) {
      handleServiceError(error, 'sendMail', `Error sending email`)
      throw error
    }
  }
}