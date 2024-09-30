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
