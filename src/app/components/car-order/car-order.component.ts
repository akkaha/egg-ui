import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/switchMap';

import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService, NzModalService, NzModalSubject } from 'ng-zorro-antd';
import { Subject } from 'rxjs/Subject';

import {
  API_CAR_ORDER_DETAIL,
  API_CAR_ORDER_INSERT,
  API_CAR_ORDER_UPDATE,
  API_ORDER_ITEM_DELETE,
  API_ORDER_ITEM_INSERT,
  API_ORDER_ITEM_UPDATE,
} from '../../api/egg.api';
import { ApiRes } from '../../model/api.model';
import { CarOrder, clearNewOrderItem, clearOrderField, DbStatus, OrderItem, OrderStatus } from '../../model/egg.model';

@Component({
  templateUrl: './car-order.component.html',
})
export class CarOrderComponent implements OnInit {

  orderSubject = new Subject()
  order: CarOrder = {}
  values: OrderItem[] = []
  count = 0
  weightCache: { [key: string]: string } = {}
  readonly = false
  tablePageIndex = 1
  tablePageSize = 10
  pageSizeSelectorValues = [10, 20, 30, 40, 50, 100, 200, 500]

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private subject: NzModalSubject,
    private http: HttpClient,
    private message: NzMessageService,
    private modal: NzModalService,
  ) { }

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
  itemChange(item: OrderItem, index: number) {
    if (index === this.values.length - 1) {
      this.doAddEmptyItem()
    }
    if (item.id) {
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
  remove(item: CarOrder, index: number) {
    if (item.id) {
      this.modal.confirm({
        title: '删除',
        content: '确认删除?',
        onOk: () => {
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
          const carRef = this.order.id
          if (carRef) {
            item.car = carRef
            item.dbStatus = DbStatus.CREATING
            item.status = '数据创建中...'
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
  doAddEmptyItem() {
    // one item to one suject to reduce conflict
    const orderItemUploadSubject = new Subject<OrderItem>()
    orderItemUploadSubject.debounceTime(500).subscribe(item => {
      this.doUpload(item)
    })
    this.values.push({ status: '待上传', subject: orderItemUploadSubject })
    this.refreshTableData()
  }
  doCommit() {
    this.http.get<ApiRes<{ order: CarOrder, items: OrderItem[] }>>(`${API_CAR_ORDER_DETAIL}/${this.order.id}`).subscribe(res => {
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
        if (!(dbItem && feItem.weight.toString() === dbItem.weight.toString())) {
          warnings.push(`前端: ${feItem.weight}, 数据库: ${dbItem ? dbItem.weight : 'null'}`)
        }
      }
      this.modal.confirm({
        title: `${warnings.length > 0 ? '数据异常, 请检查后' : ''}确认提交`,
        content: `编号: ${order.id}, 姓名: ${order.driver}, 手机: ${order.driverPhone}, 数量: ${items.length}. ${warnings.join(',')}`,
        onOk: () => {
          this.order.status = OrderStatus.COMMITED
          this.http.post<ApiRes<CarOrder>>(API_CAR_ORDER_UPDATE, clearOrderField(this.order)).subscribe(updateRes => {
            this.router.navigate(['/car-order-list'])
          })
        }
      })
    })
  }
  goBack() {
    this.router.navigate(['/car-order-list'])
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
        this.http.get<ApiRes<{ order: CarOrder, items: OrderItem[] }>>(`${API_CAR_ORDER_DETAIL}/${id}`).subscribe(res => {
          this.order = res.data.order
          this.orderSubject.debounceTime(1000).subscribe(() => {
            this.http.post<ApiRes<CarOrder>>(API_CAR_ORDER_UPDATE, clearOrderField(this.order)).subscribe(updateRes => { })
          })
          this.count = res.data.items.length
          for (const item of res.data.items) {
            const orderItemUploadSubject = new Subject<OrderItem>()
            orderItemUploadSubject.debounceTime(500).subscribe(upItem => {
              this.doUpload(upItem)
            })
            this.weightCache[item.id] = item.weight.toString()
            item.status = '上传完成'
            item.subject = orderItemUploadSubject
            this.values.push(item)
          }
          if (!this.readonly) {
            this.doAddEmptyItem()
          }
          this.refreshTableData()
        })
      } else {
        // new
        this.doAddEmptyItem()
        this.http.post<ApiRes<CarOrder>>(API_CAR_ORDER_INSERT, {}).subscribe(res => {
          this.order = res.data
          this.orderSubject.debounceTime(800).subscribe(() => {
            this.http.post<ApiRes<CarOrder>>(API_CAR_ORDER_UPDATE, clearOrderField(this.order)).subscribe(updateRes => { })
          })
        })
      }
    })
  }
}
