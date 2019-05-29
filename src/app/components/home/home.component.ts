import { HttpClient } from '@angular/common/http'
import { Component } from '@angular/core'
import { NzMessageService, NzModalService } from 'ng-zorro-antd'

@Component({
  templateUrl: './home.component.html',
})
export class HomeComponent {

  constructor(
    private http: HttpClient,
    private message: NzMessageService,
    private modal: NzModalService,
  ) { }

}
