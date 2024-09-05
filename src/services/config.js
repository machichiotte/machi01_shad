// src/services/config.js
const config = {
  smtp: {
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  },
  cronSchedules: {
    shad: "*/30 * * * *",
    markets: "* */12 * * *",
    tickers: "*/1 * * * *",
    balances: "*/2 * * * *",
  },
  logFiles: {
    error: "error.log",
    info: "info.log",
  },
};

module.exports = config;
