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
  templateUrl: './car-order-pay.component.html',
})
export class CarOrderPayComponent implements OnInit {

  order: CarOrder = {}
  values: OrderItem[] = []
  count = 0
  readonly = true
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

  itemIndex(index: number) {
    return (this.tablePageIndex - 1) * this.tablePageSize + index
  }
  isFinished() {
    return OrderStatus.FINISHED === this.order.status
  }
  doFinish() {
    this.modal.confirm({
      title: `确认完成`,
      content: `编号: ${this.order.id}, 姓名: ${this.order.driver}, 手机: ${this.order.driverPhone}, 数量: ${this.values.length}.`,
      onOk: () => {
        this.http.post<ApiRes<CarOrder>>(API_CAR_ORDER_UPDATE, clearOrderField(this.order)).subscribe(res => {
          this.message.success('提交成功')
          this.order.status = OrderStatus.FINISHED
        })
      }
    })
  }
  doPrint() {

  }
  goBack() {
    this.router.navigate(['/car-order-list'])
  }
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id']
      if (id) {
        this.http.get<ApiRes<{ order: CarOrder, items: OrderItem[] }>>(`${API_CAR_ORDER_DETAIL}/${id}`).subscribe(res => {
          this.order = res.data.order
          this.count = res.data.items.length
          this.values = res.data.items
        })
      }
    })
  }
}
