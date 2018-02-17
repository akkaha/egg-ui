import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NzMessageService, NzModalService, NzModalSubject } from 'ng-zorro-antd';

@Component({
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {


  constructor(
    private subject: NzModalSubject,
    private http: HttpClient,
    private message: NzMessageService,
    private modal: NzModalService,
  ) { }

  ngOnInit(): void {
  }
}
