import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/switchMap';

import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { NzMessageService, NzModalService, NzModalSubject } from 'ng-zorro-antd';

import { API_ORDER_BILL_INSERT, API_ORDER_BILL_QUERY } from '../../api/egg.api';
import { ApiRes, ApiResObj } from '../../model/api.model';
import { BillItem, OrderBill, PriceExtra } from '../../model/egg.model';
import { OrderPayRes } from '../user-order-pay/user-order-pay.component';

@Component({
  selector: 'app-pay-pattern',
  templateUrl: './pay-pattern.component.html',
  styleUrls: ['./pay-pattern.component.css']
})
export class PayPatternComponent implements OnInit {

  bill: OrderBill = {}
  _date: Date = null
  readonly = false
  priceEditable = false
  /** used for edit and update */
  prices: BillItem[] = []
  currentDate = ''
  missed: BillItem[] = []
  priceExtra: PriceExtra = {}
  missedWeights = ''

  @Input()
  set data(val: OrderPayRes) {
    this.bill = val.bill
    this.checkMissedWeights()
    if (this.bill && this.bill.priceRange) {
      const priceRange = this.bill.priceRange
      const tmpPrices: BillItem[] = []
      // tslint:disable-next-line:forin
      for (const k in priceRange) {
        tmpPrices.push({ weight: k, price: priceRange[k] })
      }
      this.prices = tmpPrices
    }
    if (this.bill && this.bill.date) {
      this._date = new Date(val.bill.date)
    } else {
      this._date = new Date()
    }
    if (val.priceExtra) {
      this.priceExtra = { ...val.priceExtra }
    }
  }
  @Output() calc: EventEmitter<string> = new EventEmitter()

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private subject: NzModalSubject,
    private http: HttpClient,
    private message: NzMessageService,
    private modal: NzModalService,
  ) { }

  dateChange() {
    const date = moment(this._date).format('YYYY-MM-DD')
    this.http.get<ApiRes<{ prices: BillItem[], priceExtra: PriceExtra }>>(`${API_ORDER_BILL_QUERY}/${date}`).subscribe(getRes => {
      this.prices = getRes.data.prices
      this.priceExtra = getRes.data.priceExtra
    })
  }
  checkMissedWeights() {
    if (this.bill) {
      const items = this.bill.items
      if (items) {
        const tmpMissed: BillItem[] = []
        items.forEach(item => {
          if (!item.price) {
            tmpMissed.push(item)
          }
        })
        this.missed = tmpMissed
        this.missedWeights = this.missed.map(item => item.weight).join(', ')
      }
    }
  }
  doSave() {
    const rangeReg = /^[1-9]\d{0,3}(\.\d{1}){0,1}$/
    for (const p of this.prices) {
      if (!rangeReg.test(p.weight) || !rangeReg.test(p.price)) {
        this.message.warning('格式错误,输入数字, 1.0 ~ 9999.9')
        return
      }
    }
    if (this.priceExtra.weightAdjust) {
      const boxReg = /^-?(0||[1-9]\d{0,3})(\.\d{1}){0,1}$/
      if (!boxReg.test(this.priceExtra.weightAdjust)) {
        this.message.warning('箱重格式错误,输入数字, -9999.9 ~ 9999.9')
        return
      }
    }
    const date = moment(this._date).format('YYYY-MM-DD')
    const data = { items: this.prices, priceExtra: this.priceExtra }
    this.http.post<ApiResObj>(`${API_ORDER_BILL_INSERT}/${date}`, data).subscribe(insertRes => {
      this.message.success(insertRes.msg)
      this.priceEditable = false
    })
  }
  doAddPrice() {
    this.prices.push({})
    this.prices = [...this.prices]
  }
  doCraete() {
    this.doAddPrice()
    this.doEdit()
  }
  doEdit() {
    this.priceEditable = true
  }
  doCalc() {
    this.calc.emit(moment(this._date).format('YYYY-MM-DD'))
  }
  hasPrice() {
    return this.prices.length > 0
  }
  remove(item: BillItem, index: number) {
    this.prices.splice(index, 1)
  }
  ngOnInit(): void {
    setInterval((() => {
      this.currentDate = moment().format('YYYY-MM-DD hh:mm:ss')
    }).bind(this), 1000)
    this.route.queryParams.subscribe(query => {
      if (query.hasOwnProperty('readonly')) {
        this.readonly = true
      }
    })
  }
}
