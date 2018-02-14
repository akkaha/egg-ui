import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router'
import { OrderComponent } from './components/order/order.component';
import { AdminComponent } from './components/admin/admin.component';
import { HomeComponent } from './components/home/home.component';
import { CarComponent } from './components/car/car.component';

const routes: Routes = [
  { path: '**', redirectTo: 'home' },
  { path: '', component: HomeComponent },
  { path: 'order', component: OrderComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'car', component: CarComponent },
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
