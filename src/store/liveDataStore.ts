// src/store/liveDataStore.ts
import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'

// Re-use or import the TickerData interface
export interface TickerData {
  type: string
  symbol: string
  priceChangePercent: string
  lastPrice: string
  highPrice: string
  lowPrice: string
  volume: string
  quoteVolume: string
  eventTime: number
}

export const useLiveDataStore = defineStore('liveData', () => {
  // State: Store all ticker data received, keyed by symbol
  const tickers = reactive<Record<string, TickerData>>({})

  const KNOWN_QUOTES = [
    'USDT',
    'USDC',
    'TUSD',
    'BUSD',
    'DAI',
    'FDUSD',
    'PAX', // Stablecoins
    'BTC',
    'ETH',
    'BNB', // Major Cryptos
    'EUR',
    'GBP',
    'USD',
    'TRY',
    'BRL',
    'AUD',
    'RUB' // Example Fiats
    // Add any other quote currencies you expect to receive
  ].map((q) => q.toUpperCase()) // Ensure they are uppercase

  // Actions: Function to update the store state
  function updateTicker(data: TickerData) {
    if (data && data.type === 'ticker' && data.symbol) {
      tickers[data.symbol] = data
      // console.log(`Store updated for symbol: ${data.symbol}`); // Optional debug log
    } else {
      console.warn('Received message in store does not match expected ticker format:', data)
    }
  }

  // Getters: Computed properties derived from state
  const sortedTickersByVolume = computed(() => {
    const tickersArray = Object.values(tickers)
    tickersArray.sort((a, b) => Number(b.quoteVolume) - Number(a.quoteVolume))
    return tickersArray
  })

  const getTickerBySymbol = (symbol: string): TickerData | undefined => {
    return tickers[symbol]
  }

  // ***Crucial Getter for your dropdown***
  // Finds all markets (symbols) available for a given base asset (e.g., 'BTC')
  const getMarketsForBase = (baseAsset: string): string[] => {
    const baseUpper = baseAsset.toUpperCase();

    return Object.keys(tickers)
        .filter(symbol => {
            // 1. Check if the symbol starts with the exact base asset
            if (!symbol.startsWith(baseUpper)) {
                return false;
            }

            // 2. Extract the potential quote part
            const potentialQuote = symbol.substring(baseUpper.length);

            // 3. Check if the potential quote part is:
            //    a) Not empty
            //    b) Exists in our list of KNOWN_QUOTES
            if (potentialQuote.length > 0 && KNOWN_QUOTES.includes(potentialQuote)) {
                 // If both conditions are met, it's a valid market for this base
                 // e.g., base='ETH', symbol='ETHUSDT' -> potentialQuote='USDT', which is in KNOWN_QUOTES -> true
                 // e.g., base='ETH', symbol='ETHFIUSDT' -> potentialQuote='FIUSDT', NOT in KNOWN_QUOTES -> false
                 // e.g., base='ETHFI', symbol='ETHFIUSDT' -> potentialQuote='USDT', which is in KNOWN_QUOTES -> true (Correct for ETHFI base)
                return true;
            }

            // If the quote part doesn't match known quotes, filter it out
            return false;
        })
        .sort(); // Sort alphabetically
    };

  // Getter to provide live price for a specific symbol
  const getCurrentPrice = (symbol: string): number | undefined => {
    const ticker = tickers[symbol]
    if (ticker?.lastPrice) {
      const price = Number(ticker.lastPrice)
      return isNaN(price) ? undefined : price
    }
    return undefined
  }

  // Getter to provide 24h change for a specific symbol
  const getChangePercent = (symbol: string): number | undefined => {
    const ticker = tickers[symbol]
    if (ticker?.priceChangePercent) {
      const change = Number(ticker.priceChangePercent)
      return isNaN(change) ? undefined : change
    }
    return undefined
  }

  return {
    tickers, // Expose raw data if needed elsewhere
    updateTicker,
    sortedTickersByVolume, // Keep this if Livedata.vue still displays the table
    getTickerBySymbol,
    getMarketsForBase,
    getCurrentPrice,
    getChangePercent
  }
})
