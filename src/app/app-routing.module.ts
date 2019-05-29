import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { AdminComponent } from './components/admin/admin.component'
import { CarOrderListComponent } from './components/car-order-list/car-order-list.component'
import { CarOrderPayComponent } from './components/car-order-pay/car-order-pay.component'
import { CarOrderPrintComponent } from './components/car-order-print/car-order-print.component'
import { CarOrderComponent } from './components/car-order/car-order.component'
import { HomeComponent } from './components/home/home.component'
import { UserOrderListComponent } from './components/user-order-list/user-order-list.component'
import { UserOrderPayComponent } from './components/user-order-pay/user-order-pay.component'
import { UserOrderPrintComponent } from './components/user-order-print/user-order-print.component'
import { UserOrderComponent } from './components/user-order/user-order.component'

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
  { path: 'user-order-print/:id', component: UserOrderPrintComponent },
  { path: 'car-order-print/:id', component: CarOrderPrintComponent },
  { path: '**', redirectTo: 'home' },
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, { useHash: true })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
