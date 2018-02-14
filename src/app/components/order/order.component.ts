import { HttpClient } from '@angular/common/http'
import { ActivatedRoute, Params } from '@angular/router'
import { Location } from '@angular/common'
import { AfterViewInit, Component, Input, Output, OnInit, EventEmitter } from '@angular/core'
import { NzMessageService, NzModalService, NzModalSubject } from 'ng-zorro-antd'
import 'rxjs/add/operator/switchMap'
import { OrderStatus, Order } from '../../model/egg.model';
import { ApiRes } from '../../model/api.model';
import { API_USER_ORDER_INSERT, API_USER_ORDER_UPDATE } from '../../api/egg.api';
import { Router } from '@angular/router'

@Component({
  selector: 'order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent {

  order: Order = {}
  values: Order[] = [{}]
  @Input()
  get data() {
    return this.values
  }
  set data(val: Order[]) {
    if (!val) val = []
    if (val.length === 0) {
      val.push({})
    }
    this.values = val
  }

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private subject: NzModalSubject,
    private http: HttpClient,
    private message: NzMessageService,
    private modal: NzModalService,
  ) { }

  isFinished() {
    return OrderStatus.FINISHED === this.order.status
  }
  modelChange(item: Order, index: number) {
    if (index === this.values.length - 1) {
      this.values.push({})
    }
    console.log(this.data)
  }
  remove(index: number) {
    if (this.data.length > 1) {
      this.data.splice(index, 1)
    }
  }
  inputFocus(item: Order, index: number) {
    if (index === this.values.length - 1) {
      this.values.push({})
    }
  }
  doUpload(item: Order, index: number) {
    console.log('up:', item, index)
  }
  doCommit() {
    this.modal.confirm({
      title: `确认提交`,
      content: `编号: ${this.order.id}, 姓名: ${this.order.seller}, 手机: ${this.order.phone}`,
      onOk: () => {
        this.order.status = OrderStatus.COMMITED
        this.http.post<ApiRes<Order>>(API_USER_ORDER_UPDATE, this.order).subscribe(res => {
          this.message.success('提交成功')
          this.router.navigate(['/order'])
        })
      }
    })
  }
  ngOnInit(): void {
    this.http.post<ApiRes<Order>>(API_USER_ORDER_INSERT, {}).subscribe(res => {
      this.order = res.data
    })
  }
  ngAfterViewInit(): void {
  }
}
