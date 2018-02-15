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
import { CarComponent } from './components/car/car.component';
import { PayComponent } from './components/pay/pay.component';
import { ApiCodeInterceptor } from './api/api-code.interceptor';
import { UserOrderComponent } from './components/user-order/user-order.component';
import { UserOrderListComponent } from './components/user-order-list/user-order-list.component';

@NgModule({
  declarations: [
    AppComponent,
    UserOrderComponent,
    AdminComponent,
    HomeComponent,
    CarComponent,
    PayComponent,
    UserOrderComponent,
    UserOrderListComponent,
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