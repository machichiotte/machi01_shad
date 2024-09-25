// src/types/order
export interface MappedOrder {
    _id?: string
    oId: string
    cId: string | undefined
    platform: string
    symbol: string
    type: string | undefined
    side: string | undefined
    amount: number
    price: number
}