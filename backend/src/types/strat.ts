// src/types/strat.ts
import { ObjectId } from 'mongodb';

export interface MappedStrat {
    _id: ObjectId;
    base: string
    strategies: {
        [key: string]: string
    }
    maxExposure: {
        [key: string]: number
    }
}