// src/services/serviceTrade.ts
import { RepoTrade } from '@repo/repoTrade'
import { MappedTrade, TradeServiceResult, ManualTradeAdditionResult } from '@typ/trade'
import { PLATFORM, PlatformTrade } from '@typ/platform'
import { ServiceTimestamp } from '@services/api/database/serviceTimestamp'
import { MappingPlatform } from '@services/api/platform/mappingPlatform'
import { ServiceCcxt } from '@services/api/platform/serviceCcxt'
import { ServiceMarket } from '@services/api/platform/serviceMarket'
import { getMarketSymbolForPlatform } from '@utils/platformUtil'
import { handleServiceError } from '@utils/errorUtil'
import { retry } from '@utils/retryUtil'
import { QUOTE_CURRENCIES } from '@src/constants/coins'
import { config } from '@config/index';

const COLLECTION_CATEGORY = config.databaseConfig.category.trade

export class ServiceTrade {
  static async fetchFromDb(): Promise<MappedTrade[]> {
    return await RepoTrade.fetchAllTrades()
  }

  static async fetchFromApi(platform: PLATFORM, base: string): Promise<PlatformTrade[]> {
    const markets = await ServiceMarket.getSavedMarkets();

    const validSymbols = QUOTE_CURRENCIES
      .filter(quote => {
        // ici il peut y avoir un manque selon lexcchange, par exemple sur binance, les paires avec USDT ont ete supprimees, donc pas dans markets, alors que je voudrais quand meme quon recherche avec la quote usdt
        return markets.some(market =>
          market.base === base.toUpperCase() && market.quote === quote && market.platform === platform
        );
      })
      .map(quote => getMarketSymbolForPlatform(platform, base, quote));

    const trades: PlatformTrade[] = [];
    const batchSize = 30;

    console.log(`Fetch ${validSymbols} trades for ${platform} ${base}`);
    for (let i = 0; i < validSymbols.length; i += batchSize) {
      const symbolBatch = validSymbols.slice(i, i + batchSize);
      const batchPromises = symbolBatch.map(symbol =>
        retry(
          async () => ServiceCcxt.fetchRawTrade(platform, symbol),
          [],
          `fetchRawTrade(${platform}, ${symbol})`
        )
      );
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(result => trades.push(...result));

      if (i + batchSize < validSymbols.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return trades;
  }


  static async updateById(updatedTrade: MappedTrade): Promise<boolean> {
    if (!updatedTrade._id) {
      throw new Error(`L'ID du trade est requis`)
    }

    try {
      return await RepoTrade.updateById(updatedTrade)
    } catch (error) {
      handleServiceError(error, 'updateById', `Error updating trade with id ${updatedTrade._id}`)
      throw error
    }
  }

  static async updateTrades(platform: PLATFORM): Promise<TradeServiceResult> {
    try {
      const mappedData = await this.fetchPlatformTrades(platform)
      await RepoTrade.insertTrades(mappedData)
      await ServiceTimestamp.saveTimestampToDatabase(COLLECTION_CATEGORY, platform)
      return { data: mappedData }
    } catch (error) {
      handleServiceError(error, 'updateTrades', `Error updating trades for ${platform}`)
      throw error
    }
  }

  static async insertNewTrades(tradesData: MappedTrade | MappedTrade[]): Promise<ManualTradeAdditionResult> {
    try {
      const savedTrade = await RepoTrade.insertTrades(tradesData)
      return { data: savedTrade }
    } catch (error) {
      handleServiceError(error, 'insertNewTrades', 'Error adding trades manually')
      throw error
    }
  }

  static async saveTradesToDatabase(newTrades: MappedTrade[]): Promise<void> {
    try {
      const existingTrades = await this.fetchFromDb()
      await RepoTrade.insertFilteredTrades(newTrades, existingTrades)
    } catch (error) {
      handleServiceError(error, 'saveTradesToDatabase', 'Error saving trades to database')
      throw error
    }
  }

  private static async fetchPlatformTrades(platform: PLATFORM): Promise<MappedTrade[]> {
    const trades = await ServiceCcxt.fetchPlatformTrades(platform)
    return MappingPlatform.mapTrades(platform, trades)
  }
}