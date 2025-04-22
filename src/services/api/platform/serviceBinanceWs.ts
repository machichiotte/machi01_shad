// src/services/api/platform/serviceBinanceWs.ts
import WebSocket from 'ws'
import { logger } from '@utils/loggerUtil'
import { ServiceBalance } from '@services/api/platform/serviceBalance'
import { broadcast } from '@src/server'
import { formatErrorForLog } from '@utils/errorUtil'

export class ServiceBinanceWs {
  private static ws: WebSocket | null = null
  private static subscriptionParams: string[] = []
  private static reconnectInterval: NodeJS.Timeout | null = null
  private static readonly RECONNECT_DELAY = 5000 // 5 seconds delay for reconnection attempts

  /**
   * Load balances once and prepare subscription params. Call before connect().
   */
  static async init(): Promise<void> {
    try {
      const balances = await ServiceBalance.fetchDatabaseBalancesByPlatform('binance')
      this.subscriptionParams = balances
        .map((b) => `${b.base.toLowerCase()}usdt@ticker`)
        .filter((param) => !param.startsWith('usdtusdt'))
      // logger.info('[BinanceWS] Subscription params initialized:', { params: this.subscriptionParams })
    } catch (error) {
      logger.error('[BinanceWS] Failed to initialize subscription params:', {
        error: formatErrorForLog(error)
      })
      this.subscriptionParams = []
    }
  }

  /** Open WS connection and subscribe to precomputed tickers */
  static connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return
    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) return

    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval)
      this.reconnectInterval = null
    }

    if (!this.subscriptionParams.length) {
      logger.warn('[BinanceWS] No subscription parameters available. Call init() first or check balance data.')
      return
    }

    // logger.info('[BinanceWS] Attempting to connect...')
    this.ws = new WebSocket('wss://stream.binance.com:9443/ws')

    this.ws.on('open', () => {
      // logger.info('[BinanceWS] Connected, subscribing to tickers...')
      this.subscribe()
    })

    this.ws.on('message', (data) => {
      try {
        // logger.debug('[BinanceWS] Raw message:', { rawData: data.toString() })
        const payload = JSON.parse(data.toString())

        if (payload.e === '24hrTicker') {
          const tickerUpdate = {
            type: 'ticker',
            symbol: payload.s,
            priceChangePercent: payload.P,
            lastPrice: payload.c,
            highPrice: payload.h,
            lowPrice: payload.l,
            volume: payload.v,
            quoteVolume: payload.q,
            eventType: payload.e,
            eventTime: payload.E
          }
          // logger.info('[BinanceWS] Broadcasting ticker update:', { data: tickerUpdate })
          broadcast(tickerUpdate)
        } else if (payload.result === null && payload.id) {
          // logger.info('[BinanceWS] Subscription/unsubscription confirmation:', { id: payload.id })
        } else {
          // logger.debug('[BinanceWS] Non-ticker message:', { payload })
        }
      } catch (error) {
        logger.error('[BinanceWS] Error processing message:', {
          error: formatErrorForLog(error),
          rawData: data.toString()
        })
      }
    })

    this.ws.on('close', (code, reason) => {
      logger.warn(`[BinanceWS] Disconnected. Code: ${code}, Reason: ${reason.toString()}`)
      this.ws = null
      this.scheduleReconnect()
    })

    this.ws.on('error', (error) => {
      logger.error('[BinanceWS] WebSocket Error:', { error: formatErrorForLog(error) })
      if (this.ws && this.ws.readyState !== WebSocket.CLOSED) this.ws.terminate()
      this.ws = null
      this.scheduleReconnect()
    })
  }

  /** Send the subscription message to Binance */
  private static subscribe(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      logger.warn('[BinanceWS] Cannot subscribe: socket not open.')
      return
    }
    if (this.subscriptionParams.length) {
      this.ws.send(
        JSON.stringify({ method: 'SUBSCRIBE', params: this.subscriptionParams, id: 1 }),
        (error) => {
          if (error) {
            logger.error('[BinanceWS] Failed to send SUBSCRIBE message:', { error: formatErrorForLog(error) })
          }
        }
      )
    } else {
      logger.warn('[BinanceWS] No parameters to subscribe to.')
    }
  }

  /** Send the unsubscription message to Binance */
  private static unsubscribe(paramsToUnsubscribe: string[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      logger.warn('[BinanceWS] Cannot unsubscribe: socket not open.')
      return
    }
    if (paramsToUnsubscribe.length) {
      // logger.info('[BinanceWS] Sending UNSUBSCRIBE request:', { params: paramsToUnsubscribe })
      this.ws.send(
        JSON.stringify({ method: 'UNSUBSCRIBE', params: paramsToUnsubscribe, id: Date.now() }),
        (error) => {
          if (error) {
            logger.error('[BinanceWS] Failed to send UNSUBSCRIBE message:', { error: formatErrorForLog(error) })
          }
        }
      )
    }
  }

  /** Close the connection gracefully */
  static disconnect(): void {
    logger.info('[BinanceWS] Disconnect requested.')
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval)
      this.reconnectInterval = null
    }
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnection')
      this.ws = null
      // logger.info('[BinanceWS] Disconnected by request.')
    }
  }

  /** Schedule a reconnect attempt */
  private static scheduleReconnect(): void {
    if (this.reconnectInterval) return
    logger.info(`[BinanceWS] Scheduling reconnect in ${this.RECONNECT_DELAY / 1000}s...`)
    this.reconnectInterval = setTimeout(() => {
      this.reconnectInterval = null
      this.connect()
    }, this.RECONNECT_DELAY)
  }

  /** Refresh subscriptions dynamically if DB changes */
  static async refreshSubscriptions(): Promise<void> {
    logger.info('[BinanceWS] Refreshing subscriptions...')
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      logger.warn('[BinanceWS] Cannot refresh: socket not open.')
      return
    }

    const oldParams = [...this.subscriptionParams]
    try {
      await this.init()
      const changed =
        JSON.stringify(oldParams.sort()) !==
        JSON.stringify(this.subscriptionParams.sort())

      if (changed) {
        // logger.info('[BinanceWS] Subscription parameters changed.')
        if (oldParams.length) this.unsubscribe(oldParams)
        if (this.subscriptionParams.length) this.subscribe()
      }
    } catch (error) {
      logger.error('[BinanceWS] Failed to refresh subscriptions:', {
        error: formatErrorForLog(error)
      })
    }
  }

  /** Initialize then connect */
  static async initializeAndConnect() {
    await this.init()
    this.connect()
  }
}
