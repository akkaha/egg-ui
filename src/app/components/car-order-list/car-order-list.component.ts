import 'rxjs/add/operator/switchMap'

import { Location } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router'
import { NzMessageService, NzModalService } from 'ng-zorro-antd'

import { API_CAR_ORDER_DELETE, API_CAR_ORDER_QUERY, API_CAR_ORDER_UPDATE } from '../../api/egg.api'
import { ApiRes } from '../../model/api.model'
import { CarOrder, OrderStatus } from '../../model/egg.model'

@Component({
  templateUrl: './car-order-list.component.html',
  styleUrls: ['./car-order-list.component.css']
})
export class CarOrderListComponent implements OnInit {

  search: CarOrder = {}
  total = 0
  current = 1
  size = 10
  statusOptions = [
    { label: '新增', value: OrderStatus.NEW },
    { label: '待结算', value: OrderStatus.COMMITED },
    { label: '完成', value: OrderStatus.FINISHED },
    { label: '废弃', value: OrderStatus.DEPRECATED },
  ]
  list: CarOrder[] = []
  countMap: { [key: number]: number } = {}

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private http: HttpClient,
    private message: NzMessageService,
    private modal: NzModalService,
  ) { }

  itemCount(item: CarOrder) {
    if (this.countMap) {
      const count = this.countMap[item.id]
      if (count) {
        return count
      } else {
        return 0
      }
    } else {
      return 0
    }
  }
  doSearch() {
    this.current = 1
    this.load()
  }
  load() {
    this.http.post<ApiRes<CarOrder[]>>(API_CAR_ORDER_QUERY, { ...this.search, current: this.current, size: this.size }).subscribe(res => {
      this.list = res.data.list
      this.total = res.data.total
      this.countMap = res.data['count']
    })
  }
  statusColor(status: string) {
    switch (status) {
      case OrderStatus.NEW:
        return 'blue'
      case OrderStatus.COMMITED:
        return 'red'
      case OrderStatus.FINISHED:
        return 'green'
      case OrderStatus.DEPRECATED:
        return ''
      default:
        return ''
    }
  }
  statusName(status: string) {
    switch (status) {
      case OrderStatus.NEW:
        return '新增'
      case OrderStatus.COMMITED:
        return '待结算'
      case OrderStatus.FINISHED:
        return '完成'
      case OrderStatus.DEPRECATED:
        return '废弃'
      default:
        return '未知'
    }
  }
  canBeDeprecated(item: CarOrder) {
    return item.status === OrderStatus.NEW
  }
  canEdit(item: CarOrder) {
    return item.status === OrderStatus.NEW
  }
  canView(item: CarOrder) {
    return item.status !== OrderStatus.NEW
  }
  canDeal(item: CarOrder) {
    return item.status === OrderStatus.COMMITED
  }
  canPrint(item: CarOrder) {
    return item.status === OrderStatus.FINISHED
  }
  canRestore(item: CarOrder) {
    return item.status === OrderStatus.DEPRECATED
  }
  doDeprecate(item: CarOrder) {
    const order: CarOrder = { id: item.id, status: OrderStatus.DEPRECATED }
    this.http.post<ApiRes<CarOrder>>(API_CAR_ORDER_UPDATE, order).subscribe(res => {
      this.message.success('更新成功')
      this.load()
    })
  }
  doEdit(item: CarOrder) {
    this.router.navigate([`/car-order/${item.id}`])
  }
  doView(item: CarOrder) {
    const navigationExtras: NavigationExtras = {
      queryParams: { 'readonly': '' },
    };
    if (OrderStatus.FINISHED === item.status) {
      this.router.navigate([`/car-order-pay/${item.id}`], navigationExtras)
    } else {
      this.router.navigate([`/car-order/${item.id}`], navigationExtras)
    }
  }
  doPay(item: CarOrder) {
    this.router.navigate([`/car-order-pay/${item.id}`])
  }
  doPrint(item: CarOrder) {
    this.router.navigate([`/car-order-print/${item.id}`])
  }
  doRestore(item: CarOrder) {
    const order: CarOrder = { id: item.id, status: OrderStatus.NEW }
    this.http.post<ApiRes<CarOrder>>(API_CAR_ORDER_UPDATE, order).subscribe(res => {
      this.message.success('更新成功')
      this.load()
    })
  }
  doDelete(item: CarOrder) {
    this.modal.confirm({
      nzTitle: '删除',
      nzContent: `确认删除吗,删除后所有关联数据将不可找回?`,
      nzOnOk: () => {
        const order: CarOrder = { id: item.id, status: OrderStatus.NEW }
        this.http.post<ApiRes<CarOrder>>(API_CAR_ORDER_DELETE, order).subscribe(res => {
          this.message.success('操作成功')
          this.load()
        })
      }
    })
  }
  ngOnInit(): void {
    this.load()
  }
}
