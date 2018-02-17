import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http'
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './/app-routing.module';
import { AdminComponent } from './components/admin/admin.component';
import { HomeComponent } from './components/home/home.component';
import { PayComponent } from './components/pay/pay.component';
import { ApiCodeInterceptor } from './api/api-code.interceptor';
import { UserOrderComponent } from './components/user-order/user-order.component';
import { UserOrderListComponent } from './components/user-order-list/user-order-list.component';
import { CarOrderComponent } from './components/car-order/car-order.component';
import { CarOrderListComponent } from './components/car-order-list/car-order-list.component';
import { CarSelectorComponent } from './components/car-selector/car-selector.component';
import { UserOrderPayComponent } from './components/user-order-pay/user-order-pay.component';
import { CarOrderPayComponent } from './components/car-order-pay/car-order-pay.component';

@NgModule({
  declarations: [
    AppComponent,
    UserOrderComponent,
    AdminComponent,
    HomeComponent,
    PayComponent,
    UserOrderComponent,
    UserOrderListComponent,
    CarOrderComponent,
    CarOrderListComponent,
    CarSelectorComponent,
    UserOrderPayComponent,
    CarOrderPayComponent,
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