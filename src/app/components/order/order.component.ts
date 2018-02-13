import { HttpClient } from '@angular/common/http'
import { AfterViewInit, Component, Input, Output, OnInit, EventEmitter } from '@angular/core'
import { NzMessageService, NzModalService, NzModalSubject } from 'ng-zorro-antd'

@Component({
  selector: 'order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent {

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
