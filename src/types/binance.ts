// src/types/binanceTypes.ts (ou à placer dans le même fichier si vous préférez)

// --- Market Data Stream Types ---
// Type générique pour différencier les streams
interface BaseStreamData {
    stream: string;
    data: unknown; // La structure spécifique dépend du type de stream
  }
  
  export interface TickerData {
    e: '24hrTicker'; // Event type
    E: number; // Event time
    s: string; // Symbol
    p: string; // Price change
    P: string; // Price change percent
    w: string; // Weighted average price
    x: string; // First trade(F)-1 price (first trade before the 24hr rolling window)
    c: string; // Last price
    Q: string; // Last quantity
    b: string; // Best bid price
    B: string; // Best bid quantity
    a: string; // Best ask price
    A: string; // Best ask quantity
    o: string; // Open price
    h: string; // High price
    l: string; // Low price
    v: string; // Total traded base asset volume
    q: string; // Total traded quote asset volume
    O: number; // Statistics open time
    C: number; // Statistics close time
    F: number; // First trade ID
    L: number; // Last trade ID
    n: number; // Total number of trades
  }
  
  export interface TickerStream extends BaseStreamData {
    stream: `${string}@ticker`; // Ex: "btcusdt@ticker"
    data: TickerData;
  }
  
  export interface KlineData {
      t: number; // Kline start time
      T: number; // Kline close time
      s: string; // Symbol
      i: string; // Interval
      f: number; // First trade ID
      L: number; // Last trade ID
      o: string; // Open price
      c: string; // Close price
      h: string; // High price
      l: string; // Low price
      v: string; // Base asset volume
      n: number; // Number of trades
      x: boolean; // Is this kline closed?
      q: string; // Quote asset volume
      V: string; // Taker buy base asset volume
      Q: string; // Taker buy quote asset volume
      B: string; // Ignore
  }
  
  export interface KlineStream extends BaseStreamData {
      stream: `${string}@kline_${string}`; // Ex: "btcusdt@kline_1m"
      data: {
          e: 'kline';         // Event type
          E: number;        // Event time
          s: string;        // Symbol
          k: KlineData;     // Kline data
      }
  }
  
  // Ajoutez d'autres interfaces pour depth, trade, etc. si nécessaire
  // ...
  
  // Union type pour toutes les données de marché possibles
  export type MarketData = TickerStream | KlineStream /* | DepthStream | TradeStream | ... */;
  
  // --- User Data Stream Types ---
  interface BaseUserData {
      e: string; // Event type
      E: number; // Event time
  }
  
  export interface BalanceUpdate {
      a: string; // Asset
      f: string; // Free amount
      l: string; // Locked amount
  }
  
  export interface OutboundAccountPosition extends BaseUserData {
      e: 'outboundAccountPosition';
      u: number; // Time of last account update
      B: BalanceUpdate[]; // Balances Array
  }
  
  export interface ExecutionReport extends BaseUserData {
      e: 'executionReport';
      s: string; // Symbol
      c: string; // Client order ID
      S: string; // Side (BUY/SELL)
      o: string; // Order type
      f: string; // Time in force
      q: string; // Order quantity
      p: string; // Order price
      P: string; // Stop price
      F: string; // Iceberg quantity
      g: number; // OrderListId
      C: string; // Original client order ID; This is the ID of the order being canceled
      x: string; // Execution type (NEW, CANCELED, REPLACED, REJECTED, TRADE, EXPIRED)
      X: string; // Order status (NEW, PARTIALLY_FILLED, FILLED, CANCELED, PENDING_CANCEL, REJECTED, EXPIRED)
      r: string; // Order reject reason; will be an error code.
      i: number; // Order ID
      l: string; // Last executed quantity
      z: string; // Cumulative filled quantity
      L: string; // Last executed price
      n: string; // Commission amount
      N: string | null; // Commission asset
      T: number; // Transaction time
      t: number; // Trade ID
      I: number; // Ignore
      w: boolean; // Is the order on the book?
      m: boolean; // Is this trade the maker side?
      M: boolean; // Ignore
      O: number; // Order creation time
      Z: string; // Cumulative quote asset transacted quantity
      Y: string; // Last quote asset transacted quantity (i.e. lastPrice * lastQty)
      Q: string; // Quote Order Qty
      // ... autres champs potentiels
  }
  
  // Union type pour toutes les données utilisateur possibles
  export type UserData = OutboundAccountPosition | ExecutionReport /* | BalanceUpdate | ... */;
  
  
  // --- REST API Response Types ---
  export interface ListenKeyResponse {
      listenKey: string;
  }
  