// src/types/balance.ts

// Masquage de l'import ccxt à l'intérieur de ce fichier
import { Balances as CcxtBalances, Balance as CcxtBalance } from 'ccxt';
import { PLATFORM } from './platform';

// Interface représentant un solde mappé
export interface MappedBalance {
    _id?: string;
    base: string;
    balance: number;
    available: number;
    platform: PLATFORM;
}

// Redéfinition de l'interface RawBalance, équivalente à ccxt.Balance
// Ceci permet de ne pas exposer directement le type ccxt dans les autres fichiers
export type RawBalance = CcxtBalance;

// Redéfinition de l'interface RawBalances, équivalente à ccxt.Balances
export type RawBalances = CcxtBalances;