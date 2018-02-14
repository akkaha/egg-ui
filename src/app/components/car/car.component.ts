import { HttpClient } from '@angular/common/http'
import { AfterViewInit, Component, Input, Output, OnInit, EventEmitter } from '@angular/core'
import { NzMessageService, NzModalService, NzModalSubject } from 'ng-zorro-antd'

@Component({
  selector: 'car',
  templateUrl: './car.component.html',
})
export class CarComponent {

  order: Order = {
    id: 123456,
    count: 34
  }
  values: KeyValueObject[] = [{}]
  @Input()
  get data() {
    return this.values
  }
  set data(val: KeyValueObject[]) {
    if (!val) val = []
    if (val.length === 0) {
      val.push({})
    }
    this.values = val
  }
  @Output()
  dataChange = new EventEmitter<KeyValueObject[]>()

  constructor(
    private subject: NzModalSubject,
    private http: HttpClient,
    private message: NzMessageService,
    private modal: NzModalService,
  ) { }

  isFinished() {
    return OrderStatus.FINISHED === this.order.status
  }
  modelChange(item: KeyValueObject, index: number) {
    if (item.enabled === undefined) {
      item.enabled = true
    }
    if (index === this.values.length - 1) {
      this.values.push({})
    }
    this.dataChange.emit(this.data)
    console.log(this.data)
  }
  remove(index: number) {
    if (this.data.length > 1) {
      this.data.splice(index, 1)
      this.dataChange.emit(this.data)
    }
  }
  inputFocus(item: KeyValueObject, index: number) {
    if (index === this.values.length - 1) {
      this.values.push({})
    }
  }
  doUpload(item: KeyValueObject, index: number) {
    console.log('up:', item, index)
  }
  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
  }
}

export interface KeyValueObject {
  key?: string
  value?: string
  enabled?: boolean
}

export interface Order {
  id?: number
  name?: string
  phone?: string
  count?: number
  status?: string
}

export const OrderStatus = {
  EDITING: 'EDITING',
  FINISHED: 'FINISHED',
}