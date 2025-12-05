// src/types/order.ts
import { ObjectId } from 'mongodb';
export interface MappedOrder {
    _id: ObjectId;
    oId: string
    cId: string | undefined
    platform: string
    symbol: string
    type: string | undefined
    side: string | undefined
    amount: number
    price: number
}