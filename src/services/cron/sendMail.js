const nodemailer = require("nodemailer");
const { smtp } = require("./config.js");
const { errorLogger } = require("../utils/loggerUtil.js");

async function sendMail(options) {
  const transporter = nodemailer.createTransport(smtp);
  transporter.sendMail(options, (error, info) => {
    if (error) {
      errorLogger.error(`Error sending email: ${error.message}`, { error });
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
}

module.exports = { sendMail };
