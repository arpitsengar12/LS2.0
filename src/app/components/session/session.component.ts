import { Component } from '@angular/core';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss']
})
export class SessionComponent {
  selectedEmployeeId:any;
  save(){
    sessionStorage.setItem("userData", this.selectedEmployeeId);
  }
}
