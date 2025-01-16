// config/defaults.ts
export const DEFAULT_PORT = 10000
export const DEFAULT_OFFLINE_MODE = false

export const DEFAULT_MONGODB_COLLECTION = {
  cmc: 'collection_cmc',
  balance: 'collection_balance',
  highestPrice: 'collection_highest_price',
  timestamp: 'collection_timestamp',
  market: 'collection_market',
  order: 'collection_order',
  machi: 'collection_machi',
  strat: 'collection_strategy',
  swap: 'collection_swap',
  ticker: 'collection_ticker',
  trade: 'collection_trade',
  user: 'collection_user',
  serverConfig: 'collection_serverconfig',
  apiConfig: 'collection_apiconfig',
  alarm: 'collection_alarm',
}

export const DEFAULT_DATABASE_CATEGORY = {
  cmc: 'cmc',
  balance: 'balance',
  highestPrice: 'highestPrice',
  timestamp: 'timestamp',
  market: 'market',
  order: 'order',
  machi: 'machi',
  strat: 'strat',
  swap: 'swap',
  ticker: 'ticker',
  trade: 'trade',
  user: 'user',
  serverConfig: 'serverConfig',
  apiConfig: 'apiConfig',
  alarm: 'alarm'
}

export const DEFAULT_MONGODB_CREDENTIALS = {
  user: '',
  password: '',
  cluster: '',
  dbName: ''
}

export const DEFAULT_DATABASE_CONFIG = {
  credentials: DEFAULT_MONGODB_CREDENTIALS,
  collection: DEFAULT_MONGODB_COLLECTION,
  category: DEFAULT_DATABASE_CATEGORY
}

export const DEFAULT_APICONFIG = {
  cmc: {
    url: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
    base_url_icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/',
    iv: '',
    apiKey: ''
  },
  platform: {
    binance: {
      apiKey: '',
      secretKey: '',
      iv: ''
    },
    kucoin: {
      apiKey: '',
      secretKey: '',
      passphrase: '',
      iv: ''
    },
    htx: {
      apiKey: '',
      secretKey: '',
      iv: ''
    },
    okx: {
      apiKey: '',
      secretKey: '',
      passphrase: '',
      iv: ''
    },
    gateio: {
      apiKey: '',
      secretKey: '',
      iv: ''
    }
  }
}

export const DEFAULT_CACHE_EXPIRATION_TIMES = {
  cmc: 111,
  balance: 111,
  highestPrice: 111,
  timestamp: 111,
  market: 111,
  order: 111,
  machi: 111,
  strat: 111,
  swap: 111,
  ticker: 111,
  trade: 111,
  user: 111,
  serverConfig: 111,
  apiConfig: 111,
  alarm: 111
}

export const DEFAULT_SMTP = {
  host: 'smtp.ethereal.email',
  port: 111,
  auth: {
    user: 'sender@email.com',
    receiver: 'receiver@email.com',
    pass: 'abc123'
  }
}

export const DEFAULT_CRON_SCHEDULE = {
  machi: '*/30 * * * *',
  market: '* 23 * * *',
  ticker: '*/1 * * * *',
  balance: '*/2 * * * *',
  cmc: '0 23 * * *'
}

export const DEFAULT_LOG_FILES = {
  error: 'error.log',
  info: 'info.log'
}

export const DEFAULT_SECURITY = {
  hashRounds: 10
}

export const DEFAULT_SERVER_CONFIG = {
  cacheExpirationTimes: DEFAULT_CACHE_EXPIRATION_TIMES,
  smtp: DEFAULT_SMTP,
  cronSchedules: DEFAULT_CRON_SCHEDULE,
  logFiles: DEFAULT_LOG_FILES,
  security: DEFAULT_SECURITY
}
