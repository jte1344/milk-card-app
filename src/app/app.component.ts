import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './_services/authentication.service';
import { User } from './_models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public isMenuCollapsed = true;
  currentUser: User;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }


  isHomeRoute() {
    return this.router.url === '/';
  }
  isLoginRoute() {
    return this.router.url === '/login';
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
}
