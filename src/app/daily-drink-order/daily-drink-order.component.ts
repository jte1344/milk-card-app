import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../_services/authentication.service';
import { AdminService } from '../_services/admin.service';
import { User } from '../_models/user';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-daily-drink-order',
  templateUrl: './daily-drink-order.component.html',
  styleUrls: ['./daily-drink-order.component.scss']
})
export class DailyDrinkOrderComponent implements OnInit {

  currentUser: User;
  orders: any[];
  loading = false;

  dayName = new Date().toLocaleString("en-US", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    weekday: "long"
  });

  constructor(
    private authenticationService: AuthenticationService,
    private adminService: AdminService
  ) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit(): void {
    this.adminService.getDrinkOrder(this.currentUser).pipe(first()).subscribe(drinkOrders => {
      this.loading = false;
      this.orders = drinkOrders.data;
      this.orders.sort(function(a, b) {
        a = a.classroom.toLowerCase();
        b = b.classroom.toLowerCase();
        return a < b ? -1 : a > b ? 1 : 0;
      });

    });
  }

}