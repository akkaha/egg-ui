import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NzMessageService, NzModalService, NzModalSubject } from 'ng-zorro-antd';

import { canSpeack, speak, stopSpeak } from '../../util/speach-recognition-synthesis';

@Component({
  selector: 'app-pop-input',
  templateUrl: './pop-inupt.component.html',
  styleUrls: ['./pop-inupt.component.css']
})
export class PopInuptComponent implements OnInit {

  weight = ''
  sound = true
  soundStyle = {
    paddingLeft: '2px',
    fontSize: 'large',
    color: 'darkgreen',
    cursor: 'pointer',
  }

  @Output() enter = new EventEmitter<string>()

  constructor(
    private subject: NzModalSubject,
    private http: HttpClient,
    private message: NzMessageService,
    private modal: NzModalService,
  ) { }

  soundClick() {
    this.sound = !this.sound
    if (this.sound) {
      if (canSpeack()) {
        this.soundStyle.color = 'darkgreen'
      } else {
        this.sound = false
        this.soundStyle.color = 'darkgray'
        this.message.warning('软件不支持播放')
      }
    } else {
      this.soundStyle.color = 'darkgray'
    }
  }
  keyEnter() {
    const r = /^[1-9]\d{0,3}(\.\d{1}){0,1}$/
    if (r.test(this.weight)) {
      this.enter.emit(this.weight)
      if (this.sound) {
        stopSpeak()
        speak(this.weight, { rate: 1.3 })
      }
      this.weight = ''
    } else {
      if (this.sound) {
        stopSpeak()
        speak(`${this.weight}  俺  不认识, 请输入 从一 到 九千九百九十九点九 的数字`, { rate: 1.3 })
      } else {
        this.message.error('格式错误, 输入: 1.0 ~ 9999.9')
      }
    }
  }
  ngOnInit(): void {
    if (canSpeack()) {
      this.sound = true
      this.soundStyle.color = 'darkgreen'
    } else {
      this.sound = false
      this.soundStyle.color = 'darkgray'
    }
  }
}
