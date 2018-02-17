import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router'
import { AdminComponent } from './components/admin/admin.component';
import { HomeComponent } from './components/home/home.component';
import { UserOrderComponent } from './components/user-order/user-order.component';
import { UserOrderListComponent } from './components/user-order-list/user-order-list.component';
import { CarOrderComponent } from './components/car-order/car-order.component';
import { CarOrderListComponent } from './components/car-order-list/car-order-list.component';
import { UserOrderPayComponent } from './components/user-order-pay/user-order-pay.component';
import { CarOrderPayComponent } from './components/car-order-pay/car-order-pay.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'user-order-list', component: UserOrderListComponent },
  { path: 'new-user-order', component: UserOrderComponent },
  { path: 'user-order/:id', component: UserOrderComponent },
  { path: 'car-order-list', component: CarOrderListComponent },
  { path: 'new-car-order', component: CarOrderComponent },
  { path: 'car-order/:id', component: CarOrderComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'new-car-order', component: CarOrderComponent },
  { path: 'user-order-pay/:id', component: UserOrderPayComponent },
  { path: 'car-order-pay/:id', component: CarOrderPayComponent },
  { path: '**', redirectTo: 'home' },
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
