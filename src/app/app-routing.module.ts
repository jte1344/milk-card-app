import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AuthGuard } from 'src/app/_helpers/auth.guard';
import { ClassroomComponent } from './classroom/classroom.component';
import { DailyDrinkOrderComponent } from './daily-drink-order/daily-drink-order.component';

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'classroom/:id', component: ClassroomComponent, canActivate: [AuthGuard] },
  { path: 'getDrinkOrder', component: DailyDrinkOrderComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/404', pathMatch: 'full' },
  { path: '404', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
