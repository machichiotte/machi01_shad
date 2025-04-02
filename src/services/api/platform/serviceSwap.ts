// src/services/api/platform/serviceSwap.ts
import { SwapMigration } from '@typ/database';
import { MappedStrat } from '@typ/strat';
import { MappedTrade } from '@typ/trade'
import { ServiceDatabase } from '@services/api/database/serviceDatabase'
import { ServiceStrategy } from '@services/api/database/serviceStrategy';
import { ServiceTrade } from '@services/api/platform/serviceTrade';
import { handleServiceError } from '@utils/errorUtil';
import { config } from '@config/index';
import { PLATFORM } from '@src/types/platform';

const COLLECTION_NAME = config.databaseConfig.collection.swap;

export class ServiceSwap {

  static async fetchDatabaseSwapMigration(): Promise<SwapMigration[]> {
    return await ServiceDatabase.getCollectionDocuments(COLLECTION_NAME) as SwapMigration[];
  }

  static async updateTrade(trade: MappedTrade, oldAsset: string, newAsset: string, swapMultiplier: number, platform: string): Promise<void> {
    const updatedTrade = {
      ...trade,
      base: newAsset, pair: trade.pair.replace(oldAsset, newAsset),
      amount: trade.amount * swapMultiplier,
      price: trade.total / (trade.amount * swapMultiplier),
      fee: trade.feecoin === oldAsset ? trade.fee * swapMultiplier : trade.fee,
      feecoin: trade.feecoin === oldAsset ? newAsset : trade.feecoin,
      swap: true
    };

    if (trade._id) {
      await ServiceTrade.updateById(updatedTrade);
      console.info(`Trade swap completed for ${oldAsset} to ${newAsset} on platform ${platform}.`);
    } else {
      console.error('Trade _id is undefined, cannot update trade');
    }
  }

  static async updateStrategy(strategy: MappedStrat, newAsset: string, platform: PLATFORM): Promise<void> {
    const updatedStrategy = { ...strategy, base: newAsset };
    if (strategy._id && updatedStrategy) {
      await ServiceStrategy.updateStrategyById(updatedStrategy);
      console.info(`Strategy swap completed for ${strategy.base} to ${newAsset} on platform ${platform}.`);
    }
  }

  static async handleMigrationSwap(): Promise<void> {
    try {
      const [swaps, trades, strategies] = await Promise.all([
        this.fetchDatabaseSwapMigration(),
        ServiceTrade.fetchFromDb() as Promise<MappedTrade[]>,
        ServiceStrategy.fetchDatabaseStrategies() as Promise<MappedStrat[]>
      ]);

      const now = new Date();

      for (const swap of swaps) {
        const { oldBase: oldAsset, newBase: newAsset, swapRate, platform, delistingDate } = swap;
        const delisting = new Date(delistingDate);

        if (now < delisting) {
          console.info(`Waiting for delisting date (${delistingDate}) of ${oldAsset} to be exceeded.`);
          continue;
        }

        const [oldRatio, newRatio] = swapRate.split(':').map(Number);
        const swapMultiplier = newRatio / oldRatio;

        const tradeUpdates = trades
          .filter(trade => trade.base === oldAsset && trade.platform === platform)
          .map(trade => this.updateTrade(trade, oldAsset, newAsset, swapMultiplier, platform));

        const strategyUpdates = strategies
          .filter(strategy => strategy.base === oldAsset && strategy.strategies[platform])
          .map(strategy => this.updateStrategy(strategy, newAsset, platform));

        await Promise.all([...tradeUpdates, ...strategyUpdates]);
      }
    } catch (error) {
      handleServiceError(error, 'handleMigrationSwaps', 'Error handling swaps');
    }
  }
}