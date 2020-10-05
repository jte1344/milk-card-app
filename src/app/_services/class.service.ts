import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { Classroom } from 'src/app/_models/classroom';

@Injectable({
  providedIn: 'root'
})
export class ClassService {

  constructor(
    private http: HttpClient
  ) { }

  getAll(currentUser) {
    return this.http.get<Classroom[]>(`${environment.apiUrl}/api/classes?token=${currentUser.token}`);
  }
  getClassroom(currentUser, classID) {
    return this.http.get<Classroom>(`${environment.apiUrl}/api/classes?token=${currentUser.token}&classID=${classID}`);
  }
  postOrder(currentUser, students) {
    return this.http.post<any>(`${environment.apiUrl}/api/postOrder`, { currentUser, students });
  }

}
