// src/types/metrics.ts

import { MappedOrder } from "./order";
import { MappedTrade } from "./trade";

export interface Asset {
    base: string; // Symbole de l'actif (ex: "ASSET_SYMBOL")
    iconUrl: string; // URL de l'icône
    ticker: number; // Symbole de trading (ex: "TICKER_SYMBOL")
    name: string; // Nom de l'actif (ex: "ASSET_NAME")
    tags: string[]; // Type de l'actif (ex: ["stablecoin", "defi", "gaming"])
    cmc: CMC; // Informations CMC
    strat: Strat; // Stratégie appliquée
    orders: Orders; // Informations sur les ordres et les trades
    liveData: LiveData; // Données en direct
    profit: number; // Profit calculé
    platform: string; // Plateforme d'échange (ex: "binance")
}

// Interface pour la stratégie (strat)
interface Strat {
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
        currentOrders: MappedOrder[]; // Liste des ordres ouverts
    };
    trade: {
        totalBuy: number; // Total des achats
        totalSell: number; // Total des ventes
        totalAmountBuySell: number; // Quantité totale achetée et vendue
        averageEntryPrice: number; // Prix moyen d'entrée
        trades: MappedTrade[]; // Liste des trades
    };
}
