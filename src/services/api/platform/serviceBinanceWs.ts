// src/services/api/platform/serviceBinanceWs.ts
import WebSocket from 'ws';
import { logger } from '@utils/loggerUtil';
import { broadcast } from '@src/server';
import { formatErrorForLog } from '@utils/errorUtil';
import { TickerData } from '@typ/binance'; 

export class ServiceBinanceWs {
  private static ws: WebSocket | null = null;
  private static subscriptionParams: string[] = [];
  private static reconnectInterval: NodeJS.Timeout | null = null;
  private static readonly RECONNECT_DELAY = 5000; // 5 seconds delay for reconnection attempts

  /**
   * Initialize subscription parameters for the All Market Tickers Stream.
   */
  static async init(): Promise<void> {
    try {
      // Directly set the subscription parameter for the All Market Tickers Stream
      // This single stream provides data for all symbols efficiently.
      this.subscriptionParams = ['!ticker@arr'];

      logger.info(
        '[BinanceWS] Subscription params initialized for all market tickers stream.',
        {
          params: this.subscriptionParams,
        }
      );
    } catch (error) {
      // Although simpler, catch any unexpected initialization errors
      logger.error(
        '[BinanceWS] Failed to initialize subscription params for !ticker@arr:',
        {
          error: formatErrorForLog(error),
        }
      );
      // Fallback to empty params if initialization fails
      this.subscriptionParams = [];
    }
  }

