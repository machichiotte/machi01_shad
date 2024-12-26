// src/services/PlatformUpdateManager.ts
import { PLATFORM } from '@typ/platform'
import { TimestampService } from '@src/services/api/database/timestampService'
import { BalanceService } from '@services/api/platform/balanceService'
import { MarketService } from '@services/api/platform/marketService'
import { TickerService } from '@services/api/platform/tickerService'
import { hasTimeElapsed } from '@utils/timeUtil'
import { config } from '@config/index'

export class PlatformUpdateManager {
  private static readonly UPDATE_INTERVALS = {
    balance: config.serverConfig.cacheExpirationTimes.balance,
    market: config.serverConfig.cacheExpirationTimes.market,
    ticker: config.serverConfig.cacheExpirationTimes.ticker
  }

  static async updatePlatformData(platform: PLATFORM): Promise<void> {
    console.info(`Updating data for ${platform}...`)

    try {
      await Promise.all([
        this.updateIfNeeded(
          platform,
          'balance',
          BalanceService.updateBalancesForPlatform
        ),
        this.updateIfNeeded(
          platform,
          'market',
          MarketService.updateMarketsForPlatform
        ),
        this.updateIfNeeded(
          platform,
          'ticker',
          TickerService.updateTickersForPlatform
        )
      ])
    } catch (error) {
      console.error(`Error updating platform ${platform}:`, error)
    }
  }

  private static async updateIfNeeded(
    platform: PLATFORM,
    key: keyof typeof PlatformUpdateManager.UPDATE_INTERVALS,
    updateFunction: (platform: PLATFORM) => Promise<void>
  ): Promise<void> {
    try {
      const timestamps = await TimestampService.fetchDatabaseTimestamp()
      const lastUpdate = timestamps[key]?.[platform]?.$numberLong || '0'
      const interval = this.UPDATE_INTERVALS[key]

      if (hasTimeElapsed(lastUpdate, interval)) {
        console.info(`Updating ${key} for ${platform}...`)
        await updateFunction(platform)
      }
    } catch (error) {
      console.error(`Failed to update ${key} for ${platform}:`, error)
    }
  }
}
