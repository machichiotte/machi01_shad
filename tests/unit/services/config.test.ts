import config from '@services/config';

describe('Config', () => {
  describe('SMTP Configuration', () => {
    it('should have correct SMTP host', () => {
      expect(config.smtp.host).toBe('smtp.ethereal.email');
    });

    it('should have correct SMTP port', () => {
      expect(config.smtp.port).toBe(587);
    });

    it('should use environment variables for SMTP auth', () => {
      expect(config.smtp.auth.user).toBe(process.env.EMAIL_ADDRESS);
      expect(config.smtp.auth.pass).toBe(process.env.EMAIL_PASSWORD);
    });
  });

  describe('Cron Schedules', () => {
    it('should have correct cron schedule for shad', () => {
      expect(config.cronSchedules.shad).toBe('*/30 * * * *');
    });

    it('should have correct cron schedule for markets', () => {
      expect(config.cronSchedules.markets).toBe('* */12 * * *');
    });

    it('should have correct cron schedule for tickers', () => {
      expect(config.cronSchedules.tickers).toBe('*/1 * * * *');
    });

    it('should have correct cron schedule for balances', () => {
      expect(config.cronSchedules.balances).toBe('*/2 * * * *');
    });
  });

  describe('Log Files', () => {
    it('should have correct error log file name', () => {
      expect(config.logFiles.error).toBe('error.log');
    });

    it('should have correct info log file name', () => {
      expect(config.logFiles.info).toBe('info.log');
    });
  });
});