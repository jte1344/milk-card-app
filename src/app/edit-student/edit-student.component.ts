import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../_services/authentication.service';
import { AdminService } from '../_services/admin.service';
import { Student } from '../_models/student';
import { User } from '../_models/user';

@Component({
  selector: 'app-edit-student',
  templateUrl: './edit-student.component.html',
  styleUrls: ['./edit-student.component.scss']
})
export class EditStudentComponent implements OnInit {

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
      "id": "id",
      "name": "name",
      "email": "email",
      "classID": "classID",
      "balance": "balance",
      "choice": "choice"
    }
    this.id = this.route.snapshot.paramMap.get("id");
    this.adminService.getAllStudents(this.currentUser).pipe(first()).subscribe(response => {
      this.students = response;
      this.students.sort(function(a, b) {
        a = a.name.toLowerCase();
        b = b.name.toLowerCase();
        return a < b ? -1 : a > b ? 1 : 0;
      });
      this.currStudent = this.students.find(x => x.id == this.id);
      console.log(this.currStudent);
    });
  }

  onSubmit() {

    this.currStudent.balance = parseInt(this.currStudent.balance)
    this.adminService.postStudents(this.currentUser, this.students)
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
