// src/types/strat.ts
import { ObjectId } from 'mongodb';

export interface MappedStrat {
    _id: ObjectId;
    asset: string
    strategies: {
        [key: string]: string
    }
    maxExposure: {
        [key: string]: number
    }
}