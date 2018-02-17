import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { NzMessageService, NzModalService, NzModalSubject } from 'ng-zorro-antd';

@Component({
  templateUrl: './home.component.html',
})
export class HomeComponent {

  constructor(
    private subject: NzModalSubject,
    private http: HttpClient,
    private message: NzMessageService,
    private modal: NzModalService,
  ) { }

}
