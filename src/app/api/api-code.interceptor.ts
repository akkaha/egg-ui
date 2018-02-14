
import 'rxjs/add/observable/empty'
import 'rxjs/add/operator/catch'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable'
import { APICODE, ApiRes, ApiResObj } from '../model/api.model'
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http'
import { Injectable, Injector, isDevMode } from '@angular/core'
import { NzMessageService } from 'ng-zorro-antd'

@Injectable()
export class ApiCodeInterceptor implements HttpInterceptor {
    message: NzMessageService
    constructor(private inj: Injector) {
        this.message = this.inj.get(NzMessageService)
    }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.url.startsWith('./assets')) {
            return next.handle(req)
        } else {
            return next.handle(req).map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse && ~(event.status / 100) < 3) {
                    let res = event as HttpResponse<ApiResObj>
                    if (isDevMode()) {
                        console.log(req.url, res.body)
                    }
                    let code = res.body.code || res.body.Code
                    if (APICODE.NOT_LOGIN === code) {
                    } else if (APICODE.OK === code) {
                        return event
                    } else {
                        let errMsg = res.body.msg || res.body.Msg
                        this.message.error(errMsg)
                    }
                } else {
                    return event
                }
            }).catch((err: any, caught) => {
                if (err instanceof HttpErrorResponse) {
                    this.message.error(err.message)
                    return Observable.throw(err)
                }
            })
        }
    }
}
