// config/types.ts
import { PLATFORM } from '@typ/platform'
import { ServerRssConfig } from '@typ/rss'

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
  apiConfig: string,
  alarm: string,
  rssArticles: string
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
  alarm: number
}

export interface SmtpAuth {
  user: string | undefined
  receiver: string | undefined
  pass: string | undefined
}

export interface ServerSmtp {
  host: string
  port: number
  auth: SmtpAuth
}

export interface ServerCronSchedules {
  dashboard: string
  market: string
  ticker: string
  balance: string
  cmc: string
  rss: string
}

export interface ServerLog {
  error: string
  info: string
  exceptions: string
  rejections: string
}

export interface ServerSecurity {
  hashRounds: number
}

export interface Database {
  credentials: DatabaseCredentials
  collection: DatabaseCollection
  category: DatabaseCategory
}
export interface Api {
  cmc: ApiCmc
  gemini: ApiGemini
  platform: ApiPlatforms
}

export interface ApiPlatform {
  iv: string
  apiKey: string
  secretKey?: string
  passphrase?: string
}

export type ApiPlatforms = {
  [key in PLATFORM]: ApiPlatform
}

export interface ApiCmc {
  apiKey: string
  base_url_icon: string
  iv: string
  url: string
}

export interface ApiGemini {
  apiKey: string
  iv: string
  model: string
}

export interface Server {
  cacheExpirationTimes: CacheExpirationTimes
  smtp: ServerSmtp
  cronSchedules: ServerCronSchedules
  rss: ServerRssConfig
  logFiles: ServerLog
  security: ServerSecurity
  lastModified?: number
}

export interface Environment {
  port: number
  isOffline: boolean
  databaseConfig: Database
  apiConfig: Api
  serverConfig: Server
}
