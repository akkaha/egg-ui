export interface UserOrder {
    id?: number
    seller?: string
    phone?: string
    status?: string
}

export const OrderStatus = {
    NEW: 'new',
    COMMITED: 'commited',
    FINISHED: 'finished',
    DEPRECATED: 'deprecated',
}