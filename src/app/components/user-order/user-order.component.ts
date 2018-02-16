import { HttpClient } from '@angular/common/http'
import { ActivatedRoute, Params } from '@angular/router'
import { Location } from '@angular/common'
import { AfterViewInit, Component, Input, Output, OnInit, EventEmitter } from '@angular/core'
import { NzMessageService, NzModalService, NzModalSubject } from 'ng-zorro-antd'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/operator/debounceTime'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/switchMap'
import { OrderStatus, UserOrder, OrderItem, clearNewOrderItem, DbStatus } from '../../model/egg.model';
import { ApiRes } from '../../model/api.model';
import { API_USER_ORDER_INSERT, API_USER_ORDER_UPDATE, API_ORDER_ITEM_INSERT, API_ORDER_ITEM_UPDATE, API_ORDER_ITEM_DELETE, API_USER_ORDER_DETAIL } from '../../api/egg.api';
import { Router } from '@angular/router'
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'user-order',
  templateUrl: './user-order.component.html',
  styleUrls: ['./user-order.component.css']
})
export class UserOrderComponent {

  orderSubject = new Subject()
  order: UserOrder = {}
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
    let r = /^[1-9]\d{0,3}(\.\d{1}){0,1}$/
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
          let user = this.order.id
          if (user) {
            item.user = user
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
    for (let o of this.values) {
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
    let orderItemUploadSubject = new Subject<OrderItem>()
    orderItemUploadSubject.debounceTime(500).subscribe(item => {
      this.doUpload(item)
    })
    this.values.push({ status: '待上传', subject: orderItemUploadSubject })
    this.refreshTableData()
  }
  doCommit() {
    this.http.get<ApiRes<{ order: UserOrder, items: OrderItem[] }>>(`${API_USER_ORDER_DETAIL}/${this.order.id}`).subscribe(res => {
      let order = res.data.order
      let items = res.data.items
      let feItems = this.values.filter(item => {
        if (item.id) {
          return true
        } else {
          return false
        }
      })
      let warnings = []
      if (feItems.length !== items.length) {
        warnings.push('数量不一致')
      }
      for (let i = 0; i < feItems.length; ++i) {
        let feItem = feItems[i]
        let dbItem = items[i]
        if (!(dbItem && feItem.weight.toString() === dbItem.weight.toString())) {
          warnings.push(`前端: ${feItem.weight}, 数据库: ${dbItem ? dbItem.weight : 'null'}`)
        }
      }
      this.modal.confirm({
        title: `${warnings.length > 0 ? '数据异常, 请检查后' : ''}确认提交`,
        content: `编号: ${order.id}, 姓名: ${order.seller}, 手机: ${order.phone}, 数量: ${items.length}. ${warnings.join(',')}`,
        onOk: () => {
          this.order.status = OrderStatus.COMMITED
          this.http.post<ApiRes<UserOrder>>(API_USER_ORDER_UPDATE, this.order).subscribe(res => {
            this.message.success('提交成功')
            this.router.navigate(['/user-order-list'])
          })
        }
      })
    })
  }
  goBack() {
    this.location.back()
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(query => {
      if (query.hasOwnProperty('readonly')) {
        this.readonly = true
      }
    })
    this.route.params.subscribe(params => {
      let id = params['id']
      if (id) {
        // edit or view
        this.http.get<ApiRes<{ order: UserOrder, items: OrderItem[] }>>(`${API_USER_ORDER_DETAIL}/${id}`).subscribe(res => {
          this.order = res.data.order
          this.orderSubject.debounceTime(1000).subscribe(() => {
            this.http.post<ApiRes<UserOrder>>(API_USER_ORDER_UPDATE, this.order).subscribe(res => { })
          })
          this.count = res.data.items.length
          for (let item of res.data.items) {
            let orderItemUploadSubject = new Subject<OrderItem>()
            orderItemUploadSubject.debounceTime(500).subscribe(item => {
              this.doUpload(item)
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
        this.http.post<ApiRes<UserOrder>>(API_USER_ORDER_INSERT, {}).subscribe(res => {
          this.order = res.data
          this.orderSubject.debounceTime(800).subscribe(() => {
            this.http.post<ApiRes<UserOrder>>(API_USER_ORDER_UPDATE, this.order).subscribe(res => { })
          })
        })
      }
    })
  }
  ngAfterViewInit(): void {
  }
}