  /** Open WS connection and subscribe to precomputed tickers */
  static connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) return;

    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    if (!this.subscriptionParams.length) {
      logger.warn(
        '[BinanceWS] No subscription parameters available. Call init() first.'
      );
      return;
    }

    logger.info('[BinanceWS] Attempting to connect...');
    this.ws = new WebSocket('wss://stream.binance.com:9443/ws');

    this.ws.on('open', () => {
      logger.info('[BinanceWS] Connected, subscribing to tickers...');
      this.subscribe();
    });

    this.ws.on('message', (data) => {
      try {
        // Avoid logging potentially large raw data frequently unless debugging
        // logger.debug('[BinanceWS] Raw message:', { rawData: data.toString() });
        const parsedData = JSON.parse(data.toString());

        // The '!ticker@arr' stream sends an ARRAY of ticker objects
        if (Array.isArray(parsedData)) {
          // logger.debug(`[BinanceWS] Received batch of ${parsedData.length} tickers.`); // Optional: log batch size

          // Process each ticker object in the array
          parsedData.forEach((ticker: unknown) => {
            // Type guard to ensure the object structure matches TickerData
            // We check for key properties expected in a ticker update.
            const potentialTicker = ticker as TickerData;
            if (
              potentialTicker &&
              typeof potentialTicker === 'object' &&
              potentialTicker.e === '24hrTicker' &&
              potentialTicker.s && // symbol
              potentialTicker.c && // last price
              potentialTicker.P // price change percent
              // Add more checks if necessary for robustness
            ) {
              // Cast to TickerData after validation
              const validTicker: TickerData = potentialTicker;

              // Format the data for broadcasting (consistent structure)
              const tickerUpdate = {
                type: 'ticker', // Consistent type for client
                platform: 'binance', // Add platform identifier
                symbol: validTicker.s,
                priceChangePercent: validTicker.P,
                lastPrice: validTicker.c,
                highPrice: validTicker.h,
                lowPrice: validTicker.l,
                volume: validTicker.v,
                quoteVolume: validTicker.q,
                eventType: validTicker.e,
                eventTime: validTicker.E,
              };
              // logger.debug('[BinanceWS] Broadcasting ticker update:', { data: tickerUpdate }); // Use debug for individual item
              broadcast(tickerUpdate);
            } else {
              logger.warn(
                '[BinanceWS] Received an item in the array that is not a valid TickerData:',
                { item: ticker }
              );
            }
          });
        } else if (
          // Handle subscription/unsubscription confirmations
          typeof parsedData === 'object' &&
          parsedData !== null &&
          parsedData.result === null &&
          parsedData.id
        ) {
          logger.info('[BinanceWS] Subscription/unsubscription confirmation:', {
            id: parsedData.id,
          });
        } else {
          // Log other unexpected message formats
          logger.debug('[BinanceWS] Received non-array/non-confirmation message:', {
            payload: parsedData,
          });
        }
      } catch (error) {
        logger.error('[BinanceWS] Error processing message:', {
          error: formatErrorForLog(error),
          // Log only a snippet of raw data on error to avoid huge logs
          rawDataSnippet: data.toString().substring(0, 500),
        });
      }
    });
    // --- END OF MODIFIED HANDLER ---

    this.ws.on('close', (code, reason) => {
      logger.warn(
        `[BinanceWS] Disconnected. Code: ${code}, Reason: ${reason.toString()}`
      );
      this.ws = null;
      this.scheduleReconnect();
    });

    this.ws.on('error', (error) => {
      logger.error('[BinanceWS] WebSocket Error:', {
        error: formatErrorForLog(error),
      });
      // Ensure termination and cleanup before scheduling reconnect
      if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
         this.ws.terminate();
      }
      this.ws = null; // Ensure ws is nullified after error/termination
      this.scheduleReconnect();
    });
  }

  /** Send the subscription message to Binance */
  private static subscribe(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      logger.warn('[BinanceWS] Cannot subscribe: socket not open.');
      return;
    }
    if (this.subscriptionParams.length) {
      // logger.info('[BinanceWS] Sending SUBSCRIBE request:', { params: this.subscriptionParams }); // Log subscription attempt
      this.ws.send(
        JSON.stringify({
          method: 'SUBSCRIBE',
          params: this.subscriptionParams,
          id: 1, // Use a consistent or incrementing ID if needed for tracking
        }),
        (error) => {
          if (error) {
            logger.error('[BinanceWS] Failed to send SUBSCRIBE message:', {
              error: formatErrorForLog(error),
            });
          }
        }
      );
    } else {
      logger.warn('[BinanceWS] No parameters to subscribe to.');
    }
  }

  /** Send the unsubscription message to Binance */
  private static unsubscribe(paramsToUnsubscribe: string[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      logger.warn('[BinanceWS] Cannot unsubscribe: socket not open.');
      return;
    }
    if (paramsToUnsubscribe.length) {
      // logger.info('[BinanceWS] Sending UNSUBSCRIBE request:', { params: paramsToUnsubscribe });
      this.ws.send(
        JSON.stringify({
          method: 'UNSUBSCRIBE',
          params: paramsToUnsubscribe,
          id: Date.now(), // Use a unique ID for unsubscription requests
        }),
        (error) => {
          if (error) {
            logger.error('[BinanceWS] Failed to send UNSUBSCRIBE message:', {
              error: formatErrorForLog(error),
            });
          }
        }
      );
    }
  }

  /** Close the connection gracefully */
  static disconnect(): void {
    logger.info('[BinanceWS] Disconnect requested.');
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    if (this.ws) {
      // Unsubscribe before closing if parameters exist? Optional, depends on desired behavior.
      // if (this.subscriptionParams.length > 0) {
      //     this.unsubscribe(this.subscriptionParams);
      // }
      this.ws.close(1000, 'Manual disconnection'); // Use standard code 1000 for normal closure
      this.ws = null;
      logger.info('[BinanceWS] Disconnected by request.'); // Log after nullifying
    } else {
         logger.info('[BinanceWS] Already disconnected.');
    }
  }

  /** Schedule a reconnect attempt */
  private static scheduleReconnect(): void {
    // Prevent scheduling multiple reconnects
    if (this.reconnectInterval) {
        // logger.debug('[BinanceWS] Reconnect already scheduled.');
        return;
    }
    // Don't schedule reconnect if disconnect was manually requested (e.g., during shutdown)
    // This might require an additional flag if manual disconnect needs to prevent auto-reconnect.
    logger.info(
      `[BinanceWS] Scheduling reconnect in ${this.RECONNECT_DELAY / 1000}s...`
    );
    this.reconnectInterval = setTimeout(() => {
      this.reconnectInterval = null; // Clear interval ID *before* attempting to connect
      logger.info('[BinanceWS] Attempting reconnect now...');
      this.connect(); // Use connect, which includes checks and subscription logic
    }, this.RECONNECT_DELAY);
  }

  /**
   * Refresh subscriptions dynamically.
   * NOTE: With '!ticker@arr', refreshing typically isn't needed unless
   * the core subscription itself changes, which is unlikely here.
   * This method might be less relevant now but kept for potential future use.
   * */
  static async refreshSubscriptions(): Promise<void> {
    logger.info('[BinanceWS] Refreshing subscriptions requested...');
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      logger.warn('[BinanceWS] Cannot refresh: socket not open.');
      return;
    }

    // Since we are using !ticker@arr, the parameters don't change based on balances.
    // A full disconnect/reconnect might be simpler if a stream reset is needed.
    // However, we keep the structure in case the init logic changes again.

    const oldParams = [...this.subscriptionParams]; // Capture current params
    try {
      // Re-run init to get the *current* desired state (even if it's static now)
      await this.init();

      // Simple comparison for array content changes
      const paramsChanged =
        JSON.stringify(oldParams.sort()) !==
        JSON.stringify(this.subscriptionParams.sort());

      if (paramsChanged) {
        logger.info('[BinanceWS] Subscription parameters have changed. Resubscribing...');
        // Unsubscribe from old (if any) and subscribe to new
        if (oldParams.length > 0) {
          this.unsubscribe(oldParams);
        }
        if (this.subscriptionParams.length > 0) {
          // Add a small delay before subscribing to ensure unsubscribe is processed
          setTimeout(() => this.subscribe(), 500);
        }
      } else {
        logger.info('[BinanceWS] Subscription parameters remain unchanged. No action needed.');
      }
    } catch (error) {
      logger.error('[BinanceWS] Failed to refresh subscriptions:', {
        error: formatErrorForLog(error),
      });
      // Consider if we need to restore oldParams or attempt reconnect on failure
    }
  }

  /** Initialize then connect */
  static async initializeAndConnect(): Promise<void> {
    logger.info('[BinanceWS] Initializing and connecting...');
    await this.init();
    this.connect();
  }
}