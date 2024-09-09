// src/services/cron/sendMail.ts
import nodemailer, { Transporter, SentMessageInfo } from "nodemailer";
import config from "../config";
import { errorLogger } from "@utils/loggerUtil";

const transporter: Transporter = nodemailer.createTransport(config.smtp);

interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  [key: string]: any;
}

/**
 * Sends an email using the configured SMTP transporter.
 * @param {EmailOptions} options - The email options (to, from, subject, text, html, etc.)
 * @returns {Promise<SentMessageInfo>} A promise that resolves with the info object from nodemailer
 * @throws {Error} If there's an error sending the email
 */
async function sendMail(options: EmailOptions): Promise<SentMessageInfo> {
  try {
    const info = await transporter.sendMail(options);
    console.log(`Email sent: ${info.response}`);
    return info;
  } catch (error) {
    if (error instanceof Error) {
      errorLogger.error(`Error sending email: ${error.message}`, { error });
    } else {
      errorLogger.error(`Error sending email: Unknown error`, { error });
    }
    throw error;
  }
}


export { sendMail };
