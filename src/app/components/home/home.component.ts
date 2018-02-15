import { HttpClient } from '@angular/common/http'
import { AfterViewInit, Component, Input, Output, OnInit, EventEmitter } from '@angular/core'
import { NzMessageService, NzModalService, NzModalSubject } from 'ng-zorro-antd'

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
})
export class HomeComponent {

  constructor(
    private subject: NzModalSubject,
    private http: HttpClient,
    private message: NzMessageService,
    private modal: NzModalService,
  ) { }

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
  }
}