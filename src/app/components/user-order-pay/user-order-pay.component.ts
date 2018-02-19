import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/switchMap';

import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService, NzModalService, NzModalSubject } from 'ng-zorro-antd';

import { API_USER_ORDER_PAY, API_USER_ORDER_UPDATE } from '../../api/egg.api';
import { ApiRes } from '../../model/api.model';
import { CarOrder, clearOrderField, OrderBill, OrderStatus, UserOrder } from '../../model/egg.model';

@Component({
  templateUrl: './user-order-pay.component.html',
  styleUrls: ['./user-order-pay.component.css']
})
export class UserOrderPayComponent implements OnInit {

  order: UserOrder = {}
  bill: OrderBill = {
    items: [],
    priceRange: {}
  }
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
      content: `编号: ${this.order.id}, 姓名: ${this.order.seller}, 手机: ${this.order.phone}, 数量: ${this.bill.totalCount}.`,
      onOk: () => {
        const toUpdate = clearOrderField(this.order)
        toUpdate.status = OrderStatus.FINISHED
        toUpdate.bill = JSON.stringify(this.bill)
        this.http.post<ApiRes<UserOrder>>(API_USER_ORDER_UPDATE, toUpdate).subscribe(res => {
          this.order.status = OrderStatus.FINISHED
          this.readonly = true
          this.message.success('操作成功')
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
        this.http.post<ApiRes<UserOrder>>(API_USER_ORDER_UPDATE, clearOrderField(this.order)).subscribe(res => {
          this.goBack()
        })
      }
    })
  }
  doPrint() {

  }
  doCalc(date: string) {
    this.http.get<ApiRes<OrderPayRes>>(`${API_USER_ORDER_PAY}/${this.order.id}?date=${date}`).subscribe(res => {
      this.bill = res.data.bill
    })
  }
  goBack() {
    this.router.navigate(['/user-order-list'])
  }
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id']
      if (id) {
        this.http.get<ApiRes<OrderPayRes>>(`${API_USER_ORDER_PAY}/${id}`).subscribe(res => {
          if (res.data.car) {
            this.defaultCar = res.data.car
          }
          this.order = res.data.order
          this.bill = res.data.bill
        })
      }
    })
  }
}

interface OrderPayRes {
  order: UserOrder
  bill: OrderBill
  car: CarOrder
}
