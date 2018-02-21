import 'rxjs/add/operator/switchMap';

import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NzMessageService, NzModalService, NzModalSubject } from 'ng-zorro-antd';

import { API_USER_ORDER_DELETE, API_USER_ORDER_QUERY, API_USER_ORDER_UPDATE } from '../../api/egg.api';
import { ApiRes } from '../../model/api.model';
import { OrderStatus, UserOrder } from '../../model/egg.model';

@Component({
  templateUrl: './user-order-list.component.html',
  styleUrls: ['./user-order-list.component.css']
})
export class UserOrderListComponent implements OnInit {

  search: UserOrder = {}
  total = 0
  current = 1
  size = 10
  statusOptions = [
    { label: '新增', value: OrderStatus.NEW },
    { label: '待结算', value: OrderStatus.COMMITED },
    { label: '完成', value: OrderStatus.FINISHED },
    { label: '废弃', value: OrderStatus.DEPRECATED },
  ]
  list: UserOrder[] = []

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private subject: NzModalSubject,
    private http: HttpClient,
    private message: NzMessageService,
    private modal: NzModalService,
  ) { }

  doSearch() {
    this.current = 1
    this.load()
  }
  load() {
    this.http.post<ApiRes<UserOrder[]>>(API_USER_ORDER_QUERY, { ...this.search, current: this.current, size: this.size }).subscribe(res => {
      this.list = res.data.records
      this.total = res.data.total
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
  canBeDeprecated(item: UserOrder) {
    return item.status === OrderStatus.NEW
  }
  canEdit(item: UserOrder) {
    return item.status === OrderStatus.NEW
  }
  canView(item: UserOrder) {
    return item.status !== OrderStatus.NEW
  }
  canDeal(item: UserOrder) {
    return item.status === OrderStatus.COMMITED
  }
  canPrint(item: UserOrder) {
    return item.status === OrderStatus.FINISHED
  }
  canRestore(item: UserOrder) {
    return item.status === OrderStatus.DEPRECATED
  }
  doDeprecate(item: UserOrder) {
    // this.modal.confirm({
    //   title: '废弃',
    //   content: `确认废弃吗?`,
    //   onOk: () => {
    const order: UserOrder = { id: item.id, status: OrderStatus.DEPRECATED }
    this.http.post<ApiRes<UserOrder>>(API_USER_ORDER_UPDATE, order).subscribe(res => {
      this.message.success('更新成功')
      this.load()
    })
    //   }
    // })
  }
  doEdit(item: UserOrder) {
    this.router.navigate([`/user-order/${item.id}`])
  }
  doView(item: UserOrder) {
    const navigationExtras: NavigationExtras = {
      queryParams: { 'readonly': '' },
    };
    if (OrderStatus.FINISHED === item.status) {
      this.router.navigate([`/user-order-pay/${item.id}`], navigationExtras)
    } else {
      this.router.navigate([`/user-order/${item.id}`], navigationExtras)
    }
  }
  doPay(item: UserOrder) {
    this.router.navigate([`/user-order-pay/${item.id}`])
  }
  doPrint(item: UserOrder) {
    this.router.navigate([`/user-order-print/${item.id}`])
  }
  doRestore(item: UserOrder) {
    // this.modal.confirm({
    //   title: '恢复',
    //   content: `确认恢复吗?`,
    //   onOk: () => {
    const order: UserOrder = { id: item.id, status: OrderStatus.NEW }
    this.http.post<ApiRes<UserOrder>>(API_USER_ORDER_UPDATE, order).subscribe(res => {
      this.message.success('更新成功')
      this.load()
    })
    //   }
    // })
  }
  doDelete(item: UserOrder) {
    this.modal.confirm({
      title: '删除',
      content: `确认删除吗,删除后所有关联数据将不可找回?`,
      onOk: () => {
        const order: UserOrder = { id: item.id, status: OrderStatus.NEW }
        this.http.post<ApiRes<UserOrder>>(API_USER_ORDER_DELETE, order).subscribe(res => {
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
