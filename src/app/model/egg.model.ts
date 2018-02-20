import { Subject } from 'rxjs/Subject';

export interface UserOrder {
    id?: number
    seller?: string
    phone?: string
    car?: number
    bill?: string
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
    bill?: string
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
    weight?: string
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

export interface BillItem {
    weight?: string
    price?: string
}

export interface PriceExtra {
    id?: number
    date?: string
    weightAdjust?: string
}

export interface OrderBill {
    date?: string
    totalCount?: number
    totalWeight?: string
    meanWeight?: string
    totalPrice?: string
    meanPrice?: string
    items?: BillItem[]
    priceRange?: Object
    remark?: string
    priceExtra?: PriceExtra
}

export const DbStatus = {
    CREATING: 'creating',
    CREATED: 'created'
}

export function clearNewOrderItem(item: OrderItem) {
    const newItem: OrderItem = { ...item }
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
    const newItem: UserOrder | CarOrder = { ...item }
    newItem.createdAt = undefined
    newItem.updatedAt = undefined
    return newItem
}
