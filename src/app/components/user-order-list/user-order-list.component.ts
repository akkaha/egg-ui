import { HttpClient } from '@angular/common/http'
import { ActivatedRoute, Params } from '@angular/router'
import { Location } from '@angular/common'
import { AfterViewInit, Component, Input, Output, OnInit, EventEmitter } from '@angular/core'
import { NzMessageService, NzModalService, NzModalSubject } from 'ng-zorro-antd'
import 'rxjs/add/operator/switchMap'
import { UserOrder, OrderStatus } from '../../model/egg.model';
import { ApiRes } from '../../model/api.model';
import { API_USER_ORDER_QUERY } from '../../api/egg.api';

@Component({
  selector: 'user-order-list',
  templateUrl: './user-order-list.component.html',
  styleUrls: ['./user-order-list.component.css']
})
export class UserOrderListComponent {

  search: UserOrder = {}
  total: number = 0
  current: number = 1
  size: number = 10
  statusOptions = [
    { label: '新增', value: OrderStatus.NEW },
    { label: '待结算', value: OrderStatus.COMMITED },
    { label: '完成', value: OrderStatus.FINISHED },
    { label: '废弃的', value: OrderStatus.DEPRECATED },
  ]
  list: UserOrder[] = [{}]

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
  ngOnInit(): void {
    this.load()
  }
  ngAfterViewInit(): void {
  }
}