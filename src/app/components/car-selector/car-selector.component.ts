import { HttpClient } from '@angular/common/http'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'
import { Location } from '@angular/common'
import { AfterViewInit, Component, Input, Output, OnInit, EventEmitter } from '@angular/core'
import { NzMessageService, NzModalService, NzModalSubject } from 'ng-zorro-antd'
import 'rxjs/add/operator/switchMap'
import { CarOrder, OrderStatus } from '../../model/egg.model';
import { ApiRes } from '../../model/api.model';
import { API_CAR_ORDER_QUERY, API_CAR_ORDER_UPDATE, API_CAR_ORDER_DELETE } from '../../api/egg.api';

@Component({
  selector: 'car-selector',
  templateUrl: './car-selector.component.html',
  styleUrls: ['./car-selector.component.css']
})
export class CarSelectorComponent {

  search: CarOrder = {}
  total: number = 0
  current: number = 1
  size: number = 10
  statusOptions = [
    { label: '新增', value: OrderStatus.NEW },
    { label: '待结算', value: OrderStatus.COMMITED },
    { label: '完成', value: OrderStatus.FINISHED },
    { label: '废弃', value: OrderStatus.DEPRECATED },
  ]
  list: CarOrder[] = [{}]

  default: CarOrder = {}
  notifier: (order: CarOrder) => void = null

  @Input()
  set data(data: CarOrder) {
    if (data) {
      this.default = data
    }
  }
  @Input()
  set onSelect(fun: (order: CarOrder) => void) {
    this.notifier = fun
  }

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
    this.http.post<ApiRes<CarOrder[]>>(API_CAR_ORDER_QUERY, { ...this.search, current: this.current, size: this.size }).subscribe(res => {
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
  canSelect(item: CarOrder) {
    return item.status === OrderStatus.NEW || item.status === OrderStatus.COMMITED
  }
  doSelect(item: CarOrder) {
    this.default = item
    if (this.notifier) {
      this.notifier(item)
    }
    this.subject.destroy('onOk')
  }
  ngOnInit(): void {
    this.load()
  }
  ngAfterViewInit(): void {
  }
}