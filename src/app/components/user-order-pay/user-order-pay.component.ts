import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/switchMap';

import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService, NzModalService, NzModalSubject } from 'ng-zorro-antd';

import { API_USER_ORDER_DETAIL, API_USER_ORDER_UPDATE } from '../../api/egg.api';
import { ApiRes } from '../../model/api.model';
import { CarOrder, clearOrderField, OrderItem, OrderStatus, UserOrder } from '../../model/egg.model';

@Component({
  templateUrl: './user-order-pay.component.html',
  styleUrls: ['./user-order-pay.component.css']
})
export class UserOrderPayComponent implements OnInit {

  order: UserOrder = {}
  values: OrderItem[] = []
  count = 0
  readonly = true
  tablePageIndex = 1
  tablePageSize = 10
  pageSizeSelectorValues = [10, 20, 30, 40, 50, 100, 200, 500]
  defaultCar: CarOrder
  popVisible = {}

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private subject: NzModalSubject,
    private http: HttpClient,
    private message: NzMessageService,
    private modal: NzModalService,
  ) { }

  descCar(car: CarOrder) {
    if (car) {
      return `单号: ${car.id}, 姓名: ${car.driver}, 日期: ${car.createdAt}`
    } else {
      return '未选择'
    }
  }
  itemIndex(index: number) {
    return (this.tablePageIndex - 1) * this.tablePageSize + index
  }
  isFinished() {
    return OrderStatus.FINISHED === this.order.status
  }
  doFinish() {
    this.modal.confirm({
      title: `确认完成`,
      content: `编号: ${this.order.id}, 姓名: ${this.order.seller}, 手机: ${this.order.phone}, 数量: ${this.values.length}.`,
      onOk: () => {
        this.http.post<ApiRes<UserOrder>>(API_USER_ORDER_UPDATE, clearOrderField(this.order)).subscribe(res => {
          this.order.status = OrderStatus.FINISHED
          this.message.success('操作成功')
        })
      }
    })
  }
  doPrint() {

  }
  goBack() {
    this.router.navigate(['/user-order-list'])
  }
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id']
      if (id) {
        this.http.get<ApiRes<{ order: UserOrder, items: OrderItem[], car: CarOrder }>>(`${API_USER_ORDER_DETAIL}/${id}`).subscribe(res => {
          if (res.data.car) {
            this.defaultCar = res.data.car
          }
          this.order = res.data.order
          this.count = res.data.items.length
          this.values = res.data.items
        })
      }
    })
  }
}
