import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgZorroAntdModule } from 'ng-zorro-antd';

import { AppRoutingModule } from './/app-routing.module';
import { ApiCodeInterceptor } from './api/api-code.interceptor';
import { AppComponent } from './app.component';
import { AdminComponent } from './components/admin/admin.component';
import { CarOrderListComponent } from './components/car-order-list/car-order-list.component';
import { CarOrderPayComponent } from './components/car-order-pay/car-order-pay.component';
import { CarOrderComponent } from './components/car-order/car-order.component';
import { CarSelectorComponent } from './components/car-selector/car-selector.component';
import { HomeComponent } from './components/home/home.component';
import { PayPatternComponent } from './components/pay-pattern/pay-pattern.component';
import { UserOrderListComponent } from './components/user-order-list/user-order-list.component';
import { UserOrderPayComponent } from './components/user-order-pay/user-order-pay.component';
import { UserOrderComponent } from './components/user-order/user-order.component';
import { PopInuptComponent } from './components/pop-input/pop-inupt.component';
import { UserOrderPrintComponent } from './components/user-order-print/user-order-print.component';
import { CarOrderPrintComponent } from './components/car-order-print/car-order-print.component';

@NgModule({
  declarations: [
    AppComponent,
    UserOrderComponent,
    AdminComponent,
    HomeComponent,
    UserOrderComponent,
    UserOrderListComponent,
    CarOrderComponent,
    CarOrderListComponent,
    CarSelectorComponent,
    UserOrderPayComponent,
    CarOrderPayComponent,
    PayPatternComponent,
    PopInuptComponent,
    UserOrderPrintComponent,
    CarOrderPrintComponent,
  ],
  entryComponents: [
    CarSelectorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgZorroAntdModule.forRoot(),
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiCodeInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
