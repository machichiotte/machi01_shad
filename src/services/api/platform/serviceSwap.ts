// src/services/api/platform/serviceSwap.ts
import path from 'path';

import { config } from '@config/index';
import { SwapMigration } from '@typ/database';
import { PLATFORM } from '@typ/platform';
import { MappedStrat } from '@typ/strat';
import { MappedTrade } from '@typ/trade';

import { ServiceDatabase } from '@services/api/database/serviceDatabase';
import { ServiceStrategy } from '@services/api/database/serviceStrategy';
import { ServiceTrade } from '@services/api/platform/serviceTrade';

import { handleServiceError } from '@utils/errorUtil';
import { logger } from '@utils/loggerUtil';

const COLLECTION_NAME = config.databaseConfig.collection.swap;

export class ServiceSwap {

  static async fetchDatabaseSwapMigration(): Promise<SwapMigration[]> {
    const operation = 'fetchDatabaseSwapMigration';
    //logger.debug(`Workspaceing swap migrations from DB: ${COLLECTION_NAME}...`, { module: path.parse(__filename).name, operation, collection: COLLECTION_NAME });
    try {
      const swaps = await ServiceDatabase.getCollectionDocuments(COLLECTION_NAME) as SwapMigration[];
      //logger.debug(`Workspaceed ${swaps.length} swap migrations.`, { module: path.parse(__filename).name, operation, count: swaps.length });
      return swaps;
    } catch (error) {
      handleServiceError(error, `${path.parse(__filename).name}:${operation}`, `Error fetching swap migrations from ${COLLECTION_NAME}`);
      throw error;
    }
  }

  static async updateTrade(trade: MappedTrade, oldAsset: string, newAsset: string, swapMultiplier: number, platform: string): Promise<void> {
    const operation = 'updateTrade';
    const context = { module: path.parse(__filename).name, operation, oldAsset, newAsset, platform, swapMultiplier, tradeId: trade._id?.toHexString() ?? 'N/A' }; // Include tradeId early

    // --- Création de l'objet mis à jour SANS ajouter de nouvelles propriétés ---
    const updatedTrade: Partial<MappedTrade> & { _id?: MappedTrade['_id'] } = { // Utiliser Partial pour flexibilité mais garder _id
      ...trade,
      base: newAsset,
      pair: trade.pair.replace(oldAsset, newAsset),
      amount: trade.amount * swapMultiplier,
      price: trade.total / (trade.amount * swapMultiplier),
      fee: trade.feecoin === oldAsset ? (trade.fee * swapMultiplier) : trade.fee,
      feecoin: trade.feecoin === oldAsset ? newAsset : trade.feecoin,
    };
    // Assurez-vous que l'_id est bien présent pour la mise à jour
    updatedTrade._id = trade._id;

    if (updatedTrade._id) {
      try {
        //logger.debug(`Attempting to save updated trade (swap) to DB...`, context);
        // Assurez-vous que la fonction attend un objet complet si nécessaire, sinon caster en MappedTrade peut être risqué
        // Si updateById prend un Partial, c'est ok. Sinon, il faudra peut-être reconstruire un objet complet.
        await ServiceTrade.updateById(updatedTrade as MappedTrade); // Cast prudent si nécessaire par updateById
        logger.info(`Trade updated successfully for swap.`, context); // Utiliser info pour succès
      } catch (error) {
        handleServiceError(error, `${path.parse(__filename).name}:${operation}:dbUpdate`, `Failed to update swapped trade in DB for ID: ${updatedTrade._id.toHexString()}`);
        throw error;
      }
    } else {
      logger.error('Trade _id is undefined, cannot update trade during swap.', {
        module: path.parse(__filename).name,
        operation,
        platform,
        oldAsset,
        newAsset,
        originalTradeInfo: { id: trade._id?.toHexString() ?? 'N/A', pair: trade.pair, timestamp: trade.timestamp }
      });
      // Ne pas throw par défaut ici, mais c'est une option si l'échec doit arrêter le process
    }
  }

  static async updateStrategy(strategy: MappedStrat, newAsset: string, platform: PLATFORM): Promise<void> {
    const operation = 'updateStrategy';
    const context = { module: path.parse(__filename).name, operation, oldAsset: strategy.base, newAsset, platform, strategyId: strategy._id?.toHexString() ?? 'N/A' };
    //logger.debug(`Preparing strategy update for swap...`, context);

    // --- Création de l'objet mis à jour ---
    const updatedStrategy: Partial<MappedStrat> & { _id?: MappedStrat['_id'] } = {
      ...strategy,
      base: newAsset
    };
    // Assurer la présence de l'ID
    updatedStrategy._id = strategy._id;

    if (updatedStrategy._id) {
      try {
        //logger.debug(`Attempting to save updated strategy (swap) to DB...`, context);
        // Même remarque que pour updateTrade sur le type attendu par updateStrategyById
        await ServiceStrategy.updateStrategyById(updatedStrategy as MappedStrat);
        logger.info(`Strategy updated successfully for swap.`, context); // Utiliser info pour succès
      } catch (error) {
        handleServiceError(error, `${path.parse(__filename).name}:${operation}:dbUpdate`, `Failed to update swapped strategy in DB for ID: ${updatedStrategy._id.toHexString()}`);
        throw error;
      }
    } else {
      logger.error('Strategy _id is undefined, cannot update strategy during swap.', {
        module: path.parse(__filename).name,
        operation,
        platform,
        oldAsset: strategy.base,
        newAsset,
        // Utiliser des propriétés connues et sûres
        originalStrategyInfo: { id: strategy._id?.toHexString() ?? 'N/A', base: strategy.base } // Adapter si d'autres props existent
      });
      // Ne pas throw par défaut
    }
  }

