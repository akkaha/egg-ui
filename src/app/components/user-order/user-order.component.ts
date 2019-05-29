import 'rxjs/add/operator/debounceTime'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/operator/switchMap'

import { Location } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { NzMessageService, NzModalService } from 'ng-zorro-antd'
import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'

import {
  API_ORDER_ITEM_BATCH_UPDATE_CAR,
  API_ORDER_ITEM_DELETE,
  API_ORDER_ITEM_INSERT,
  API_ORDER_ITEM_UPDATE,
  API_USER_ORDER_DETAIL,
  API_USER_ORDER_INSERT,
  API_USER_ORDER_UPDATE,
} from '../../api/egg.api'
import { ApiRes, ApiResObj } from '../../model/api.model'
import {
  CarOrder,
  clearNewOrderItem,
  clearOrderField,
  DbStatus,
  OrderItem,
  OrderStatus,
  UserOrder,
} from '../../model/egg.model'
import { CarSelectorComponent } from '../car-selector/car-selector.component'

@Component({
  templateUrl: './user-order.component.html',
  styleUrls: ['./user-order.component.css']
})
export class UserOrderComponent implements OnInit {

  allChecked = false
  indeterminate = false
  checkedNumber = 0
  checkedItems: OrderItem[] = []
  orderSubject = new Subject()
  order: UserOrder = {}
  values: OrderItem[] = []
  count = 0
  weightCache: { [key: string]: string } = {}
  readonly = false
  tablePageIndex = 1
  tablePageSize = 5
  pageSizeSelectorValues = [5, 10, 20, 30, 40, 50, 100, 200]
  defaultCar: CarOrder
  popVisible: { [key: string]: boolean } = {}

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private http: HttpClient,
    private message: NzMessageService,
    private modal: NzModalService,
  ) { }

  addToCar() {
    this.modal.create({
      nzTitle: '选择车次',
      nzContent: CarSelectorComponent,
      nzOnOk() { },
      nzOnCancel() { },
      nzWidth: 640,
      nzComponentParams: {
        onSelect: (selectedCar: CarOrder) => {
          const req = {
            car: selectedCar.id,
            ids: this.checkedItems.map(item => item.id),
            isByUser: false,
          }
          this.http.post<ApiResObj>(API_ORDER_ITEM_BATCH_UPDATE_CAR, req).subscribe(res => {
            this.message.success('操作成功')
            this.checkedItems.forEach(item => item.car = req.car)
          })
        }
      }
    })
  }
  removeFromCar() {
    this.modal.confirm({
      nzTitle: '移除',
      nzContent: `确认移除吗?`,
      nzOnOk: () => {
        const req = {
          ids: this.checkedItems.map(item => item.id),
          isByUser: false,
        }
        this.http.post<ApiRes<UserOrder>>(API_ORDER_ITEM_BATCH_UPDATE_CAR, req).subscribe(res => {
          this.message.success('操作成功')
          this.checkedItems.forEach(item => item.car = undefined)
        })
      }
    })
  }
  refreshStatus() {
    const allChecked = this.values.every(value => value.checked === true)
    const allUnChecked = this.values.every(value => !value.checked)
    this.allChecked = allChecked
    this.indeterminate = (!allChecked) && (!allUnChecked)
    this.checkedItems = this.values.filter(value => value.checked)
    this.checkedNumber = this.checkedItems.length
  }
  checkAll(value) {
    if (value) {
      this.values.forEach(item => {
        item.checked = true
      })
    } else {
      this.values.forEach(item => {
        item.checked = false
      })
    }
    this.refreshStatus()
  }
  descCar(car: CarOrder) {
    if (car) {
      return `单号: ${car.id}, 姓名: ${car.driver}, 日期: ${car.createdAt}`
    } else {
      return '未选择'
    }
  }
  selectCar() {
    this.modal.create({
      nzTitle: '选择默认车次(本单中的单位默认加入该车次)',
      nzContent: CarSelectorComponent,
      nzOnOk() { },
      nzOnCancel() { },
      nzComponentParams: {
        data: this.defaultCar,
        onSelect: (selectedCar: CarOrder) => {
          this.defaultCar = selectedCar
          this.order.car = this.defaultCar.id
          this.orderChange()
        }
      }
    })
  }
  itemSelectCar(item: OrderItem, index: number) {
    let carOrder
    if (item.car) {
      carOrder = { id: item.car }
    } else {
      if (!item.id) {
        carOrder = this.defaultCar
      }
    }
    this.popVisible[index] = false
    this.modal.create({
      nzTitle: '选择车次(只是该单位)',
      nzContent: CarSelectorComponent,
      nzOnOk() { },
      nzOnCancel() { },
      nzComponentParams: {
        data: carOrder,
        onSelect: (selectedCar: CarOrder) => {
          const isNewCar = item.car !== selectedCar.id
          item.car = selectedCar.id
          if (item.id && isNewCar) {
            item.status = '待更新'
            item.subject.next(item)
          }
        }
      }
    })
  }
  itemDeleteCar(item: OrderItem, index: number) {
    this.popVisible[index] = false
    item.car = null
    item.status = '待更新'
    item.subject.next(item)
  }
  refreshTableData() {
    this.values = [...this.values]
  }
  itemIndex(index: number) {
    return (this.tablePageIndex - 1) * this.tablePageSize + index
  }
  isFinished() {
    return OrderStatus.FINISHED === this.order.status
  }
  orderChange() {
    this.orderSubject.next()
  }
  onEnter(weight: string) {
    this.doAddNewItem(weight)
  }
  itemChange(item: OrderItem, index: number) {
    if (index === this.values.length - 1) {
      this.doAddEmptyItem()
    }
    if (item.id) {
      // for foramt error then delete character
      if (item.weight.toString() === this.weightCache[item.id]) {
        if (item.error) {
          item.error = false
          item.status = '上传完成'
        }
        return
      }
      item.status = '待更新'
    } else {
      item.status = '待上传'
    }
    item.subject.next(item)
  }
  itemBlur(item: OrderItem, index: number) {
    if (item.weight && !this.readonly) {
      this.itemChange(item, index)
    }
  }
  remove(item: UserOrder, index: number) {
    if (item.id) {
      this.modal.confirm({
        nzTitle: '删除',
        nzContent: '确认删除?',
        nzOnOk: () => {
          this.http.post<ApiRes<OrderItem>>(API_ORDER_ITEM_DELETE, { id: item.id }).subscribe(res => {
            this.values.splice(index, 1)
            this.refreshTableData()
            this.calcCount()
            delete this.weightCache[item.id]
          })
        }
      })
    } else {
      this.values.splice(index, 1)
      this.refreshTableData()
    }
  }
  doUpload(item: OrderItem) {
    const r = /^[1-9]\d{0,3}(\.\d{1}){0,1}$/
    if (item.weight && r.test(item.weight.toString())) {
      item.error = false
      if (item.id) {
        // update
        this.http.post<ApiRes<OrderItem>>(API_ORDER_ITEM_UPDATE, clearNewOrderItem(item)).subscribe(res => {
          item.status = '上传完成'
          item.id = res.data.id
          this.weightCache[item.id] = item.weight.toString()
          this.calcCount()
        })
      } else {
        // insert
        if (!item.dbStatus) {
          const user = this.order.id
          if (user) {
            item.user = user
            item.dbStatus = DbStatus.CREATING
            item.status = '数据创建中...'
            if (this.defaultCar && this.defaultCar.id) {
              item.car = this.defaultCar.id
            }
            this.http.post<ApiRes<OrderItem>>(API_ORDER_ITEM_INSERT, clearNewOrderItem(item)).subscribe(res => {
              item.status = '上传完成'
              item.id = res.data.id
              this.weightCache[item.id] = item.weight.toString()
              item.dbStatus = DbStatus.CREATED
              this.calcCount()
            })
          }
        }
      }
    } else {
      item.status = '格式错误'
      item.error = true
    }
  }
  calcCount() {
    let c = 0
    for (const o of this.values) {
      if (o.status === '上传完成') {
        c += 1
      }
    }
    this.count = c
  }
  isItemSaved(item: OrderItem) {
    return item.status === '上传完成'
  }
  itemStyle(item: OrderItem) {
    if (this.isItemSaved(item)) {
      return {
        'color': 'green'
      }
    } else {
      return {
        'color': 'red'
      }
    }
  }
  doAddNewItem(weight: string) {
    const orderItemUploadSubject = new Subject<OrderItem>()
    orderItemUploadSubject.pipe(debounceTime(500)).subscribe(item => {
      this.doUpload(item)
    })
    const newItem = { status: '待上传', subject: orderItemUploadSubject, weight: weight }
    this.values.push(newItem)
    this.refreshTableData()
    this.tablePageIndex = Math.ceil(this.values.length / this.tablePageSize)
    orderItemUploadSubject.next(newItem)
  }
  doAddEmptyItem() {
    // one item to one suject to reduce conflict
    const orderItemUploadSubject = new Subject<OrderItem>()
    orderItemUploadSubject.pipe(debounceTime(500)).subscribe(item => {
      this.doUpload(item)
    })
    this.values.push({ status: '待上传', subject: orderItemUploadSubject })
    this.refreshTableData()
  }
  doCommit() {
    this.http.get<ApiRes<{ order: UserOrder, items: OrderItem[] }>>(`${API_USER_ORDER_DETAIL}/${this.order.id}`).subscribe(res => {
      const order = res.data.order
      const items = res.data.items
      const feItems = this.values.filter(item => {
        if (item.id) {
          return true
        } else {
          return false
        }
      })
      const warnings = []
      if (feItems.length !== items.length) {
        warnings.push('数量不一致')
      }
      for (let i = 0; i < feItems.length; ++i) {
        const feItem = feItems[i]
        const dbItem = items[i]
        if (!(dbItem && feItem.weight.toString() === dbItem.weight.toString() && this.isSameCar(feItem, dbItem))) {
          // tslint:disable-next-line:max-line-length
          warnings.push(`(序号 ${i + 1})=>前端: w-${feItem.weight},car-${feItem.car}, 数据库: w-${dbItem ? dbItem.weight : 'null'},car-${dbItem.car}`)
        }
      }
      this.modal.confirm({
        nzTitle: `${warnings.length > 0 ? '数据异常, 请检查后' : ''}确认提交`,
        nzContent: `编号: ${order.id}, 姓名: ${order.seller}, 手机: ${order.phone}, 数量: ${items.length}. ${warnings.join(',')}`,
        nzOnOk: () => {
          this.order.status = OrderStatus.COMMITED
          this.http.post<ApiRes<UserOrder>>(API_USER_ORDER_UPDATE, clearOrderField(this.order)).subscribe(updateRes => {
            this.router.navigate(['/user-order-list'])
          })
        }
      })
    })
  }
  isSameCar(a: OrderItem, b: OrderItem) {
    if (a.car) {
      if (b.car) {
        return a.car === b.car
      } else {
        return false
      }
    } else {
      if (b.car) {
        return false
      } else {
        return true
      }
    }
  }
  goBack() {
    this.router.navigate(['/user-order-list'])
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(query => {
      if (query.hasOwnProperty('readonly')) {
        this.readonly = true
      }
    })
    this.route.params.subscribe(params => {
      const id = params['id']
      if (id) {
        // edit or view
        this.http.get<ApiRes<{ order: UserOrder, items: OrderItem[], car: CarOrder }>>(`${API_USER_ORDER_DETAIL}/${id}`).subscribe(res => {
          if (res.data.car) {
            this.defaultCar = res.data.car
          }
          this.order = res.data.order
          this.orderSubject.pipe(debounceTime(1000)).subscribe(() => {
            this.http.post<ApiRes<UserOrder>>(API_USER_ORDER_UPDATE, clearOrderField(this.order)).subscribe(updateRes => { })
          })
          this.count = res.data.items.length
          for (const item of res.data.items) {
            const orderItemUploadSubject = new Subject<OrderItem>()
            orderItemUploadSubject.pipe(debounceTime(500)).subscribe(uploadItem => {
              this.doUpload(uploadItem)
            })
            this.weightCache[item.id] = item.weight.toString()
            item.status = '上传完成'
            item.subject = orderItemUploadSubject
            this.values.push(item)
          }
          if (!this.readonly) {
            // this.doAddEmptyItem()
          }
          this.refreshTableData()
        })
      } else {
        // new
        // this.doAddEmptyItem()
        this.http.post<ApiRes<UserOrder>>(API_USER_ORDER_INSERT, {}).subscribe(res => {
          this.order = res.data
          this.orderSubject.pipe(debounceTime(800)).subscribe(() => {
            this.http.post<ApiRes<UserOrder>>(API_USER_ORDER_UPDATE, this.order).subscribe(updateRes => { })
          })
        })
      }
    })
  }
}
