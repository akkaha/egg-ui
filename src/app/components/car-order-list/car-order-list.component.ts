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
  selector: 'car-order-list',
  templateUrl: './car-order-list.component.html',
  styleUrls: ['./car-order-list.component.css']
})
export class CarOrderListComponent {

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
  canBeDeprecated(item: CarOrder) {
    return item.status === OrderStatus.NEW
  }
  canEdit(item: CarOrder) {
    return item.status === OrderStatus.NEW
  }
  canView(item: CarOrder) {
    return item.status !== OrderStatus.NEW
  }
  canDeal(item: CarOrder) {
    return item.status === OrderStatus.COMMITED
  }
  canRestore(item: CarOrder) {
    return item.status === OrderStatus.DEPRECATED
  }
  doDeprecate(item: CarOrder) {
    let order: CarOrder = { id: item.id, status: OrderStatus.DEPRECATED }
    this.http.post<ApiRes<CarOrder>>(API_CAR_ORDER_UPDATE, order).subscribe(res => {
      this.message.success('更新成功')
      this.load()
    })
  }
  doEdit(item: CarOrder) {
    this.router.navigate([`/car-order/${item.id}`])
  }
  doView(item: CarOrder) {
    let navigationExtras: NavigationExtras = {
      queryParams: { 'readonly': '' },
    };
    this.router.navigate([`/car-order/${item.id}`], navigationExtras)
  }
  doPay(item: CarOrder) {
    this.router.navigate([`/car-order-pay/${item.id}`])
  }
  doRestore(item: CarOrder) {
    let order: CarOrder = { id: item.id, status: OrderStatus.NEW }
    this.http.post<ApiRes<CarOrder>>(API_CAR_ORDER_UPDATE, order).subscribe(res => {
      this.message.success('更新成功')
      this.load()
    })
  }
  doDelete(item: CarOrder) {
    this.modal.confirm({
      title: '删除',
      content: `确认删除吗,删除后所有关联数据将不可找回?`,
      onOk: () => {
        let order: CarOrder = { id: item.id, status: OrderStatus.NEW }
        this.http.post<ApiRes<CarOrder>>(API_CAR_ORDER_DELETE, order).subscribe(res => {
          this.message.success('操作成功')
          this.load()
        })
      }
    })
  }
  ngOnInit(): void {
    this.load()
  }
  ngAfterViewInit(): void {
  }
}