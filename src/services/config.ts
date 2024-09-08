// src/services/config.ts

interface SmtpConfig {
  host: string;
  port: number;
  auth: {
    user: string | undefined;
    pass: string | undefined;
  };
}

interface CronSchedules {
  shad: string;
  markets: string;
  tickers: string;
  balances: string;
}

interface LogFiles {
  error: string;
  info: string;
}

interface Config {
  smtp: SmtpConfig;
  cronSchedules: CronSchedules;
  logFiles: LogFiles;
}

const config: Config = {
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

export default config;