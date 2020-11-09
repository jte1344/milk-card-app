import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../_services/authentication.service';
import { AdminService } from '../_services/admin.service';
import { Student } from '../_models/student';
import { User } from '../_models/user';
import * as XLSX from 'xlsx';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit {

  @ViewChild('table') table: ElementRef;

  currentUser: User;
  currComment = '';
  closeResult = '';
  loading = false;
  students: any;
  willDownload = false;
  fileName: string;
  response: any;
  day = new Date().toLocaleString("en-US", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    day: "2-digit"
  })
  month = new Date().toLocaleString("en-US", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    month: "2-digit"
  })
  year = new Date().toLocaleString("en-US", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: "2-digit"
  })

  constructor(
    private authenticationService: AuthenticationService,
    private adminService: AdminService,
    private modalService: NgbModal
  ) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit(): void {
    this.adminService.getAllStudents(this.currentUser).pipe(first()).subscribe(response => {
      this.loading = false;
      this.students = response;
      this.students.sort(function(a, b) {
        a = a.name.toLowerCase();
        b = b.name.toLowerCase();
        return a < b ? -1 : a > b ? 1 : 0;
      });
      this.students.unshift({
        "id": "id",
        "name": "name",
        "email": "email",
        "classID": "classID",
        "balance": "balance",
        "choice": "choice",
        "FullComment": "comment",
        "comment": "comment"
      });

    });
  }

  fireEvent() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.table.nativeElement);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, `studentMilkCards_${this.month}-${this.day}-${this.year}.xlsx`);

  }

  onFileChange(ev) {
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    this.fileName = file.name;
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' });
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      this.students = jsonData.Sheet1;
      console.log(this.students);


    }
    reader.readAsBinaryString(file);
  }

  saveStudents() {
    console.log(this.students);
    this.adminService.postStudents(this.currentUser, this.students).pipe(first())
      .subscribe(
        data => {
          this.response = data;
        });
  }

  open(content, comment) {
    this.currComment = comment;
    this.modalService.open(content, { size: 'xl', centered: true, ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

}
