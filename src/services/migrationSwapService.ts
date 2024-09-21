// src/services/migrationSwapService.ts
import { MappedTrade, MappedStrategy, SwapMigration } from '@models/dbTypes';
import { StrategyService } from '@services/strategyService';
import { TradeService } from '@services/tradeService';
import { handleServiceError } from '@utils/errorUtil';
import { MongodbService } from '@services/mongodbService'
import config from '@config/index';

const COLLECTION_NAME = config?.collection?.swap;

async function fetchDatabaseSwapMigration(): Promise<SwapMigration[]> {
  return await MongodbService.getData(COLLECTION_NAME) as SwapMigration[];
}

async function updateTrade(trade: MappedTrade, oldAsset: string, newAsset: string, swapMultiplier: number, platform: string): Promise<void> {
  const updatedTrade = {
    base: newAsset, pair: trade.pair.replace(oldAsset, newAsset),
    amount: trade.amount * swapMultiplier,
    price: trade.total / (trade.amount * swapMultiplier),
    fee: trade.feecoin === oldAsset ? trade.fee * swapMultiplier : trade.fee,
    feecoin: trade.feecoin === oldAsset ? newAsset : trade.feecoin,
    swap: true
  };

  if (trade._id) {
    await TradeService.updateTradeById(trade._id, updatedTrade);
    console.info(`Trade swap completed for ${oldAsset} to ${newAsset} on platform ${platform}.`);
  } else {
    console.error('Trade _id is undefined, cannot update trade');
  }
}

async function updateStrategy(strategy: MappedStrategy, newAsset: string, platform: string): Promise<void> {
  const updatedStrategy = { asset: newAsset };
  await StrategyService.updateStrategyById(strategy._id, updatedStrategy);
  console.info(`Strategy swap completed for ${strategy.asset} to ${newAsset} on platform ${platform}.`);
}

async function handleMigrationSwaps(): Promise<void> {
  try {
    const [swaps, trades, strategies] = await Promise.all([
      fetchDatabaseSwapMigration(),
      TradeService.fetchDatabaseTrades() as Promise<MappedTrade[]>,
      StrategyService.fetchDatabaseStrategies() as Promise<MappedStrategy[]>
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
        .map(trade => updateTrade(trade, oldAsset, newAsset, swapMultiplier, platform));

      const strategyUpdates = strategies
        .filter(strategy => strategy.asset === oldAsset && strategy.strategies[platform])
        .map(strategy => updateStrategy(strategy, newAsset, platform));

      await Promise.all([...tradeUpdates, ...strategyUpdates]);
    }
  } catch (error) {
    handleServiceError(error, 'handleMigrationSwaps', 'Error handling swaps');
  }
}

export { fetchDatabaseSwapMigration, handleMigrationSwaps };