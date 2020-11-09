import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { Classroom } from 'src/app/_models/classroom';
import { Student } from '../_models/student';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(
    private http: HttpClient
  ) { }

  getDrinkOrder(currentUser) {
    return this.http.get<any>(`${environment.apiUrl}/api/drinkOrder`);
  }
  getDrinkOrderTotal(currentUser) {
    return this.http.get<any>(`${environment.apiUrl}/api/drinkOrderTotal`);
  }
  getAllStudents(currentUser) {
    return this.http.get<Student[]>(`${environment.apiUrl}/api/getStudents`);
  }
  addStudent(currentUser, data) {
    return this.http.post<any>(`${environment.apiUrl}/api/addStudent`, { currentUser, data });
  }
  postStudents(currentUser, data) {
    return this.http.post<any>(`${environment.apiUrl}/api/postStudents`, { currentUser, data });
  }

}
