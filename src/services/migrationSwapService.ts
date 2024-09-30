// src/services/migrationSwapService.ts
import { SwapMigration } from '@typ/database';
import { MappedStrat } from '@typ/strat';
import { StrategyService } from '@services/strategyService';
import { TradeService } from '@services/tradeService';
import { handleServiceError } from '@utils/errorUtil';
import { MongodbService } from '@services/mongodbService'
import { MappedTrade } from '@typ/trade'
import { config } from '@config/index';

const COLLECTION_NAME = config.collection.swap;

export class MigrationSwapService {

  static async fetchDatabaseSwapMigration(): Promise<SwapMigration[]> {
    return await MongodbService.getData(COLLECTION_NAME) as SwapMigration[];
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
      await TradeService.updateTradeById(updatedTrade);
      console.info(`Trade swap completed for ${oldAsset} to ${newAsset} on platform ${platform}.`);
    } else {
      console.error('Trade _id is undefined, cannot update trade');
    }
  }

  static async updateStrategy(strategy: MappedStrat, newAsset: string, platform: string): Promise<void> {
    const updatedStrategy = { ...strategy, asset: newAsset };
    if (strategy._id && updatedStrategy) {
      await StrategyService.updateStrategyById(updatedStrategy);
      console.info(`Strategy swap completed for ${strategy.asset} to ${newAsset} on platform ${platform}.`);
    }
  }

  static async handleMigrationSwap(): Promise<void> {
    try {
      const [swaps, trades, strategies] = await Promise.all([
        this.fetchDatabaseSwapMigration(),
        TradeService.fetchDatabaseTrades() as Promise<MappedTrade[]>,
        StrategyService.fetchDatabaseStrategies() as Promise<MappedStrat[]>
      ]);

      const now = new Date();

      for (const swap of swaps) {
        const { oldAsset, newAsset, swapRate, platform, delistingDate } = swap;
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
          .filter(strategy => strategy.asset === oldAsset && strategy.strategies[platform])
          .map(strategy => this.updateStrategy(strategy, newAsset, platform));

        await Promise.all([...tradeUpdates, ...strategyUpdates]);
      }
    } catch (error) {
      handleServiceError(error, 'handleMigrationSwaps', 'Error handling swaps');
    }
  }
}