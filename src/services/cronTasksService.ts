// src/services/cronTasksService.ts
import cron from 'node-cron';
import { handleServiceError } from '@utils/errorUtil';
import { config } from '@config/index';

import { TickerService } from '@services/tickerService';
import { MarketService } from '@services/marketService';
import { BalanceService } from '@services/balanceService';

import { Task } from '@src/types/cron';
import { CmcService } from './cmcService';

export class CronTaskService {
  static async initializeCronTasks(): Promise<void> {
    try {
      console.log('Starting initialization of Cron tasks...');

      const tasks: Task[] = [
        {
          schedule: config.cronSchedules.ticker,
          task: TickerService.cronTicker,
          name: 'Tickers',
        },
        {
          schedule: config.cronSchedules.market,
          task: MarketService.cronMarket,
          name: 'Markets',
        },
        {
          schedule: config.cronSchedules.balance,
          task: BalanceService.cronBalance,
          name: 'Balances',
        },
        {
          schedule: config.cronSchedules.cmc,
          task: CmcService.updateCmcData,
          name: 'Cmc',
        },
      ];

      const initializedTasks: string[] = []; // Tâches initialisées avec succès
      const failedTasks: string[] = []; // Tâches ayant échoué

      // Parcours et planification des tâches
      tasks.forEach(({ schedule, task, name }) => {
        try {
          cron.schedule(schedule, task);
          initializedTasks.push(name);
        } catch (error) {
          failedTasks.push(name);
          handleServiceError(error, `CronTaskService: ${name}`, `Failed to initialize cron task: ${name}`);
        }
      });

      // Log des tâches initialisées et des échecs
      if (initializedTasks.length > 0) {
        console.log(`Cron Initialized: ${initializedTasks.join(' - ')}`);
      }
      if (failedTasks.length > 0) {
        console.error(`Cron Failed: ${failedTasks.join(' - ')}`);
      }
    } catch (error) {
      handleServiceError(error, 'initializeCronTasks', `Error initializing Cron tasks`);
      throw error;
    }
  }
}