  static async handleMigrationSwap(): Promise<void> {
    const operation = 'handleMigrationSwap';
    logger.info('Starting swap migration handling process...', { module: path.parse(__filename).name, operation });
    try {
      //logger.debug('Fetching required data (swaps, trades, strategies)...', { module: path.parse(__filename).name, operation });
      const [swaps, trades, strategies] = await Promise.all([
        this.fetchDatabaseSwapMigration(),
        ServiceTrade.fetchFromDb() as Promise<MappedTrade[]>,
        ServiceStrategy.fetchDatabaseStrategies() as Promise<MappedStrat[]>
      ]);
      //logger.debug(`Data fetched: ${swaps.length} swaps, ${trades.length} trades, ${strategies.length} strategies.`, { module: path.parse(__filename).name, operation, swapCount: swaps.length, tradeCount: trades.length, strategyCount: strategies.length });

      const now = new Date();
      let totalTradesUpdated = 0;
      let totalStrategiesUpdated = 0;

      if (swaps.length === 0) {
        logger.info('No swap migration configurations found in database.', { module: path.parse(__filename).name, operation });
        return;
      }

      for (const swap of swaps) {
        const { oldBase: oldAsset, newBase: newAsset, swapRate, platform, delistingDate } = swap;
        const swapContext = { module: path.parse(__filename).name, operation, platform, oldAsset, newAsset, swapRate, delistingDate };
        //logger.debug(`Processing swap configuration...`, swapContext);

        const delisting = new Date(delistingDate);

        if (now < delisting) {
          //logger.debug(`Waiting for delisting date to pass.`, { ...swapContext, currentDate: now.toISOString() });
          continue;
        }

        logger.info(`Processing active swap: ${oldAsset} -> ${newAsset} on ${platform} (Delisted: ${delistingDate})`, swapContext);

        const [oldRatio, newRatio] = swapRate.split(':').map(Number);
        if (isNaN(oldRatio) || isNaN(newRatio) || oldRatio <= 0 || newRatio <= 0) {
          logger.error(`Invalid swapRate format or value: "${swapRate}". Skipping swap.`, swapContext);
          continue;
        }
        const swapMultiplier = newRatio / oldRatio;
        //logger.debug(`Calculated swap multiplier: ${swapMultiplier}`, { ...swapContext, oldRatio, newRatio, swapMultiplier });


        // --- Filtrage SANS utiliser la propriété 'swap' inexistante ---
        // La logique pour éviter les doubles swaps doit être gérée autrement si nécessaire
        // (peut-être en vérifiant si la base est déjà 'newAsset' ?)
        // Ou peut-être que relancer le swap n'est pas grave ?
        // Pour l'instant, on filtre juste sur l'ancien asset et la plateforme.
        const tradesToUpdate = trades.filter(trade => trade.base === oldAsset && trade.platform === platform);
        const strategiesToUpdate = strategies.filter(strategy => strategy.base === oldAsset && strategy.strategies[platform]);

        logger.info(`Found ${tradesToUpdate.length} trades and ${strategiesToUpdate.length} strategies matching criteria for this swap.`, { ...swapContext, tradeCount: tradesToUpdate.length, strategyCount: strategiesToUpdate.length });

        if (tradesToUpdate.length === 0 && strategiesToUpdate.length === 0) {
          logger.info('No matching trades or strategies found needing update for this swap.', swapContext);
          continue;
        }

        const tradeUpdatePromises = tradesToUpdate.map(trade => this.updateTrade(trade, oldAsset, newAsset, swapMultiplier, platform));
        const strategyUpdatePromises = strategiesToUpdate.map(strategy => this.updateStrategy(strategy, newAsset, platform));

        //logger.debug(`Executing ${tradeUpdatePromises.length} trade updates and ${strategyUpdatePromises.length} strategy updates...`, swapContext);
        try {
          const results = await Promise.allSettled([...tradeUpdatePromises, ...strategyUpdatePromises]);
          const fulfilled = results.filter(r => r.status === 'fulfilled').length;
          const rejected = results.filter(r => r.status === 'rejected');

          // Calcul plus simple du succès basé sur les promesses initiales moins les rejets
          totalTradesUpdated += tradeUpdatePromises.length - results.slice(0, tradeUpdatePromises.length).filter(r => r.status === 'rejected').length;
          totalStrategiesUpdated += strategyUpdatePromises.length - results.slice(tradeUpdatePromises.length).filter(r => r.status === 'rejected').length;


          if (rejected.length > 0) {
            logger.warn(`Completed swap processing for ${oldAsset}->${newAsset} on ${platform} with ${rejected.length} failures out of ${results.length} total updates.`, { ...swapContext, successes: fulfilled, failures: rejected.length });
          } else {
            logger.info(`Successfully processed all ${results.length} updates for ${oldAsset}->${newAsset} on ${platform}.`, { ...swapContext, updatedCount: results.length });
          }

        } catch (promiseError) {
          handleServiceError(promiseError, `${path.parse(__filename).name}:${operation}:promiseProcessing`, `Unexpected error during Promise.allSettled for swap`);
        }
      } // end for loop

      logger.info(`Swap migration handling process finished. Total successful updates - Trades: ${totalTradesUpdated}, Strategies: ${totalStrategiesUpdated}.`, { module: path.parse(__filename).name, operation, totalTradesUpdated, totalStrategiesUpdated });

    } catch (error) {
      handleServiceError(error, `${path.parse(__filename).name}:${operation}`, 'Error during swap migration handling process');
    }
  }
}