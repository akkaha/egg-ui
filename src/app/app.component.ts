import { HttpClient } from '@angular/common/http'
import { AfterViewInit, Component, Input, Output, OnInit, EventEmitter } from '@angular/core'
import { NzMessageService, NzModalService, NzModalSubject } from 'ng-zorro-antd'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(
    private subject: NzModalSubject,
    private http: HttpClient,
    private message: NzMessageService,
    private modal: NzModalService,
  ) { }

  newOrder() {
    this.message.info('new order')

  }
}
