// src/types/balance.ts
import { PLATFORM } from './platform';

// Interface représentant un solde mappé
export interface MappedBalance {
    _id: { $oid: string };
    base: string;
    balance: number;
    available: number;
    platform: PLATFORM;
}
