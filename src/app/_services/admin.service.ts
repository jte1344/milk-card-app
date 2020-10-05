import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { Classroom } from 'src/app/_models/classroom';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(
    private http: HttpClient
  ) { }

  getDrinkOrder(currentUser) {
    return this.http.get<any[]>(`${environment.apiUrl}/api/drinkOrder`);
  }

}
