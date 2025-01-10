// src/services/update/updateManagerPlatform.ts
import { PLATFORM } from '@typ/platform'
import { ServiceTimestamp } from '@services/api/database/serviceTimestamp'
import { ServiceBalance } from '@services/api/platform/serviceBalance'
import { ServiceMarket } from '@services/api/platform/serviceMarket'
import { ServiceTicker } from '@services/api/platform/serviceTicker'
import { hasTimeElapsed } from '@utils/timeUtil'
import { config } from '@config/index'

export class UpdateManagerPlatform {
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
          ServiceBalance.updateBalancesForPlatform
        ),
        this.updateIfNeeded(
          platform,
          'market',
          ServiceMarket.updateMarketsForPlatform
        ),
        this.updateIfNeeded(
          platform,
          'ticker',
          ServiceTicker.updateTickersForPlatform
        )
      ])
    } catch (error) {
      console.error(`Error updating platform ${platform}:`, error)
    }
  }

  private static async updateIfNeeded(
    platform: PLATFORM,
    key: keyof typeof UpdateManagerPlatform.UPDATE_INTERVALS,
    updateFunction: (platform: PLATFORM) => Promise<void>
  ): Promise<void> {
    try {
      const timestamps = await ServiceTimestamp.fetchDatabaseTimestamp()
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
