// src/types/balance.ts
import { PLATFORM } from './platform';
import { ObjectId } from 'mongodb';
// Interface représentant un solde mappé
export interface MappedBalance {
    _id: ObjectId;
    base: string;
    balance: number;
    available: number;
    platform: PLATFORM;
}

export interface BalanceWithDifference {
    base: string
    platform: PLATFORM
    newSymbol?: boolean
    balanceDifference?: boolean
    zeroBalance?: boolean
}