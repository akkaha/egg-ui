import { Subject } from "rxjs/Subject";

export interface UserOrder {
    id?: number
    seller?: string
    phone?: string
    car?: number
    status?: string
    remark?: string
    createdAt?: string
    updatedAt?: string
}

export interface CarOrder {
    id?: number
    serial?: string
    driver?: string
    driverPhone?: string
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
    createdAt?: string
    updatedAt?: string
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
    newItem.createdAt = undefined
    newItem.updatedAt = undefined
    return newItem
}

export function clearOrderField(item: UserOrder | CarOrder) {
    let newItem: UserOrder | CarOrder = { ...item }
    newItem.createdAt = undefined
    newItem.updatedAt = undefined
    return newItem
}