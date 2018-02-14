import { HttpClient } from '@angular/common/http'
import { ActivatedRoute, Params } from '@angular/router'
import { Location } from '@angular/common'
import { AfterViewInit, Component, Input, Output, OnInit, EventEmitter } from '@angular/core'
import { NzMessageService, NzModalService, NzModalSubject } from 'ng-zorro-antd'
import 'rxjs/add/operator/switchMap'
import { Order, OrderStatus } from '../../model/egg.model';

@Component({
  selector: 'order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent {

  search: Order = {}
  current: number = 1
  total: number = 0
  statusOptions = [
    { label: '新建的', value: OrderStatus.NEW },
    { label: '提交,待结算', value: OrderStatus.COMMITED },
    { label: '结算完成', value: OrderStatus.FINISHED },
  ]
  list: Order[] = [{}]

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private subject: NzModalSubject,
    private http: HttpClient,
    private message: NzMessageService,
    private modal: NzModalService,
  ) { }

  remove(index: number) {
  }
  load() {

  }
  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
  }

}