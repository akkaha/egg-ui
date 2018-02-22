import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/switchMap';

import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService, NzModalService, NzModalSubject } from 'ng-zorro-antd';

import { API_USER_ORDER_PAY } from '../../api/egg.api';
import { ApiRes } from '../../model/api.model';
import { CarOrder, DefaultPrintConfig, OrderBill, PrintConfig, UserOrder, BillItem } from '../../model/egg.model';
import { OrderPayRes } from '../user-order-pay/user-order-pay.component';

@Component({
  selector: 'app-user-order-print',
  templateUrl: './user-order-print.component.html',
  styleUrls: ['./user-order-print.component.css']
})
export class UserOrderPrintComponent implements OnInit {

  order: UserOrder = {}
  bill: OrderBill = {}
  car: CarOrder
  weightAdjustStr = ''

  values: BillItem[] = []

  cols = []
  rows = []
  empRows = []

  CONFIG_KEY = 'user-print-config'
  config: PrintConfig = DefaultPrintConfig

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private subject: NzModalSubject,
    private http: HttpClient,
    private message: NzMessageService,
    private modal: NzModalService,
  ) {
  }

  paddingStyle() {
    if (this.config && this.config.style) {
      const style = this.config.style
      return {
        'paddingTop': (style.top || '0') + 'mm',
        'paddingLeft': (style.left || '0') + 'mm',
        'paddingBottom': (style.bottom || '0') + 'mm',
        'paddingRight': (style.right || '0') + 'mm',
      }
    } else {
      return {}
    }
  }
  saveToLocal() {
    try {
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(this.config))
    } catch (error) {
      console.log(error)
    }
  }
  restoreFromLocal() {
    try {
      const str = localStorage.getItem(this.CONFIG_KEY)
      if (str) {
        const config: PrintConfig = JSON.parse(str)
        if (config.colCount) {
          let num = parseInt(config.colCount.toString(), 10)
          if (num <= 0 || Number.isNaN(num)) {
            num = 10
            config.colCount = num
            this.saveToLocal()
          } else {
            config.colCount = num
          }
        } else {
          config.colCount = DefaultPrintConfig.colCount
        }
        if (config.empRowCount) {
          let num = parseInt(config.empRowCount.toString(), 10)
          if (num < 0 || Number.isNaN(num)) {
            num = 0
            config.empRowCount = num
            this.saveToLocal()
          } else {
            config.empRowCount = num
          }
        } else {
          config.empRowCount = DefaultPrintConfig.empRowCount
        }
        if (!config.style) {
          config.style = {}
        }
        this.config = config
      }
    } catch (error) {
      console.log(error)
    }
    this.cols.length = this.config.colCount
    this.empRows.length = this.config.empRowCount
  }
  empRowCountChange() {
    let num = 0
    try {
      num = parseInt(this.config.empRowCount.toString(), 10)
      if (num < 0 || Number.isNaN(num)) {
        num = 0
      }
    } catch (error) {
      num = 0
    }
    this.config.empRowCount = num
    this.empRows.length = num
    this.saveToLocal()
  }
  colCountChange() {
    let num = 10
    try {
      num = parseInt(this.config.colCount.toString(), 10)
      if (num <= 0 || Number.isNaN(num)) {
        num = 10
      }
    } catch (error) {
      num = 10
    }
    this.cols.length = num
    this.rows.length = Math.ceil(this.values.length / num)
    this.saveToLocal()
  }
  w(r: number, c: number) {
    const i = r * this.config.colCount + c
    const item = this.values[i]
    if (item) {
      if (this.config.showItemPrice) {
        return `${item.weight} - ${item.price}元`
      } else {
        return item.weight
      }
    } else {
      return ''
    }
  }
  print() {
    window.print()
  }
  goBack() {
    this.location.back()
  }
  ngOnInit(): void {
    this.restoreFromLocal()
    this.route.params.subscribe(params => {
      const id = params['id']
      if (id) {
        this.http.get<ApiRes<OrderPayRes>>(`${API_USER_ORDER_PAY}/${id}`).subscribe(res => {
          if (res.data.car) {
            this.car = res.data.car
          }
          this.order = res.data.order
          this.bill = res.data.bill
          if (this.bill) {
            if (this.bill.priceExtra) {
              const extra = this.bill.priceExtra
              if (extra.weightAdjust) {
                if (extra.weightAdjust.startsWith('-')) {
                  this.weightAdjustStr = extra.weightAdjust
                } else {
                  this.weightAdjustStr = `+${extra.weightAdjust}`
                }
              }
            }
            if (this.bill.items) {
              const items = this.bill.items
              this.values = items
              this.rows.length = Math.ceil(this.values.length / this.config.colCount)
            }
          }
        })
      }
    })
  }
}
