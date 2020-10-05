import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../_services/authentication.service';
import { StudentService } from '../_services/student.service';
import { Student } from '../_models/student';
import { ClassService } from '../_services/class.service';
import { Classroom } from '../_models/classroom';
import { Order } from '../_models/order';
import { User } from '../_models/user';

@Component({
  selector: 'app-classroom',
  templateUrl: './classroom.component.html',
  styleUrls: ['./classroom.component.scss']
})
export class ClassroomComponent implements OnInit {


  loading = false;
  currentUser: User;
  id: string;
  students: Student[];
  classroom: Classroom;
  drinkOrder: any[];
  status = false;
  response: {
    res: string,
    msg: string
  };

  dayName = new Date().toLocaleString("en-US", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    weekday: "long"
  });


  constructor(
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private studentService: StudentService,
    private classService: ClassService
  ) {
    //if you need user data on the page
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit(): void {
    this.classroom = {
      id: 0,
      teacherName: '',
      level: ''
    };
    this.loading = true;
    this.id = this.route.snapshot.paramMap.get("id");
    this.studentService.getClassroom(this.currentUser, this.id).pipe(first()).subscribe(student => {
      this.loading = false;
      this.students = student;
    });
    this.classService.getClassroom(this.currentUser, this.id).pipe(first()).subscribe(room => {
      this.loading = false;
      this.classroom = room;
    });

  }

  submitOrder() {
    this.classService.postOrder(this.currentUser, this.students)
    .pipe(first())
      .subscribe(
        data => {
          this.response = data;
        },
        error => {
          this.error = error;
          this.loading = false;
        });
  }


}
