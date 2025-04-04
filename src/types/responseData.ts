// src/types/responseData.ts
import { ObjectId } from 'mongodb';
import { PLATFORM } from './platform';

export enum TYPES {
  TRADE = 'trade',
  BALANCE = 'balance',
  STRAT = 'strat',
  CMC = 'cmc',
  ORDER = 'order',
  MACHI = 'machi',
  TICKER = 'ticker',
  RSS = 'rss'
}

export interface RssItem {
  _id: { $oid: string };
  link: string;
  title: string;
  sourceFeed: string;
  fetchedAt: { $date: string };
  scrapedContent: boolean;
  publicationDate: { $date: string };
  summary: string;
  analysis: string;
  processedAt: { $date: string };
  error: string | null;
}

export interface Balance {
  _id: ObjectId;
  base: string;
  balance: number;
  available: number;
  platform: PLATFORM;
}

export interface Trade {
  _id: ObjectId;
  base: string
  quote: string
  pair: string
  dateUTC?: string
  timestamp?: number
  side: string
  price: number
  amount: number
  total: number
  fee: number
  feecoin: string
  platform: string
  eqUSD: number
  orderid: string
}

export interface TradeTransformed extends Omit<Trade, '_id'> {
  _id?: ObjectId
  timestampVal: number
}

export interface Strat {
  _id: ObjectId;
  base: string
  strategies: {
    [key: string]: string
  }
  maxExposure: {
    [key: string]: number
  }
}

export interface Cmc {
  _id?: ObjectId;
  id: number;
  name: string;
  symbol: string;
  slug: string;
  num_market_pairs: number;
  date_added: string;
  tags: string[];
  max_supply: number | null;
  circulating_supply: number;
  total_supply: number;
  platform: {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    token_address: string;
  } | null;
  infinite_supply: boolean;
  cmc_rank: number;
  self_reported_circulating_supply: number | null;
  self_reported_market_cap: number | null;
  tvl_ratio: number | null;
  last_updated: string;
  quote: {
    USD: {
      price: number;
      volume_24h: number;
      volume_change_24h: number;
      percent_change_1h: number;
      percent_change_24h: number;
      percent_change_7d: number;
      percent_change_30d: number;
      percent_change_60d: number;
      percent_change_90d: number;
      market_cap: number;
      market_cap_dominance: number;
      fully_diluted_market_cap: number;
      tvl: number | null;
      last_updated: string;
    };
  };
}

export interface Order {
  _id: ObjectId;
  oId: string
  cId: string | undefined
  platform: string
  symbol: string
  type: string | undefined
  side: string | undefined
  amount: number
  price: number
}

export interface Ticker {
  _id: ObjectId;
  symbol: string
  timestamp: number | undefined
  last: number | undefined
  platform: string
}

export interface Asset {
  base: string; // Symbole de l'actif (ex: "ASSET_SYMBOL")
  iconUrl: string; // URL de l'icône
  ticker: string; // Symbole de trading (ex: "TICKER_SYMBOL")
  name: string; // Nom de l'actif (ex: "ASSET_NAME")
  tags: string[]; // Type de l'actif (ex: ["stablecoin", "defi", "gaming"])
  cmc: AssetCmc; // Informations CMC
  strat: AssetStrat; // Stratégie appliquée
  orders: AssetOrders; // Informations sur les ordres et les trades
  liveData: AssetLiveData; // Données en direct
  profit: number; // Profit calculé
  platform: string; // Plateforme d'échange (ex: "binance")
}

// Interface pour la stratégie (strat)
export interface AssetStrat {
  strategy: string; // Nom de la stratégie
  maxExposition: number; // Exposition maximale
  takeProfits: TakeProfits; // Take profits avec statut
}

// Interface pour les informations de CMC
interface AssetCmc {
  currentCmcPrice: number; // Prix actuel selon CMC
  rank: number; // Rang CMC
  cryptoPercentChange24h: number; // Changement sur 24 heures
  cryptoPercentChange7d: number; // Changement sur 7 jours
  cryptoPercentChange30d: number; // Changement sur 30 jours
  cryptoPercentChange60d: number; // Changement sur 60 jours
  cryptoPercentChange90d: number; // Changement sur 90 jours
}

// Interface pour la section "liveData"
export interface AssetLiveData {
  balance: number; // Solde actuel
  currentPrice: number; // Prix actuel
  currentPossession: number; // Possession actuelle
}

// Interface pour les take profits
export interface TakeProfit {
  price: number; // Prix du TP
  amount: number; // Montant pour ce TP
  percentToNextTp?: number; // Pourcentage jusqu'au prochain TP (optionnel pour certains TP)
}

// Interface pour les takeProfits avec le statut des TP
export interface TakeProfits {
  tp1: TakeProfit;
  tp2: TakeProfit;
  tp3: TakeProfit;
  tp4: TakeProfit;
  tp5: TakeProfit;
  status: number[]; // Statut des TP
}

// Interface principale pour les ordres (open et trade)
interface AssetOrders {
  open: {
    nbOpenBuyOrders: number; // Nombre d'ordres d'achat ouverts
    nbOpenSellOrders: number; // Nombre d'ordres de vente ouverts
    currentOrders: Order[]; // Liste des ordres ouverts
  };
  trade: {
    totalBuy: number; // Total des achats
    totalSell: number; // Total des ventes
    totalAmountBuy: number; // Quantité totale achetée
    totalAmountSell: number; // Quantité totale vendue
    averageEntryPrice: number; // Prix moyen d'entrée
    trades: Trade[]; // Liste des trades
  };
}