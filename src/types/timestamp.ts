// src/types/timestamp.ts
export interface ExchangeData {
    [key: string]: number
}

export interface TimestampData {
    _id: {
        $oid: string;
    };
    balance: ExchangeData;
    order: ExchangeData;
    cmc: number
    strategy: number
    market: ExchangeData;
    ticker: ExchangeData;
}