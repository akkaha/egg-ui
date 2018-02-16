import { Subject } from "rxjs/Subject";

export interface UserOrder {
    id?: number
    seller?: string
    phone?: string
    status?: string
    remark?: string
    createdAt?: string
    updatedAt?: string
}

export const OrderStatus = {
    NEW: 'new',
    COMMITED: 'commited',
    FINISHED: 'finished',
    DEPRECATED: 'deprecated',
}

export interface OrderItem {
    id?: number
    weight?: number
    user?: number
    car?: number
    /** use internal */
    dbStatus?: string
    readonly?: boolean
    status?: string
    error?: boolean
    subject?: Subject<OrderItem>
}

export const DbStatus = {
    CREATING: 'creating',
    CREATED: 'created'
}

export function clearNewOrderItem(item: OrderItem) {
    let newItem: OrderItem = { ...item }
    newItem.dbStatus = undefined
    newItem.readonly = undefined
    newItem.status = undefined
    newItem.error = undefined
    newItem.subject = undefined
    return newItem
}