import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { Student } from 'src/app/_models/student';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  constructor(
    private http: HttpClient
  ) { }

  getAll(currentUser) {
    return this.http.get<Student[]>(`${environment.apiUrl}/api/students?token=${currentUser.token}`);
  }
  getClassroom(currentUser, classID) {
    return this.http.get<Student[]>(`${environment.apiUrl}/api/students?token=${currentUser.token}&classID=${classID}`);
  }

}
