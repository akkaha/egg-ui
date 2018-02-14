import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router'
import { OrderComponent } from './components/order/order.component';
import { AdminComponent } from './components/admin/admin.component';
import { HomeComponent } from './components/home/home.component';
import { CarComponent } from './components/car/car.component';
import { PayComponent } from './components/pay/pay.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'order', component: OrderComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'car', component: CarComponent },
  { path: 'pay', component: PayComponent },
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
