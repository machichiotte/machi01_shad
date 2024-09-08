// src/services/cron/sendMail.js
const nodemailer = require("nodemailer");
const { smtp } = require("../config.js");
const { errorLogger } = require("../../utils/loggerUtil.js");

const transporter = nodemailer.createTransport(smtp);

/**
 * Sends an email using the configured SMTP transporter.
 * @param {Object} options - The email options (to, from, subject, text, html, etc.)
 * @returns {Promise<Object>} A promise that resolves with the info object from nodemailer
 * @throws {Error} If there's an error sending the email
 */
async function sendMail(options) {
  try {
    const info = await transporter.sendMail(options);
    console.log(`Email sent: ${info.response}`);
    return info;
  } catch (error) {
    errorLogger.error(`Error sending email: ${error.message}`, { error });
    throw error;
  }
}

module.exports = { sendMail };
