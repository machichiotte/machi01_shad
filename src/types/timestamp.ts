// src/types/timestamp
export interface ExchangeData {
    [key: string]: {
        $numberLong: string;
    };
}

export interface TimestampData {
    _id: {
        $oid: string;
    };
    balance: ExchangeData;
    order: ExchangeData;
    cmc: {
        $numberLong: string;
    };
    strategy: {
        $numberLong: string;
    };
    market: ExchangeData;
    ticker: ExchangeData;
}