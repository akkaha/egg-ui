import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/switchMap';

import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService, NzModalService, NzModalSubject } from 'ng-zorro-antd';

import { API_CAR_ORDER_PAY, API_CAR_ORDER_UPDATE } from '../../api/egg.api';
import { ApiRes } from '../../model/api.model';
import { CarOrder, clearOrderField, OrderBill, OrderStatus } from '../../model/egg.model';
import { printCarOrder } from '../../util/printutils';

@Component({
  templateUrl: './car-order-pay.component.html',
})
export class CarOrderPayComponent implements OnInit {

  order: CarOrder = {}
  bill: OrderBill = {
    items: [],
    priceRange: {}
  }
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
      content: `编号: ${this.order.id}, 姓名: ${this.order.driver}, 手机: ${this.order.driverPhone}, 数量: ${this.bill.totalCount}.`,
      onOk: () => {
        const toUpdate = clearOrderField(this.order)
        toUpdate.status = OrderStatus.FINISHED
        toUpdate.bill = JSON.stringify(this.bill)
        this.http.post<ApiRes<CarOrder>>(API_CAR_ORDER_UPDATE, toUpdate).subscribe(res => {
          this.message.success('提交成功')
          this.readonly = true
          this.order.status = OrderStatus.FINISHED
        })
      }
    })
  }
  doNew() {
    this.modal.confirm({
      title: `确认打回单号: ${this.order.id}`,
      content: `打回后状态变为 '新增', 需要重新提交.`,
      onOk: () => {
        this.order.status = OrderStatus.NEW
        this.http.post<ApiRes<CarOrder>>(API_CAR_ORDER_UPDATE, clearOrderField(this.order)).subscribe(res => {
          this.goBack()
        })
      }
    })
  }
  doPrint() {
    printCarOrder(this.order, this.bill)
  }
  doCalc(date: string) {
    this.http.get<ApiRes<OrderPayRes>>(`${API_CAR_ORDER_PAY}/${this.order.id}?date=${date}`).subscribe(res => {
      this.bill = res.data.bill
    })
  }
  goBack() {
    this.router.navigate(['/car-order-list'])
  }
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id']
      if (id) {
        this.http.get<ApiRes<OrderPayRes>>(`${API_CAR_ORDER_PAY}/${id}`).subscribe(res => {
          this.order = res.data.order
          this.bill = res.data.bill
        })
      }
    })
  }
}

interface OrderPayRes {
  order: CarOrder
  bill: OrderBill
}
