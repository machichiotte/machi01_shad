// src/types/timestamp.ts
import { ObjectId } from 'mongodb';

export interface ExchangeData {
    [key: string]: {
        $numberLong: string;
    };
}

export interface TimestampData {
    _id: ObjectId;
    balance: ExchangeData;
    order: ExchangeData;
    cmc: {
        $numberLong: string;
    };
    machi: {
        $numberLong: string;
    };
    strategy: {
        $numberLong: string;
    };
    market: ExchangeData;
    ticker: ExchangeData;
    trade: ExchangeData;
}