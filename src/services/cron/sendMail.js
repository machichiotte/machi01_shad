// src/services/cron/sendMail.js
const nodemailer = require("nodemailer");
const { smtp } = require("../config.js");
const { errorLogger } = require("../../utils/loggerUtil.js");

const transporter = nodemailer.createTransport(smtp);

async function sendMail(options) {
  try {
    const info = await transporter.sendMail(options);
    console.log(`Email envoyé : ${info.response}`);
    return info;
  } catch (error) {
    errorLogger.error(`Erreur d'envoi d'email : ${error.message}`, { error });
    throw error;
  }
}

module.exports = { sendMail };
