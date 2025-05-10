// src/types/config.ts
import { PLATFORM } from './platform'

export interface KeyPayload {
    type: string;
    platform: string;
    apiKey: string;
    secretKey?: string;
    passphrase?: string;
  }

export interface ApiConfig {
    cmc: CmcConfig
    platform: ApiKeysPlatform
  }
  
  export interface ApiKeyConfig {
    iv: string
    apiKey: string 
    secretKey?: string
    passphrase?: string
  }
  
  export type ApiKeysPlatform = {
    [key in PLATFORM]: ApiKeyConfig
  }
  export interface CmcConfig {
    apiKey: string
    iv: string
    url: string
  }




// pas encore utile
export interface DatabaseCredentials {
  user: string
  password: string
  cluster: string
  dbName: string
}

export interface DatabaseCollection {
  [key: string]: string
}

export interface DatabaseCategory {
  balance: string
  cmc: string
  timestamp: string
  market: string
  order: string
  dashboard: string
  strat: string
  ticker: string
  trade: string
  serverConfig: string
  apiConfig: string
}

export interface CacheExpirationTimes {
  cmc: number
  balance: number
  highestPrice: number
  timestamp: number
  market: number
  order: number
  dashboard: number
  strat: number
  swap: number
  ticker: number
  trade: number
  user: number
  serverConfig: number
  apiConfig: number
}

export interface SmtpAuthConfig {
  user: string | undefined
  receiver: string | undefined
  pass: string | undefined
}

export interface ServerSmtp {
  host: string
  port: number
  auth: SmtpAuthConfig
}

export interface ServerCronSchedules {
  dashboard: string
  market: string
  ticker: string
  balance: string
  cmc: string
}

export interface ServerLog {
  error: string
  info: string
}

export interface ServerSecurity {
  hashRounds: number
}

export interface DatabaseConfig {
  credentials: DatabaseCredentials
  collection: DatabaseCollection
  category: DatabaseCategory
}

export interface ServerConfig {
  cacheExpirationTimes: CacheExpirationTimes
  smtp: ServerSmtp
  cronSchedules: ServerCronSchedules
  logFiles: ServerLog
  security: ServerSecurity
  lastModified?: number
}

export interface EnvironmentConfig {
  port: number
  isOffline: boolean
  databaseConfig: DatabaseConfig
  apiConfig: ApiConfig
  serverConfig: ServerConfig
}
