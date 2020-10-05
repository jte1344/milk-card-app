import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { AuthenticationService } from '../_services/authentication.service';
import { ClassService } from '../_services/class.service';
import { Classroom } from '../_models/classroom';
import { AdminService } from '../_services/admin.service';
import { User } from '../_models/user';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  currentUser: User;
  loading = false;
  classrooms: Classroom[];

  constructor(
    private router: Router,
    private viewportScroller: ViewportScroller,
    private authenticationService: AuthenticationService,
    private classService: ClassService
  ) {
    //if you need user data on the page
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit(): void {
    this.loading = true;
    this.classService.getAll(this.currentUser).pipe(first()).subscribe(classroom => {
      this.loading = false;
      this.classrooms = classroom;
    });
  }

  onClick(elementId: string): void {
    this.viewportScroller.scrollToAnchor(elementId);
  }
}
