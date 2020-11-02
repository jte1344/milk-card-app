import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../_services/authentication.service';
import { AdminService } from '../_services/admin.service';
import { Student } from '../_models/student';
import { User } from '../_models/user';


@Component({
  selector: 'app-add-student',
  templateUrl: './add-student.component.html',
  styleUrls: ['./add-student.component.scss']
})
export class AddStudentComponent implements OnInit {

  currentUser: User;
  students: any;
  id: string;
  currStudent: any;
  response: any;
  error: any;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private adminService: AdminService
  ) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }


  ngOnInit(): void {
    this.currStudent = {
      "id": "",
      "name": "",
      "email": "",
      "classID": "",
      "balance": "",
      "choice": "none"
    }
  }

  onSubmit() {


    console.log(this.currStudent);
    this.adminService.addStudent(this.currentUser, this.currStudent)
      .pipe(first())
      .subscribe(
        data => {
          this.response;
          this.router.navigate(['/students']);
        },
        error => {
          this.error = error;
        });
  }

}
