// src/services/api/platform/serviceBinanceWs.ts
import WebSocket from 'ws'
import { logger } from '@utils/loggerUtil'
import { ServiceBalance } from '@services/api/platform/serviceBalance'

export class ServiceBinanceWs {
  private static ws: WebSocket | null = null
  private static subscriptionParams: string[] = []

  /** 
   * Charge une fois la liste des balances et prépare les params de souscription. 
   * Appeler avant connect().
   */
  static async init(): Promise<void> {
    const balances = await ServiceBalance.fetchDatabaseBalancesByPlatform('binance')
    this.subscriptionParams = balances.map(b => `${b.base.toLowerCase()}usdt@ticker`)
    logger.info('[BinanceWS] Subscription params initialized:', this.subscriptionParams)
  }

  /** Ouvre la connexion WS et souscrit aux tickers pré-calculés */
  static connect(): void {
    if (this.ws) {
      logger.info('[BinanceWS] Already connected.')
      return
    }

    this.ws = new WebSocket('wss://stream.binance.com:9443/ws')

    this.ws.on('open', () => {
      logger.info('[BinanceWS] Connected, subscribing to tickers...')
      this.ws?.send(JSON.stringify({
        method: 'SUBSCRIBE',
        params: this.subscriptionParams,
        id: 1
      }))
    })

    this.ws.on('message', data => {
      const payload = JSON.parse(data.toString())
      //logger.debug('[BinanceWS] Message:', payload)
      // Traitement des données tickers
    })

    this.ws.on('close', () => {
      logger.warn('[BinanceWS] Disconnected.')
      this.ws = null
    })

    this.ws.on('error', error => {
      logger.error('[BinanceWS] Error:', error)
    })
  }

  /** Ferme proprement la connexion */
  static disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      logger.info('[BinanceWS] Disconnected by request.')
    }
  }

  /**
   * Met à jour dynamiquement les subscriptions si la DB change.
   * Désabonne l’ancien set et renvoie un nouveau SUBSCRIBE.
   */
  static async refreshSubscriptions(): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      logger.warn('[BinanceWS] Cannot refresh: socket not open.')
      return
    }
    // Récupérer les nouvelles balances
    const balances = await ServiceBalance.fetchDatabaseBalancesByPlatform('binance')
    const newParams = balances.map(b => `${b.base.toLowerCase()}usdt@ticker`)

    // Désabonnement de l’ancien
    this.ws.send(JSON.stringify({
      method: 'UNSUBSCRIBE',
      params: this.subscriptionParams,
      id: 2
    }))

    // Mise à jour et réabonnement
    this.subscriptionParams = newParams
    this.ws.send(JSON.stringify({
      method: 'SUBSCRIBE',
      params: this.subscriptionParams,
      id: 3
    }))
    logger.info('[BinanceWS] Subscriptions refreshed:', this.subscriptionParams)
  }
}
