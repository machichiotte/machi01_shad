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
  TICKER = 'ticker'
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
  date?: string
  timestamp?: number
  type: string
  price: number
  amount: number
  total: number
  fee: number
  feecoin: string
  platform: string
  totalUSDT: number
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

/*export interface Machi {
  _id: {
    $oid: string; // ID de l'objet en format MongoDB ObjectID
  };
  iconUrl: string; // URL de l'icône
  base: string; // Nom de l'actif (ex: LIT)
  status: number[] | string; // Tableau de statuts (la structure reste la même pour éviter tout conflit avec la base de données)
  strat: string; // Stratégie appliquée (ex: Shad)
  ratioShad: number; // Ratio Shad
  totalShad: number; // Total Shad
  rank: number; // Classement de l'actif
  averageEntryPrice: number; // Prix moyen d'entrée
  totalBuy: number; // Total des achats
  maxExposition: number; // Exposition maximale
  percentageDifference: number; // Différence en pourcentage
  currentPrice: number; // Prix actuel
  currentPossession: number; // Quantité actuelle en possession
  profit: number; // Profit réalisé
  totalSell: number; // Total des ventes
  recupShad: number; // Récupération de Shad
  nbOpenBuyOrders: number; // Nombre d'ordres d'achat ouverts
  nbOpenSellOrders: number; // Nombre d'ordres de vente ouverts
  totalAmount: number; // Quantité totale
  balance: number; // Solde
  recupTp1: number; // Récupération du premier take profit
  recupTpX: number; // Récupération de Shad pour le take profit X
  percentToNextTp: number; // Pourcentage jusqu'au prochain take profit
  platform: string; // Plateforme utilisée (ex: binance)
  currentCmcPrice: number; // Prix actuel sur CoinMarketCap
  cryptoPercentChange24h: number; // Variation du prix sur 24 heures
  cryptoPercentChange7d: number; // Variation du prix sur 7 jours
  cryptoPercentChange30d: number; // Variation du prix sur 30 jours
  cryptoPercentChange60d: number; // Variation du prix sur 60 jours
  cryptoPercentChange90d: number; // Variation du prix sur 90 jours
  stratExpo: number; // Exposition stratégique
  amountTp1: number; // Quantité pour le take profit 1
  priceTp1: number; // Prix pour le take profit 1
  amountTp2: number; // Quantité pour le take profit 2
  priceTp2: number; // Prix pour le take profit 2
  amountTp3: number; // Quantité pour le take profit 3
  priceTp3: number; // Prix pour le take profit 3
  amountTp4: number; // Quantité pour le take profit 4
  priceTp4: number; // Prix pour le take profit 4
  amountTp5: number; // Quantité pour le take profit 5
  priceTp5: number; // Prix pour le take profit 5
}*/

export interface Ticker {
  _id: ObjectId;
  symbol: string
  timestamp: number | undefined
  last: number | undefined
  platform: string
}

/* pour remplacer Shad, mais il faut un autre nom que asset */
export interface Asset {
  base: string; // Symbole de l'actif (ex: "ASSET_SYMBOL")
  iconUrl: string; // URL de l'icône
  ticker: string; // Symbole de trading (ex: "TICKER_SYMBOL")
  name: string; // Nom de l'actif (ex: "ASSET_NAME")
  tags: string[]; // Type de l'actif (ex: ["stablecoin", "defi", "gaming"])
  cmc: CMC; // Informations CMC
  strat: AssetStrat; // Stratégie appliquée
  orders: Orders; // Informations sur les ordres et les trades
  liveData: LiveData; // Données en direct
  profit: number; // Profit calculé
  platform: string; // Plateforme d'échange (ex: "binance")
}

// Interface pour la stratégie (strat)
interface AssetStrat {
  strategy: string; // Nom de la stratégie
  maxExposition: number; // Exposition maximale
  takeProfits: TakeProfits; // Take profits avec statut
}

// Interface pour les informations de CMC
interface CMC {
  currentCmcPrice: number; // Prix actuel selon CMC
  rank: number; // Rang CMC
  cryptoPercentChange24h: number; // Changement sur 24 heures
  cryptoPercentChange7d: number; // Changement sur 7 jours
  cryptoPercentChange30d: number; // Changement sur 30 jours
  cryptoPercentChange60d: number; // Changement sur 60 jours
  cryptoPercentChange90d: number; // Changement sur 90 jours
}

// Interface pour la section "liveData"
interface LiveData {
  balance: number; // Solde actuel
  currentPrice: number; // Prix actuel
  currentPossession: number; // Possession actuelle
}

// Interface pour les take profits
interface TakeProfit {
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
interface Orders {
  open: {
    nbOpenBuyOrders: number; // Nombre d'ordres d'achat ouverts
    nbOpenSellOrders: number; // Nombre d'ordres de vente ouverts
    currentOrders: Order[]; // Liste des ordres ouverts
  };
  trade: {
    totalBuy: number; // Total des achats
    totalSell: number; // Total des ventes
    totalAmountBuySell: number; // Quantité totale achetée et vendue
    averageEntryPrice: number; // Prix moyen d'entrée
    trades: Trade[]; // Liste des trades
  };
}