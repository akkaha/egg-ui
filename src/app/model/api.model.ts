export interface ApiReq {
    path?: string
    body?: Object
    extra?: Object
  }
  
  interface DataBody<T> {
    total?: number
    list?: T
  }
  
  export interface ApiRes<T> {
    code: string
    msg: string
    data?: T & DataBody<T>
    extra?: Object
  }
  
  export interface ApiResObj {
    code: string
    msg: string
    // for go
    Code?: string
    // for go
    Msg?: string
    data?: Object
    extra?: Object
  }
  
  interface GoDataBody<T> {
    Total: number
    List: T[]
  }
  
  export interface GoApiRes<T> {
    Code?: string
    Msg?: string
    Data?: T & GoDataBody<T>
  }
  
  export interface SelectOption {
    label: string
    value: string
    desc: string
    disabled: boolean
    Label: string
    Value: string
    Desc: string
    Disabled: boolean
  }
  
  export const APICODE = {
    /** 默认结果码 00000 */
    DEFAULT: '00000',
    /** API 处理正常,结果可依赖[10000, 20000) */
    OK: '10000',
    /** API 传参不符合要求[20000, 30000) */
    INVALID: '20000',
    /** 后端错误或异常[90000, ~] */
    ERROR: '90000',
    /** 未登陆 */
    NOT_LOGIN: '90001',
    /** 没有权限 */
    PERMISSION_DENIED: '90002',
  }
  
  export class ActorEvent<T> {
    code?: string
    msg?: string
    data?: T & DataBody<T>
    type?: string = 'init' || 'list' || 'item' || 'over' || 'notify'
  }
  
  export const ActorEventType = {
    INIT: 'init',
    LIST: 'list',
    ITEM: 'item',
    OVER: 'over',
    NOTIFY: 'notify'
  }
  